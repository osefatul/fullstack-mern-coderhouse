import { useEffect, useState, useRef, useCallback } from 'react';
import { useStateWithCallback } from './useStateWithCallback';
import socketInit from "../socket"
import freeice from "freeice"


export const useWebRTC = (roomId, user) =>{
    const [clients, setClients] = useStateWithCallback([])
    
    const audioElements = useRef({})
    const connections = useRef({})
    const localMediaStream = useRef(null)
    const socket = useRef(null)
    
    const provideRef = (instance, userId) =>{
        audioElements.current[userId] = instance
    }


    useEffect(()=>{
        socket.current = socketInit()
    },[])


    //Why do use useCallback: prevent the function from being recreated unless necessary. unless it's necessary.
    const addNewClient = useCallback(
        (newClient, cb) => 
        {
            const lookingFor = clients.find(
                client => client.id === newClient.id
            )

            if(lookingFor === undefined){
                setClients (
                    existingClients => [...existingClients, newClient],
                    cb
                )
            }
        }, [clients, setClients]
    )
    


    //CAPTURE OUR MIC
    useEffect(()=>{

        const startCapture = async ()=>{
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({audio:true})
        }

        startCapture().then(()=>{
            addNewClient(user, ()=>{
                const localElement = audioElements.current[user.id];
                if(localElement) {
                    localElement.volume = 0;//OTHERWISE WE WILL HEAR OUR OWN VOICE
                    localElement.srcObject = localMediaStream.current;
                }

                //ONCE WE ADD CLIENT WE SENT IT TO WEBSOCKET.
                //CONNECT OR JOIN WEB_SOCKET SERVER FOR THE FIRST TIME.
                socket.current.emit("JOIN", {roomId, user})
            })
        })

    },[])



    useEffect(()=>{
        //The first party who is connecting and creating a group will create an offer.
        const handleNewPeer  = async ({peerId, createOffer, user:remoteUser})=>{
            if(peerId === connections.current){
                return console.warn(`You are already connected with ${peerId} (${user.name})`);
            }

            //Establish RTC connection
            connections.current[peerId] = new RTCPeerConnection({
                //asking local machine what is your public id so we can send it to other clients
                iceServers: freeice()
            })

            //Handle new ice candidate: 
            connections.current[peerId].onicecandidate = event => {
                //whenever new candidates is coming up we need to send them to others
                socket.current.emit("RELAY_ICE", {
                    peerId,
                    icecandidate: event.candidate
                })
            }


            //handle when data or streams is coming on this connection
            //check the stream of other users.
            connections.current[peerId].ontrack = ({
                streams: [remoteStream]
            }) =>{
                addNewClient (remoteUser, ()=>{
                    //check if audio element is ready/rendered

                    // if yes then attach stream
                    if(audioElements.current[remoteUser.id]){
                        audioElements.current[remoteUser.id].srcObject = remoteStream

                    } 
                    //otherwise loop each second till it gets rendered or ready.
                    else {
                        let settled = false;
                        const interval = setInterval(()=>{
                            if(audioElements.current[remoteUser.id]){
                                audioElements.current[remoteUser.id].srcObject = remoteStream
                                settled = true;
                            }

                            if(settled){
                                clearInterval(interval)
                            }
                        }, 1000)
                    }
                })
            }


            //Add local or our own audio track to remote connections
            localMediaStream.current.getTracks().forEach(track =>{
                connections.current[peerId].addTrack(
                    track,
                    localMediaStream.current
                )
            })


            //Create Offer
            if(createOffer){
                const offer = await connections.current[peerId].createOffer()

                //send offer to another client
                socket.current.emit('RELAY_SDP', {
                    peerId,
                    sessionDescription: offer
                })
            }
        }

        socket.current.emit("ADD_PEER", handleNewPeer)

        return () =>{
            socket.current.off("ADD_PEER")
        }
    },[])


    return {clients, provideRef}
}
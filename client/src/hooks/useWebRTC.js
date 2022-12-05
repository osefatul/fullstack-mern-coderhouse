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


        //When user leaves the room
        return () => {
            localMediaStream.current.getTracks().forEach(track => track.stop())
            socket.current.emit("LEAVE", {
                
            })
        }

    },[])



    useEffect(()=>{
        //The first party who is connecting and creating a group will create an offer.
        const handleNewPeer  = async ({peerId, createOffer, user:remoteUser})=>{

            //if client is already in the connections object then go no further...
            if(peerId === connections.current){
                //connections is an obj where socketId is key and connection of webRTC is the value
                return console.warn(`You are already connected with ${peerId} (${user.name})`);
            }

            //Otherwise, You need to Establish RTC connection
            connections.current[peerId] = new RTCPeerConnection({
                //asking local machine what is your public id so we can send it to other clients
                iceServers: freeice()
            })

            //Handle new ice candidate: 
            connections.current[peerId].onicecandidate = event => {
                //whenever new candidates is coming up we need to send them to other clients.
                socket.current.emit("RELAY_ICE", {
                    peerId,
                    icecandidate: event.candidate
                })
            }


            //handle when data or streams are coming on this connection
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

                // Set as local description
                await connections.current[peerId].setLocalDescription(
                    offer
                );

                //Send offer to another client
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




    useEffect(()=>{
        //RECEIVE RELAY ICE FROM THE SERVER
        socket.current.on('ICE_CANDIDATE', ({peerId, icecandidate})=>{
            if(icecandidate){
                connections.current[peerId].addIceCandidate(icecandidate);
            }
        })

        return () => {
            socket.current.off("ICE_CANDIDATE")
        }
    },[])




    
    useEffect(()=>{
        const handleRemoteSdp = async (
            {peerId, 
            sessionDescription:remoteSessionDescription
            })=>{
            connections.current[peerId].setRemoteDescription(
                new RTCSessionDescription(remoteSessionDescription)
            )

            //If session description is type of offer then create an answer
            if(remoteSessionDescription.type === "offer"){
                const connection = connections.current[peerId];
                const answer = await connection.createAnswer()
                connection.setLocalDescription(answer)
            }
        }

        //RECEIVE SDP  FROM THE SERVER
        socket.current.on('SESSION_DESCRIPTION', handleRemoteSdp)

        return () => {
            socket.current.off("SESSION_DESCRIPTION")
        }
    },[])



    useEffect(()=> {
        //we need userId to remove dom audio element as well
        const handleRemovePeer = async ({peerId, userId})=>{
            //First check if peer connection is in the connections list or not
            if(connections.current[peerId]){
                connections.current[peerId].close();
            }

            delete connections.current[peerId];
            delete audioElements.current[peerId]
            
            setClients(list => list.filter(client => client.id !== userId))
        }

        socket.current.on("REMOVE_PEER", handleRemovePeer)

        return () => {
            socket.current.off("REMOVE_PEER")
        }
    },[])


    return {clients, provideRef}
}
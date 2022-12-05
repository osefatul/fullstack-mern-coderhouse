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
    const clientsRef = useRef(null);

    const provideRef = (instance, userId) =>{
        audioElements.current[userId] = instance
    }


    useEffect(()=>{
        socket.current = socketInit()
    },[])


    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);


    //Why do use useCallback: prevent the function from being recreated unless necessary. unless it's necessary.
    const addNewClient = useCallback(
        (newClient, cb) => {
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            );

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    cb
                );
            }
        },
        [clients, setClients]
    );
    


    //CAPTURE OUR MIC
    useEffect(()=>{

        console.log('render startCapture', 4);
        const startCapture = async () => {
            // Start capturing local audio stream.
            localMediaStream.current =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
        };

        startCapture().then(()=>{
            addNewClient({...user, muted: true}, ()=>{
                const localElement = audioElements.current[user.id];
                if(localElement) {
                    // localElement.volume = 0;//OTHERWISE WE WILL HEAR OUR OWN VOICE
                    localElement.srcObject = localMediaStream.current;
                }

                //ONCE WE ADD CLIENT WE SENT IT TO WEBSOCKET.
                //CONNECT OR JOIN WEB_SOCKET SERVER FOR THE FIRST TIME.
                socket.current.emit("JOIN", {roomId, user})
            })
        })


        //When user leaves the room
        return () => {
            localMediaStream.current
                .getTracks()
                .forEach((track) => track.stop());
            socket.current.emit("LEAVE", { roomId });
        };
    }, []);




    useEffect(()=>{
        //The first party who is connecting and creating a group will create an offer.
        const handleNewPeer  = async ({peerId, createOffer, user:remoteUser})=>{

            //if client is already in the connections object then go no further...
            if (peerId in connections.current) {
                //connections is an obj where socketId is key and connection of webRTC is the value
                return console.warn(`You are already connected with ${peerId} (${user.name})`);
            }

            //Otherwise, You need to Establish RTC connection
            connections.current[peerId] = new RTCPeerConnection({
                //asking local machine what is your public id so we can send it to other clients
                iceServers: freeice(),
            })

            //Handle new ice candidate: 
            connections.current[peerId].onicecandidate = (event) => {
                //whenever new candidates is coming up we need to send them to other clients.
                socket.current.emit("RELAY_ICE", {
                    peerId,
                    icecandidate: event.candidate,
                })
            }


            //handle when data or streams are coming on this connection
            //check the stream of other users.
            connections.current[peerId].ontrack = ({
                streams: [remoteStream],
            }) => {
                addNewClient({ ...remoteUser, muted: true }, () => {

                    //check if audio element is ready/rendered
                    // if yes then attach stream
                    if (audioElements.current[remoteUser.id]) {
                        audioElements.current[remoteUser.id].srcObject =
                            remoteStream;
                    } 
                    //otherwise loop each second till it gets rendered or ready.
                    else {
                        let settled = false;
                        const interval = setInterval(() => {
                            if (audioElements.current[remoteUser.id]) {
                                audioElements.current[remoteUser.id].srcObject =
                                    remoteStream;
                                settled = true;
                            }

                            if (settled) {
                                clearInterval(interval);
                            }
                        }, 300);
                    }
                });
            };


            //Add local or our own audio track to remote connections
            localMediaStream.current.getTracks().forEach((track) => {
                connections.current[peerId].addTrack(
                    track,
                    localMediaStream.current
                );
            });


            //Create Offer
            if (createOffer) {
                const offer = await connections.current[peerId].createOffer();

                // Set as local description
                await connections.current[peerId].setLocalDescription(offer);

                //Send offer to another client
                socket.current.emit("RELAY_SDP", {
                    peerId,
                    sessionDescription: offer,
                });
            }
        }

        socket.current.on("ADD_PEER", handleNewPeer)

        return () =>{
            socket.current.off("ADD_PEER")
        }
    },[])




    useEffect(()=>{
        //RECEIVE RELAY ICE FROM THE SERVER
        socket.current.on('ICE_CANDIDATE',  ({ peerId, icecandidate }) => {
            if (icecandidate) {
                connections.current[peerId].addIceCandidate(icecandidate);
            }
        });

        return () => {
            socket.current.off("ICE_CANDIDATE");
        };
    }, []);




    
    useEffect(()=>{
        const handleRemoteSdp =async ({
            peerId,
            sessionDescription: remoteSessionDescription,
            }) => {
                connections.current[peerId].setRemoteDescription(
                new RTCSessionDescription(remoteSessionDescription)
            )

            //If session description is type of offer then create an answer
            if(remoteSessionDescription.type === "offer"){
                const connection = connections.current[peerId];
                const answer = await connection.createAnswer()
                connection.setLocalDescription(answer)

                socket.current.emit("RELAY_SDP", {
                    peerId,
                    sessionDescription: answer,
                });
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
            
            setClients((list) => list.filter((c) => c.id !== userId));
        }

        socket.current.on("REMOVE_PEER", handleRemovePeer)

        return () => {
            socket.current.off("REMOVE_PEER")
        }
    },[])




    useEffect(() => {
        // handle mute and unmute
        console.log('render inside mute useEffect', 14);
        socket.current.on("MUTE", ({ peerId, userId }) => {
            setMute(true, userId);
        });

        socket.current.on("UN_MUTE", ({ peerId, userId }) => {
            setMute(false, userId);
        });

        const setMute = (mute, userId) => {
            const clientIdx = clientsRef.current
                .map((client) => client.id)
                .indexOf(userId);
            const allConnectedClients = JSON.parse(
                JSON.stringify(clientsRef.current)
            );
            if (clientIdx > -1) {
                allConnectedClients[clientIdx].muted = mute;
                setClients(allConnectedClients);
            }
        };
    }, []);




    //Sending MURE and UNMUTE to server
    const handleMute = (isMute, userId)=>{
        console.log("mute", isMute);
        let settled = false;

        if (userId === user.id) {
            let interval = setInterval(() => {

                if(localMediaStream.current){
    
                    
                    // localMediaStream.current.getTracks()[0].enabled = false; // voice won't go out
                    
                    //So instead of the above way we can use isMute so we can toggle it
                    localMediaStream.current.getTracks()[0].enabled = !isMute;
                    if (isMute) {
                        socket.current.emit("MUTE", {
                            roomId,
                            userId: user.id,
                        });
                    } else {
                        socket.current.emit("UN_MUTE", {
                            roomId,
                            userId: user.id,
                        });
                    }
                    settled = true;
                }
                if (settled) {
                    clearInterval(interval);
                }
            }, 200);
        }
    };
    


    return {clients, provideRef, handleMute}
}
import { useEffect, useState, useRef, useCallback } from 'react';
import { useStateWithCallback } from './useStateWithCallback';
import socketInit from "../socket"



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
        (newClient, cb)=>{
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


    //capture our audio or mic
    useEffect(()=>{
        const startCapture = async ()=>{
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({audio:true})
        }

        startCapture().then(()=>{
            addNewClient(user, ()=>{
                const localElement = audioElements.current[user.id];
                if(localElement) {
                    localElement.volume = 0;
                    localElement.srcObject = localMediaStream.current;
                }


                //Socket emit JOIN
                socket.current.emit("JOIN", {roomId, user})
            })
        })

    },[])


    return {clients, provideRef}
}
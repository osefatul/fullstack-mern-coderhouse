import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import { getRoom } from '../../http';
import styles from './room.module.css';


function Room() {
    const user = useSelector((state) => state.auth.user);
    const { id: roomId } = useParams();
    const [room, setRoom] = useState(null);

    const { clients, provideRef} = useWebRTC(roomId, user);

    console.log(clients)

    // const navigate = useNavigate();

    // const [isMuted, setMuted] = useState(true);

    // useEffect(() => {
    //     const fetchRoom = async () => {
    //         const { data } = await getRoom(roomId);
    //         setRoom((prev) => data);
    //     };

    //     fetchRoom();
    // }, [roomId]);

    // // useEffect(() => {
    // //     handleMute(isMuted, user.id);
    // // }, [isMuted]);

    // const handManualLeave = () => {
    //     navigate('/rooms');
    // };

    // const handleMuteClick = (clientId) => {
    //     if (clientId !== user.id) {
    //         return;
    //     }
    //     setMuted((prev) => !prev);
    // };

    return (
        <div>
            <h1>All connected clients</h1>
            {
                clients?.map((client)=>{
                    return (
                        <div>
                            <audio 
                            ref={(instance)=> provideRef(instance, client.id)}
                            controls autoPlay></audio>
                            <h4>{client.name}</h4>
                        </div>
                    )
                })
            }
        </div>
    );
};

export default Room
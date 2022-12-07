import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import { getRoom } from '../../http';
import styles from './room.module.css';


function Room() {

    const user = useSelector((state) => state.auth.user);
    const [isMuted, setMuted] = useState(true);
    const [room, setRoom] = useState(null);
    
    const navigate = useNavigate();
    const { id: roomId } = useParams();

    const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

    // console.log(clients)



    useEffect(() => {
        const fetchRoom = async () => {
            const { data } = await getRoom(roomId);
            setRoom((prev) => data);
        };

        fetchRoom();
    }, [roomId]);


    useEffect(() => {
        handleMute(isMuted, user.id);
    }, [isMuted]);


    const handManualLeave = () => {
        navigate('/rooms');
    };

    const handleMuteClick = (clientId) => {
        if (clientId !== user.id) {
            return;
        }
        setMuted((prev) => !prev);
    };

    return (
    <div className={styles.topRoom}>

        <div className={styles.room}>
            <div>
                <button 
                onClick={handManualLeave} 
                className={styles.goBack}>
                    <img src="/images/arrow-left.png" alt="arrow-left" />
                    {room && <span className={styles.topic}>{room.topic}</span>}
                </button>
            </div>

            <div className={styles.clientsWrap}>

                <div className={styles.header}>
                    <button
                        onClick={handManualLeave}
                        className={styles.actionBtn}
                    >
                        <img src="/images/win.png" alt="win-icon" />
                        <span>Leave quietly</span>
                    </button>
                </div>

                <div className={styles.clientsList}>
                    {clients.map((client) => {
                        return (
                            <div className={styles.client} key={client.id}>
                                <div className={styles.userHead}>
                                    <img
                                        className={styles.userAvatar}
                                        src={client.avatar}
                                        alt=""
                                    />
                                    <audio
                                        autoPlay
                                        ref={(instance) => {
                                            provideRef(instance, client.id);
                                        }}
                                    />
                                    <button
                                        onClick={() =>handleMuteClick(client.id)}
                                        className={styles.micBtn}
                                    >
                                        {client.muted ? (
                                            <img
                                                className={styles.mic}
                                                src="/images/mic-mute.png"
                                                alt="mic"
                                            />
                                        ) : (
                                            <img
                                                className={styles.micImg}
                                                src="/images/mic.png"
                                                alt="mic"
                                            />
                                        )}
                                    </button>
                                </div>
                                <h4>{client.name}</h4>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>

    </div>
    );
};

export default Room
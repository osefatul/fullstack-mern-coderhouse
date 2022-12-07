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
    const [open, setOpen] = useState();

    const navigate = useNavigate();
    const { id: roomId } = useParams();
    const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

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

    useEffect(()=>{
        if(window.innerWidth > 1100) {
            setOpen(true)
        } else{
            setOpen(false)
        }
    },[])

    return (
    
    <div className={styles.topRoom}>

            <div className={styles.burger} onClick={()=> setOpen(!open)}>
                    {
                        !open &&
                        <p>☰</p>
                    }
            </div>

        {
            open &&
            <div className={styles.room}>
                <div className={styles.close} onClick={()=> setOpen(!open)}>
                        {
                            <p>
                                X
                            </p>
                            
                        }
                </div>

                <div>
                    <button 
                    onClick={handManualLeave} 
                    className={styles.goBack}>
                        <img src="/images/arrow-left.png" alt="arrow-left" />
                        <span>Go back</span>
                    </button>
                </div>

                <div className={styles.clientsWrap}>

                    <div className={styles.header}>
                        {room && <span className={styles.topic}>{room.topic}</span>}
                    </div>

                    <p className={styles.online}>Online</p>

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
        }

    </div>
    );
};

export default Room
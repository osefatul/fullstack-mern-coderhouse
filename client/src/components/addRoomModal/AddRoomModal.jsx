import React, { useState } from 'react'
import styles from './addRoomModal.module.css';

import TextInput from '../shared/textInput/TextInput';
import { createRoom as create } from '../../http';
import { useNavigate } from 'react-router-dom';



function AddRoomModal({ onClose }) {

    const navigate = useNavigate();

    const [roomType, setRoomType] = useState('open');
    const [topic, setTopic] = useState('');

    async function createRoom() {
        try {
            if (!topic) return;
            const { data } = await create({ topic, roomType });
            navigate(`/room/${data.id}`);
        } catch (err) {
            console.log(err.message);
        }
    }


    return (
        <div className={styles.modalMask}>

            <div className={styles.modalBody}>
                <button onClick={onClose} className={styles.closeButton}>
                    <img src="/images/close.png" alt="close" />
                </button>

                <div className={styles.topic}>
                    <h3 className={styles.heading}>
                            Enter the topic to be discussed:
                    </h3>
                    
                    <TextInput
                        // className={styles.textInput}
                        fullwidth="true"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                <div className={styles.modalHeader}>
                    
                    <h2 className={styles.subHeading}>Room types</h2>
                    <div className={styles.roomTypes}>
                        <div
                            onClick={() => setRoomType('open')}
                            className={`${styles.typeBox} ${
                                roomType === 'open' ? styles.active : ''
                            }`}
                        >
                            <img src="/images/globe.png" alt="globe" />
                            <span>Open</span>
                        </div>
                        <div
                            onClick={() => setRoomType('social')}
                            className={`${styles.typeBox} ${
                                roomType === 'social' ? styles.active : ''
                            }`}
                        >
                            <img src="/images/social.png" alt="social" />
                            <span>Social</span>
                        </div>
                        <div
                            onClick={() => setRoomType('private')}
                            className={`${styles.typeBox} ${
                                roomType === 'private' ? styles.active : ''
                            }`}
                        >
                            <img src="/images/lock.png" alt="lock" />
                            <span>Private</span>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>

                    <button
                        onClick={createRoom}
                        className={styles.footerButton}
                    >
                        <img src="/images/celebration.png" alt="celebration" />
                        <span>Let's go</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddRoomModal
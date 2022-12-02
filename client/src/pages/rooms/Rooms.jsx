import React, { useEffect, useState } from 'react';
import styles from './rooms.module.css';
import { getAllRooms } from '../../http';
import RoomCard from '../../components/roomCard/RoomCard';
import AddRoomModal from '../../components/addRoomModal/AddRoomModal';





const Rooms = () => {

    const [showModal, setShowModal] = useState(false);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await getAllRooms();
            setRooms(data);
        };
        fetchRooms();
    }, []);



    function openModal() {
        setShowModal(true);
    }
    
    
    return (
        <>
            <div className="container">
                <div className={styles.roomsHeader}>

                    <div className={styles.left}>
                        <span className={styles.heading}>All voice rooms</span>
                        <div className={styles.searchBox}>
                            <img src="/images/search-icon.png" alt="search" />
                            <input type="text" className={styles.searchInput} />
                        </div>
                    </div>

                    <div className={styles.right}>
                        <button
                            onClick={openModal}
                            className={styles.startRoomButton}>
                            <img
                                src="/images/add-room-icon.png"
                                alt="add-room"
                            />
                            <span>Start a room</span>
                        </button>
                    </div>
                    
                </div>

                <div className={styles.roomList}>
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            </div>
            {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
        </>
    );
};

export default Rooms;
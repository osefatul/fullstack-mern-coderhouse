import React, { useEffect, useState } from 'react';
import styles from './rooms.module.css';
import { getAllRooms } from '../../http';
import RoomCard from '../../components/roomCard/RoomCard';
import AddRoomModal from '../../components/addRoomModal/AddRoomModal';


const dummyRooms = [
    {
        id: 1,
        topic: 'Which framework best for frontend ?',
        speakers: [
            {
                id: 1,
                name: 'John Doe',
                avatar: '/images/monkey-avatar.png',
            },
            {
                id: 2,
                name: 'Jane Doe',
                avatar: '/images/monkey-avatar.png',
            },
        ],
        totalPeople: 40,
    },
    {
        id: 3,
        topic: 'What’s new in machine learning?',
        speakers: [
            {
                id: 1,
                name: 'John Doe',
                avatar: '/images/monkey-avatar.png',
            },
            {
                id: 2,
                name: 'Jane Doe',
                avatar: '/images/monkey-avatar.png',
            },
        ],
        totalPeople: 40,
    },
    {
        id: 4,
        topic: 'Why people use stack overflow?',
        speakers: [
            {
                id: 1,
                name: 'John Doe',
                avatar: '/images/monkey-avatar.png',
            },
            {
                id: 2,
                name: 'Jane Doe',
                avatar: '/images/monkey-avatar.png',
            },
        ],
        totalPeople: 40,
    },
    {
        id: 5,
        topic: 'Artificial inteligence is the future?',
        speakers: [
            {
                id: 1,
                name: 'John Doe',
                avatar: '/images/monkey-avatar.png',
            },
            {
                id: 2,
                name: 'Jane Doe',
                avatar: '/images/monkey-avatar.png',
            },
        ],
        totalPeople: 40,
    },
];


const Rooms = () => {

    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState([]);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await getAllRooms();
            setRooms(data);
            setData(data)
            console.log(rooms)
        };
        fetchRooms();
    }, []);


    function openModal() {
        setShowModal(true);
    }
    
// Filter
    const searchRoom = (e)=>{
        e.preventDefault();
        
        setData(data.filter( r => {
            if(!e.target.value){
                const fetchRooms = async () => {
                    const { data } = await getAllRooms();
                    setRooms(data);
                    setData(data)
                    console.log(rooms)
                };
                fetchRooms();
            }
            else{
                return r.topic.toLowerCase().includes(e.target.value.toLowerCase())
            }
        }))
    }

    useEffect(()=>{
        setRooms(data)
    },[data])
    
    
    return (
        <>
            <div className="container">
                <div className={styles.roomsHeader}>

                    <div className={styles.left}>
                        <span className={styles.heading}>All rooms</span>
                        <div className={styles.searchBox}>
                            <img src="/images/search-icon.png" alt="search" />
                            <input type="text" className={styles.searchInput} onChange={searchRoom}/>
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
                        <RoomCard className={styles.roomCard} key={room.id} room={room} />
                    ))}
                </div>
            </div>

            {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
        </>
    );
};

export default Rooms;
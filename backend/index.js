require('dotenv').config();
const express = require('express');
const app = express();
const DbConnect = require('./database');
const router = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

//we are using NODE server where express SERVER also work on this...
const server = require("http").createServer(app);


//SETTING WEB_SOCKET SERVER
const io = require('socket.io')(server);


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});


app.use(cookieParser());
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000'],
};

app.use(cors(corsOption));
app.use('/storage', express.static('storage'));

const PORT = process.env.PORT || 5500;
DbConnect();
app.use(express.json({ limit: '8mb' }));
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express Js');
});



//SOCKETS FUNCTIONALITIES
const socketUserMapping = {};

io.on("connection", (socket)=>{
    console.log("Socket connected => ", socket.id) //my socket.id


    //WHENEVER SOMEONE JOINS FOR THE 1ST TIME.
    socket.on("JOIN", ({roomId, user})=>{
        socketUserMapping[socket.id] = user;

        //Get me socketId of all the users joined this specific room (roomId) from all the rooms inside the io server or if there is no client inside the room created yet then give me an empty array of clients.
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        console.log("clients: ", clients)

        // If there are clients inside the room, the one we just got.
        //clientId = socket.id inside the room
        clients.forEach((clientId) => {

            //SEND EMIT TO PEERS FOR CONNECTION, and tell them don't worry about offer, we will create them.
            io.to(clientId).emit("ADD_PEER", {
                peerId: socket.id, //send to other clients my socket.id
                createOffer: false,
                user,
            });

            //ADDING MYSELF AS WELL INTO THE CONNECTION OR ROOM
            socket.emit("ADD_PEER", {
                peerId: clientId, //SEND ME EACH CLIENT socket.ID
                createOffer: true, //I AM CREATING OFFER FOR EACH CLIENT
                user: socketUserMapping[clientId]
            })
        })

         //JOIN THE socket with roomId
        socket.join(roomId);

    });


    //HANDLE RELAY ICE
    socket.on('RELAY_ICE', ({peerId, icecandidate}) => {
        //WE now send icecandidate to peerId this below info to the peerId
        io.to(peerId).emit('ICE_CANDIDATE', {
            peerId:socket.id,
            icecandidate
        })
    })


    //HANDLE RELAY SESSION_DESCRIPTION
    socket.on("RELAY_SDP", ({peerId, sessionDescription})=>{
        io.to(peerId).emit("SESSION_DESCRIPTION", {
            peerId:socket.id,
            sessionDescription
        })
    })



    //HANDLE MUTE
    socket.on("MUTE", ({roomId, userId})=>{
        const clients = Array.from (io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach( clientId =>{
            io.to(clientId).emit("MUTE", {
                peerId: socket.id,
                userId
            })
        })
    })


    //HANDLE UN_MUTE 
    socket.on("UN_MUTE", ({roomId, userId})=>{
        const clients = Array.from (io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach( clientId =>{
            io.to(clientId).emit("UN_MUTE", {
                peerId: socket.id,
                userId
            })
        })
    })



    socket.on("MUTE_INFO", ({ userId, roomId, isMute }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            if (clientId !== socket.id) {
                console.log('mute info');
                io.to(clientId).emit("MUTE_INFO", {
                    userId,
                    isMute,
                });
            }
        });
    });




    //LEAVE ROOM
    const leaveRoom = () => {
        const {rooms} = socket; //get all rooms from socket.
        Array.from(rooms).forEach(roomId => {
            // get clients of this room
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            )

            //clientId = socket.id of other clients
            clients.forEach(clientId =>{
                io.to(clientId).emit("REMOVE_PEER", {
                    peerId: socket.id, //send my socket.id to other clients
                    userId: socketUserMapping[socket.id]?.id
                })

                // socket.emit('REMOVE_PEER', {
                //     peerId: clientId, // remove others from my side as well.
                //     userId: socketUserMapping[clientId]?.id
                // })
            })

            socket.leave(roomId)
        })

        delete socketUserMapping[socket.id]
    }
    socket.on("LEAVE", leaveRoom)

    socket.on('disconnecting', leaveRoom);

})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
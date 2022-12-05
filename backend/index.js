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
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET0", "POST"]
    }
})
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

    //Whenever someone joins socket for the first time...
    socket.on("JOIN", ({roomId, user})=>{
        socketUserMapping[socket.id] = user;

         //JOIN THE ROOM
        socket.join(roomId);

        //Get me roomId from all the rooms inside the io server or there is no room created yet then give me an empty array.
        const clients = Array.from (io.sockets.adapter.rooms.get(roomId) || []);
        console.log("clients: ", clients)

        // If there are clients inside the room, the one we just got.
        clients.forEach(clientId => {

            //SEND EMIT TO PEERS FOR CONNECTION, and tell them don't worry about offer, we will create them.
            io.to(clientId).emit("ADD_PEER", {
                peerId: socket.id, //send to other clients my socket.id
                createOffer:false,
                user
            });

            //ADDING MYSELF AS WELL INTO THE CONNECTION OR ROOM
            socket.emit("ADD_PEER", {
                peerId: clientId, //SEND ME CLIENT ID
                createOffer: true, //I AM CREATING OFFER 
                user:socketUserMapping[clientId]
            })
        })

    });

})


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
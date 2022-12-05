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
    console.log("new connection", socket.id)

    socket.on("JOIN", ({roomId, user})=>{
        socketUserMapping[socket.id] = user;

        //this Map object so we need to wrap it around array.
        const clients = Array.from (io.sockets.adapter.rooms.get(roomId) || []);

        // ClientId is nothing but a socket.id
        clients.forEach(clientId => {

            //SEND EMIT TO PEERS FOR CONNECTION
            io.to(clientId).emit("ADD_PEER", {});

            //WANT TO ADD MYSELF AS WELL INTO THE CONNECTION
            socket.emit("ADD_PEER", {})

            //join room
            socket.join(roomId);
        })
    });

})


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
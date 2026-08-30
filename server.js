const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ roomCode, username }) => {
        socket.join(roomCode);
        if (!rooms.has(roomCode)) {
            rooms.set(roomCode, []);
        }
        socket.emit('previousMessages', rooms.get(roomCode));
    });

    socket.on('sendMessage', ({ roomCode, message, username }) => {
        const msg = { 
            user: username, 
            text: message, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        rooms.get(roomCode).push(msg);
        if (rooms.get(roomCode).length > 50) rooms.get(roomCode).shift();
        io.to(roomCode).emit('newMessage', msg);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// PASTE YOUR KEYS HERE
const supabase = createClient('https://tmesumqbayplvypqdcqd.supabase.co/rest/v1/',eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZXN1bXFiYXlwbHZ5cHFkY3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTczOTgsImV4cCI6MjEwMzYzMzM5OH0.Y2Y3dU8JeohDgo0W2dTrq7gkxvgj_X7fUwHMyEjx1Qc '');

app.use(express.static('public'));

io.on('connection', (socket) => {
    let currentRoom = "";
    let currentName = "";

    socket.on('joinRoom', async ({ roomCode, username }) => {
        currentRoom = roomCode;
        currentName = username;
        socket.join(roomCode);

        // Fetch last 50 messages from Database
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('room_code', roomCode)
            .order('created_at', { ascending: true })
            .limit(50);

        if (data) socket.emit('previousMessages', data);
        socket.to(roomCode).emit('systemMessage', `${username} joined the room`);
    });

    socket.on('sendMessage', async ({ roomCode, message, username }) => {
        // Save message to Database
        await supabase.from('messages').insert([
            { room_code: roomCode, username: username, content: message }
        ]);

        io.to(roomCode).emit('newMessage', { 
            username: username, 
            content: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        });
    });

    socket.on('disconnect', () => {
        if (currentRoom) {
            io.to(currentRoom).emit('systemMessage', `${currentName} left the room`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running`));
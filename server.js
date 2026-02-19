const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Новый пользователь подключился');
    
    socket.on('send message', (data) => {
        io.emit('new message', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
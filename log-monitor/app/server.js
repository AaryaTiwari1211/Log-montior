const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const Watcher = require('./watcher');

const app = express();
const server = http.createServer(app);

// Configure CORS with the appropriate settings
app.use(cors({
    origin: 'http://localhost:5500',  // Update to match your client-side URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5500',  // Match the client-side URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

let watcher = new Watcher("test.log");
watcher.start();

app.get('/log', (req, res) => {
    console.log("Request received");
    const options = {
        root: path.join(__dirname)
    };
    const fileName = 'index.html';
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.error(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', fileName);
        }
    });
});

io.on('connection', (socket) => {
    console.log("New connection established: " + socket.id);

    watcher.on("process", (data) => {
        socket.emit("update-log", data);
    });

    const data = watcher.getLogs();
    socket.emit("init", data);
});

server.listen(3000, () => {
    console.log('Listening on localhost:3000');
});

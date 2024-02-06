const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
var mongoose = require('mongoose');
var db_url = 'mongodb://localhost:27017/trying';

mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('mongodb connected');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

var MessageSchema = new mongoose.Schema({
    name: String,
    message: String,
    sent_at: String
});

var Message = mongoose.model('Message', MessageSchema);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routing
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.send(messages);
    } catch (err) {
        console.error('Error retrieving messages:', err);
        res.status(500).send('Error retrieving messages');
    }
});


app.post('/messages', (req, res) => {
    var message = new Message(req.body);
    message.save()
        .then(() => {
            io.emit('message', req.body);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.error('Error saving message:', err);
            res.sendStatus(500);
        });
});


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('message: ' + msg.message);
  })});
  server.listen(3000, () => {
    console.log('listening on *:3000');
  }
    );

const express = require('express');
const app = express();
const server = require('http').Server(app);    //creating server
const io = require('socket.io')(server)
const users = {}
const { v4: uuidV4 } = require('uuid');        //importing uuid library
const { ExpressPeerServer } = require('peer');  //impoting peer
const { connect } = require('net');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/create-room/",(req, res) => {                     
    res.redirect(`/${uuidV4()}`);               //generates random Id and redirects to it
})
app.get('/:room', (req, res) => {               
    res.render('room', { roomId: req.params.room })  //passing the roomId
  })
 
io.on('connection', socket => {
  socket.on('new-user', username => {                 //when new user joins it stores the username in users                                                                                                                                          
    users[socket.id] = username                                             
    socket.broadcast.emit('user-connected', username)                
    socket.on('disconnect',() => {
      socket.broadcast.emit('user-disconnected', username);
    })
  })
    socket.on('join-room', (roomId, userId) => {
       socket.join(roomId);   //joining the room
       socket.broadcast.to(roomId).emit('user-connected', userId)  //broadcasting that user has connected with userId
       socket.on('message', (message) => {
        //send message to the same room
        io.to(roomId).emit('createMessage', { message: message, username: users[socket.id]})
       })
       socket.on('disconnect',() => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId);  
      })
    })
})


server.listen(process.env.PORT||10000);          // listening and running the server

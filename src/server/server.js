const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

server.listen(process.env.PORT || 8080);
console.log('server running....ON PORT 8080');

app.use(express.static(path.join(__dirname, '../client')));

// let ns1 = io.of('/ns1'); // this is a custom defined namespace;

let usernames = {};
let clientsRooms = [];
let helpDeskRooms = [];

io.on('connection', socket => { //CONNECTION ESTABLISHED ON DEFAULT NAMESPACE;

  let clientRoomsData = clientsRooms.map(room => ({id: room.id})); //THIS IS FOR SupportDesk TO USE, ADD PROPERTY TO THIS OBJECT AS NEEDED IN THE CLIENT SIDE

  socket.on('add client to rooms', (client, callback) => { //THIS EVENT ADD THE SOCKET TO CLIENTROOMS IF NAME IS VALID
    if(client.length > 0){
      let thisSocket = socket;
      thisSocket.username = client;
      callback(true);
      clientsRooms.push(thisSocket);
      // io.emit('clients', { activeClients: clientRoomsData })
      console.log("just added client to room , now " + clientsRooms.length)
    }else{
      callback(false);
    }
  });

  socket.on('message', message => { //THIS EVENT HANDLE MESSAGE COMING IN AND OUT
    io.emit('message', {
      body: message.body,
      from: message.from,
      time: message.time,
      img: null,
    })
  });

  socket.on('get clients', data => { //THIS EVENT MADE SPECIFICALY FOR SUPPORTDESK TO DISPLAY ALL ACTIVE CLIENT ROOMS
    console.log('inside get clients!!!!')
    console.log('inside get clients! total clients ,' + clientsRooms.length)
    io.emit('clients', {
      activeClients: clientRoomsData,
    })
  });

  socket.on('disconnect', () => { //THIS EVENT REMOVES THE SOCKET FROM CLIENTS ROOM AS THEY LEAVE OR CLOSE CHAT WINDOW
      console.log("total room before filter , " + clientsRooms.length)
      console.log(socket.id + ", this socket is disconnected")
      clientsRooms = clientsRooms.filter(room => {
        return room.id !== socket.id;
      })
      console.log("total room after filter , " + clientsRooms.length)
  })
});

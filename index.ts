const express = require('express');
const bodyParser = require("body-parser");
const { addRoutes } = require("./src/routeManager.js")
const cors = require("cors");
const { isValidAction, executeAction, getGamestate, isValidID, getSpectatorGamestate } = require("./src/stateMachine.js")
const schedule = require('node-schedule');
const { makeBackup, updateCeasefire, addHistoryMessage } = require('./src/database.js');

const http = require('http');
const socketIO = require("socket.io");

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// websocket
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const socketClients = {}

io.on('connection', (socket) => {
  socket.on('action', async (msg) => {
    const { action, actor, targetSpace, upgrades } = msg;
    //handle action
    ///check is valid action
    if (await isValidAction(action, actor, targetSpace, upgrades)) {
      console.log('action is valid');
      await executeAction(action, actor, targetSpace, upgrades)
      console.log('action executed');

      updateAllClientsGamestate();
    } else {
      socket.emit('invalid', msg)
    }

  })

  socket.on('register', async (msg) => {
    if (msg === 'spectator') {
      socket.spectator = true;
      console.log('registering spectator')
    } else {
      socket.spectator = false;
      const idIsValid = await isValidID(msg);
      if (idIsValid) {
        console.log('registering player', msg)
        socket.playerId = msg
      } else {
        console.log('unlog plaease')
        socket.emit('unlog')
      }
    }
  })

  socket.on('message', (msg) => {
    console.log(msg)
  })
});

async function unlogId(id) {
  const sockets = await io.fetchSockets()
  sockets.forEach(async (sock) => {
    if (sock.playerId === id) {
      sock.emit('unlog')
      delete sock.playerId
      return;
    }
  })
}

async function updateAllClientsGamestate() {
  const sockets = await io.fetchSockets()
  sockets.forEach(async (sock) => {
    if (sock.playerId) {
      console.log(sock.playerId);
      playerGamestate = await getGamestate(sock.playerId)
      sock.emit('gameStateUpdate', playerGamestate)
    } else if (sock.spectator) {
      console.log('sending to spectator');
      spectatorGamestate = await getSpectatorGamestate()
      sock.emit('gameStateUpdate', spectatorGamestate)
    }
  })
}

app.use(express.static('public'));

addRoutes(app, updateAllClientsGamestate, unlogId)

app.listen(3001, () => console.log('server started'));
server.listen(3000, () => console.log('tada'))
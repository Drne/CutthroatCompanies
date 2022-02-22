import express from "express"
import * as bodyParser from "body-parser";
import {doesPlayerExist, getGamestate, handleGameAction} from "./src/stateMachine";
import {isGameIDIsInUse} from "./src/database";
import {GameAction, GameActionJSON} from "./src/types";
import {Contract} from "./src/classes/Contract";
import {addRoutes} from "./src/routeManager";
import cors = require("cors");

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

const parseJSONAction = (action: GameActionJSON): GameAction => {
  return {type: action.type, actingPlayerID: action.actingPlayerID, contract: Contract.fromJSON(action.contract)}
}

io.on('connection', (socket) => {
  socket.on('action', async (msg) => {
    const { gameID, action }: { gameID: string, action: GameActionJSON} = msg;
    //let the game handle the action
      const parsedJSONAction = parseJSONAction(action)
      const isActionValid = await handleGameAction(gameID, parsedJSONAction)
      if (isActionValid) {
        await updateAllClientsGamestate(socket.gameID);
      } else {
        socket.emit('invalid action', msg)
      }

  })

  socket.on('register', async (msg) => {
    const {gameID, playerID} = msg
    if (!await isGameIDIsInUse(gameID)) {
      socket.disconnect()
    }

    // handle spectators
    if (playerID === 'spectator') {
      socket.spectator = true;
      socket.gameID = gameID
      console.log('registering spectator')
      return;
    }

    // handle returning player
    if (await doesPlayerExist(gameID, playerID)) {
      socket.spectator = false;
      console.log('registering player', msg)
      socket.playerId = playerID
      return;
    }

    socket.emit('unlog')
    socket.disconnect()
  })

  socket.on('message', (msg) => {
    console.log(msg)
  })
});

async function updateAllClientsGamestate(gameId: string) {
  const gameState = getGamestate(gameId)
  const sockets = io.fetchSockets()
  sockets.forEach((socket) => {
    if (socket.gameID === gameId) {
      socket.emit("gameStateUpdate", gameState)
    }
  })
}

app.use(express.static('public'));

addRoutes(app, updateAllClientsGamestate)

app.listen(3001, () => console.log('server started'));
server.listen(3000, () => console.log('tada'))
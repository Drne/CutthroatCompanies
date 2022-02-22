import { Game } = require("./types");
import { generateRandomID } = require("./utilities");
const Database = require('@replit/database');
const db = new Database();

const createNewGame = (): Game => {
    return new Game();
    return {
        id: generateRandomID(5),
        players: [],
        currentContracts: [],
        executedContracts: [],
        started: false
    }
}

const setupGameServer = async () => {
    await db.set("games", {})
}

const startNewGame =  async (): Promise<Game> => {
    const game = createNewGame()
    const currentGames = await db.get("games");

    await db.set("games", currentGames[game.id] = game)
    return game;
}

///////////////////////////////////////////
setupGameServer()
///////////////////////////////////////////

const clone = (json) => {
    return JSON.parse(JSON.stringify(json));
}

const addUser = async (gameId, playerId) => {

    const userDetails = {
        //TODO
    }

    await db.get("users").then(async users => {
        const newUsers = clone(users);
        newUsers[playerId] = userDetails;
        await db.set("users", newUsers)
    })
}

const removeUser = async (id) => {
    const users = await db.get("users");
    const copy = {...users}
    delete copy[id];
    await setUsers(copy)
}

const getUser = async (id) => {
    return db.get("users").then((users) => {
        if (users && users[id]) {
            return users[id]
        } else {
            return null
        }
    });
}

const updateUser = async (userId, userData) => {
    const users = await db.get("users")
    if (users[userId]) {
        const newUserData = { ...users };
        newUserData[userId] = userData;
        await setUsers(newUserData)
    }
}

const updateUserData = async (userId, updatedData) => {
    const userData = await getUser(userId);
    await updateUser(userId, { ...userData, ...updatedData });
}

const getAllUsers = async () => {
    return await db.get("users").then((users) => {
        return users;
    });
}

const setUsers = async (users) => {
    await db.set("users", users);
}

const getUserByName = async (username) => {
    return await getAllUsers().then(users => {
        const matchingUsers = Object.values(users).filter(user => user.name === username)
        if (matchingUsers) {
            return matchingUsers[0]
        }
    })
}

const addToHistory = async (action, actorName) => {
    // TODO
    const historyMessage = undefined
    await addHistoryMessage(historyMessage);
}

const addHistoryMessage = async (historyMessage) => {
    const historyEntry = {
        time: Date.now(),
        message: historyMessage,
    }

    const oldHistory = await db.get('history')
    await db.set('history', [...oldHistory, historyEntry])
}

const getGameState = async (id) => {
    const history = await db.get('history')
    const users = await db.get("users");
    let playerData = null
    if (id) {
        playerData = await getUser(id);
        delete playerData.id
    }
    let sanitizedUsers = Object.keys(users).map(userKey => {
        const userData = users[userKey]
        const newUserData = { ...userData }
        delete newUserData.id
        return newUserData
    }).filter((userData) => userData.position || userData.name)

    const gameStateToReturn = {
        userData: sanitizedUsers,
        history,
        player: playerData,
    }
    if (!id) {
        delete gameStateToReturn.player;
        gameStateToReturn.spectator = true;
    }
    return gameStateToReturn;
}

async function makeBackup() {
    const history = await db.get('history')
    const users = await db.get("users");
    const gameState = {
        history,
        users,
    }
    const currentBackups = db.get('backups');
    if (currentBackups['1Hour']) {
        currentBackups['2Hour'] = { ...currentBackups['1Hour'] };
    }
    currentBackups['1Hour'] = { ...gameState }
    await db.set('backups', currentBackups);
}

async function restoreFromBackup(time) {
    const backups = await db.get('backups');
    const backupData = backups[time];
    await db.set('history', backupData.history);
    await db.set('users', backupData.users);
    await addHistoryMessage('Gamestate restored from backup')
}

async function isIdInDb(id) {
    const user = await getUser(id);
    return !!user;
}

module.exports = {
    setupGame,
    getUser,
    getUserByName,
    getAllUsers,
    updateUser,
    addUser,
    getGameState,
    isIdInDb,
    setUsers,
    addToHistory,
    addHistoryMessage,
    restoreFromBackup,
    makeBackup,
    updateUserData,
    removeUser,
}
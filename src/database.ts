import {Client} from "@replit/database";
import {Game} from "./classes/Game";
import {Player} from "./classes/Player";

const db = new Client();

const createNewGame = (): Game => {
    return new Game();
}

const startNewGame =  async (): Promise<Game> => {
    const game = createNewGame()

    await db.set(game.id, game)
    return game;
}

const getGameByID = async (id: string): Promise<Game> => {
    const game = <Game>(await db.get(id))

    if (!game) {
        throw Error("Tried to get invalid game id")
    }

    return game
}

const getGameState = async (gameID): Promise<any> => {
    return await db.get(gameID)
}

async function makeBackup(gameID) {
    const gameState = db.get(gameID)

    const currentBackups = db.get(gameID + 'backups');
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
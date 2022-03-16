import {Game} from "./classes/Game";
import {Player} from "./classes/Player";
const Database = require("@replit/database")

const db = new Database();

export const getGameByID = async (id: string): Promise<Game> => {
    const gameJSON = await db.get(id)

    if (!gameJSON) {
        throw Error("Tried to get invalid game id")
    }

    console.log('fetched game with id: ' + gameJSON.id)
    return Game.fromJSON(gameJSON)
}

export const saveGame = async (game: Game) => {
    console.log(game.toJSON())
    await db.set(game.id, game.toJSON());
}

export const getGameState = async (gameID): Promise<any> => {
    // TODO: sanitize player IDs and ai state from gamestate
    return await db.get(gameID)
}

export async function makeBackup(gameID) {
    const gameState = db.get(gameID)

    const currentBackups = db.get(gameID + '|backups');
    if (currentBackups['1Hour']) {
        currentBackups['2Hour'] = { ...currentBackups['1Hour'] };
    }
    currentBackups['1Hour'] = { ...gameState }
    await db.set('backups', currentBackups);
}

export async function restoreFromBackup(gameId, time) {
    const backups = await db.get(gameId + '|backups');
    const backupData = backups[time];
    await db.set(gameId, backupData)
    // await addHistoryMessage('Gamestate restored from backup')
}

export async function isPlayerIDIsInUse(gameId, playerId): Promise<boolean> {
    const game = await getGameByID(gameId)
    return !!game.players.find((player: Player) => player.id === playerId)
}

export async function isGameIDIsInUse(gameId): Promise<boolean> {
    try {
        await getGameByID(gameId)
        return true
    } catch (e) {
        return false
    }
}
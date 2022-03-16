import {Game} from "./classes/Game"
import {generateRandomID} from "./utilities";
import {getGameByID, getGameState, isPlayerIDIsInUse, saveGame} from "./database"
import {Player} from "./classes/Player";
import {GameAction} from "./types";

export const createNewGame = async (): Promise<string> => {
    const game = new Game();
    await saveGame(game)
    return game.id
}

export const startGame =  async (gameId: string): Promise<void> => {
    const gameToStart = await getGameByID(gameId)
    gameToStart.startGame();
}

export const getGamestate = async (gameId): Promise<Game> => {
    return await getGameState(gameId);
}

export const addPlayer = async (gameID, playerName, playerLogo): Promise<string> => {
    let playerID = generateRandomID(5);

    while (await isPlayerIDIsInUse(gameID, playerID)) {
        playerID = generateRandomID(5)
    }

    console.log('making new player')
    const game = await getGameByID(gameID)
    const newPlayer = new Player(playerID, playerName, playerLogo)
    game.addPlayer(newPlayer)

    await saveGame(game)
    return newPlayer.id
}

export const handleGameAction = async (gameId: string, gameAction: GameAction): Promise<boolean> => {
    const game = await getGameByID(gameId)
    return game.handleAction(gameAction)
}

export const doesPlayerExist = async (gameId: string, playerId): Promise<boolean> => {
    const game = await getGameByID(gameId)
    const player = await game.getPlayerById(playerId)
    return !!player
}

export async function isNameTaken(gameId, name) {
    const game = await getGameByID(gameId)
    const matchingUser = await game.getPlayerByName(name);
    return !!matchingUser
}

// export async function restoreFromBackup(gameId: string, time: string) {
//     try {
//
//     } catch (e) {
//
//     }
// }
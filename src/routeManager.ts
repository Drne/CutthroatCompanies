import {getGameByID, getGameState, isGameIDIsInUse} from "./database";
import {addPlayer, createNewGame, isNameTaken, restoreFromBackup} from "./stateMachine";

export const addRoutes = (app, updateUsers) => {
    app.get('/', (req, res) => {
        res.send('Cutthroat Companies!');
    });

    // Get game state
    app.get('/api/game/:gameId', async (req, res) => {
        const game = await getGameByID(req.params.gameId)
        if (!!game) {
            res.sendStatus(404)
            return;
        }

        const gameState = getGameState(req.params.gameID)
        res.send(gameState)
    });

    // Create new game
    app.put('/api/game/newGame', async (req, res) => {
        try {
            const gameId = await createNewGame()
            res.send(gameId)
        } catch (error) {
            console.log(error)
            res.sendStatus(500);
        }
    });

    // Add new player to game
    app.put('/api/game/:gameId/newPlayer', async (req, res) => {
        try {
            const { name, logo} = req.body
            const gameId = req.params.gameId;
            const playerId = await addPlayer(gameId, name, logo)
            res.send(playerId)
            updateUsers();
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });

    // check valid game ID
    app.get('/api/game/:gameId', async (req, res) => {
        const gameId = req.params.gameId
        const isGameIdInUse = await isGameIDIsInUse(gameId)
        if (isGameIdInUse) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }

    })

    // check if name is taken
    app.get('/api/game/:gameId/player/:playerId', async (req, res) => {
        const isTaken = await isNameTaken(req.params.gameId, req.params.name);
        if (!isTaken) {
            res.sendStatus(200);
        } else {
            res.sendStatus(409);
        }
    })

    // restore backup
    app.post('/api/game/:gameId/backup', async (req, res) => {
        try {
            await restoreFromBackup(req.params.gameId, req.body.time);
            res.sendStatus(200);
            await updateUsers();
        } catch {
            res.sendStatus(400);
        }
    })

    // manually set player data
    // app.post('/api/setUserValues', async (req, res) => {
    //     try {
    //         if (req.body.key === process.env.ADMIN_KEY) {
    //             updateUserData(req.body.userId, req.body.userData)
    //             res.sendStatus(200);
    //             await updateUsers();
    //         } else {
    //             res.sendStatus(401);
    //         }
    //     } catch {
    //         res.sendStatus(400);
    //     }
    // })


    // concede game
    // app.post('/api/concede', async (req, res) => {
    //     try {
    //         if (req.body.key === process.env.ADMIN_KEY) {
    //             await removeUser(req.body.userId);
    //             await unlogId(req.body.userId);
    //             res.sendStatus(200);
    //             await updateUsers();
    //         } else {
    //             res.sendStatus(401);
    //         }
    //     } catch {
    //         res.sendStatus(400);
    //     }
    // })
}
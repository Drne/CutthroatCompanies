
/////////// Actions

const isValidAction = async (action, actor) => {

}

const executeAction = async (action, actor) => {

}

const getGamestate = async (id) => {
    const gamestate = await getGameState(id);
    return gamestate;
}

const getSpectatorGamestate = async () => {
    const spectatorGamestate = await getGameState();
    return spectatorGamestate;
}

const addPlayer = async () => {
    const playerID = generateRandomID();
    await addUser(playerID);
    return playerID;
}

const registerPlayer = async (id, name) => {
    const userData = await getUser(id)
    const userWithName = await getUserByName(name);
    if (userWithName) {
        throw Error();
    }
    const randomPosition = await getRandomPosition()
    await updateUser(id, { ...userData, name, position: randomPosition })
    await addHistoryMessage(`${name} has joined the game`)
}

const generateRandomNumber = (upperBound) => {
    return Math.floor(Math.random() *
        upperBound)
}

const playerCanTakeAction = async (id) => {

}

function isValidID(id) {
    return isIdInDb(id);
}

async function isNameTaken(name) {
    const matchingUser = await getUserByName(name);
    return !!matchingUser
}

module.exports = {
    playerCanTakeAction,
    registerPlayer,
    addPlayer,
    executeAction,
    isValidAction,
    getGamestate,
    isValidID,
    isNameTaken,
    getSpectatorGamestate
}
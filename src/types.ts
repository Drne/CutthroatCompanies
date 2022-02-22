export interface Game {
    id: string
    players: Player[]
    executedContracts: ExecutedContract[]
    currentContracts: Contract[]
    started: boolean
}

interface Player {
    id: string
    name: string,
    logo: string,
    resources: ResourceBundle
}

export interface Transaction {
    seller: any
    committedResources: Resource[]
}

export enum Resource {
    money="money",
    square="square",
    circle="circle",
    triangle="triangle",
    squareToCircleEngine="squareToCircleEngine",
    controllingInterest="controllingInterest",
}

export type ResourceBundle = {
    [key in keyof typeof Resource]: number
}

export interface Contract {
    offeredBundle: ResourceBundle
    desiredBundle: ResourceBundle,
    alternativeContracts: Contract[]
    // givenOffers: ResourceBundle[], ???
    playerID: string,
}

export interface ExecutedContract {
    executedOffer: ResourceBundle,
    givingPlayer: string,
    receivingPlayer: string,
}

export enum GameActionType {
    add="add",
    rescind="rescind",
    fulfill="fulfil"
}

export interface GameAction {
    type: GameActionType
    contract: Contract
    actingPlayerID: string
}

module.exports = {
    player: Player
}
import {ResourceBundle} from "./classes/ResourceBundle";

export interface Contract {
    id: string
    offeredBundle: ResourceBundle
    desiredBundle: ResourceBundle
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
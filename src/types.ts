import {Resource, ResourceBundle} from "./classes/ResourceBundle";
import {Contract} from "./classes/Contract";

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

export type BundleType = Partial<Record<Resource, number>>

export interface ResourceBundleJSON {
    bundle: BundleType
}

export interface ContractJSON {
    id: string
    offeredBundle: ResourceBundle
    desiredBundle: ResourceBundle
    alternativeContracts: ContractJSON[]
    offeringPlayerID: string
}

export interface GameActionJSON {
    type: GameActionType,
    contract: ContractJSON,
    actingPlayerID: string
}
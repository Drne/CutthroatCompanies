import { GameAction, GameActionType} from "../types";
import {generateRandomID} from "../utilities";
import {Player} from "./Player";
import {Contract} from "./Contract";


export class Game {
    id: string
    players: Player[]
    executedContracts: Contract[]
    currentContracts: Contract[]
    started: boolean

    constructor(id: string = generateRandomID(5), players = [], executedContracts = [], currentContracts = [], started = false) {
        this.id = id
        // TODO: Repopulate with AI players
        this.players = players
        this.executedContracts = executedContracts
        this.currentContracts = currentContracts
        this.started = started
    }

    toJSON(): Object {
        return {
            id: this.id,
            players: this.players.map(p => p.toJSON()),
            currentContracts: this.currentContracts.map(c => c.toJSON()),
            executedContracts: this.executedContracts.map(c => c.toJSON()),
            started: this.started
        }
    }

    static fromJSON(json: any): Game {
        const players = json.players.map((playerJson) => Player.fromJSON(playerJson))
        const id = json.id
        const executedContracts = json.executedContracts.map((executedContractJSON) => Contract.fromJSON(executedContractJSON))
        const currentContracts = json.currentContracts.map((currentContractsJSON) => Contract.fromJSON(currentContractsJSON))
        const started = json.started
        return new Game(id, players, currentContracts, executedContracts, started)
    }

    startGame(): void {
        this.started = true
    }

    // Player Methods //
    addPlayer(player: Player): void {
        this.players.push(player)
    }

    getPlayerById(id: string): Player {
        return this.players.find(p => p.id === id)
    }

    getPlayerByName(name: string): Player {
        return this.players.find(p => p.name === name)
    }

    // Contract Methods //
    addContract(contract: Contract): void {
        this.currentContracts.push(contract)
    }

    removeContract(providedContract: Contract): void {
        this.currentContracts = this.currentContracts.filter((contract) => contract.id != providedContract.id)
    }

    getContractByID(id: string): Contract | null {
        return this.currentContracts.find(c => c.id === id)
    }

    handleAction(action: GameAction): boolean {
        if (this.isActionValid(action)) {
            this.executeAction(action);
            return true
        }
        return false
    }

    isActionValid(action: GameAction): boolean {
        switch (action.type) {
            case GameActionType.add:
                const player = this.getPlayerById(action.actingPlayerID)
                return action.contract.offeredBundle.isSubset(player.resources)
            case GameActionType.fulfill:
                const contract = this.getContractByID(action.contract.id)
                if (contract) {
                    // Can't fulfill your own contract
                    if (contract.offeringPlayerID === action.actingPlayerID) {
                        return false
                    }
                    // Acting player has the resources to offer for this contract
                    const player = this.getPlayerById(action.actingPlayerID)
                    return player && contract.desiredBundle.isSubset(player.resources)
                } else {
                    return false
                }
            case GameActionType.rescind:
                return this.getContractByID(action.contract.id)?.offeringPlayerID === action.actingPlayerID
        }

        return true;
    }

    executeAction(action: GameAction): void {
        switch (action.type) {
            case GameActionType.add:
                this.addContract(action.contract)
                break;
            case GameActionType.fulfill:
                // give bundle to completing player
                const completer = this.getPlayerById(action.actingPlayerID)
                if (completer) {
                    completer.addResourceBundle(action.contract.offeredBundle)
                    completer.removeResourceBundle(action.contract.desiredBundle)
                } else {
                    throw Error("Unable to find player with ID: " + action.actingPlayerID)
                }
                // give bundle to originator player
                const originator = this.getPlayerById(action.contract.offeringPlayerID)
                if (originator) {
                    completer.addResourceBundle(action.contract.desiredBundle)
                } else {
                    throw Error("Unable to find player with ID: " + action.actingPlayerID)
                }
                // delete the contract
                this.removeContract(action.contract)
                break;
            case GameActionType.rescind:
                this.removeContract(action.contract)
                break;
            default:
                break;
        }
    }


}


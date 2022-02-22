import { GameAction, GameActionType} from "../types";
import {generateRandomID} from "../utilities";
import {Player} from "./Player";
import {Contract} from "./Contract";


class Game {
    id: string
    players: Player[]
    executedContracts: ExecutedContract[]
    currentContracts: Contract[]
    started: boolean

    constructor() {
        this.id = generateRandomID(5)
        // TODO: Repopulate with AI players
        this.players = []
        this.executedContracts = []
        this.currentContracts = []
        this.started = false
    }

    startGame(): void {
        this.started = true
    }

    // Player Methods //
    addPlayer(player: Player): void {
        this.players.push(player)
    }

    getPlayerById(id: string): Player | null {
        return this.players.find(p => p.id === id)
    }

    // Contract Methods //
    addContract(contract: Contract): void {
        this.currentContracts.push(contract)
    }

    removeContract(contract: Contract): void {
        this.currentContracts = this.currentContracts.filter((contract) => contract.id !=)
    }

    handleAction(action: GameAction): boolean {
        if (this.isActionValid(action)) {
            this.executeAction(action);
        }
        return false
    }

    isActionValid(action: GameAction): boolean {
        switch (action.type) {
            case GameActionType.add:
                return true
            case GameActionType.fulfill:
                return true
            case GameActionType.rescind:
                return this.currentContracts.find(c => c.id === action.contract.id)?.playerId === action.actingPlayer
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
                const originator = this.getPlayerById(action.contract.playerID)
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


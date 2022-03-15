import {AvailableResources, GameAction, GameActionType} from "../types";
import {generateRandomID} from "../utilities";
import {Player} from "./Player";
import {Contract} from "./Contract";
import {AIPlayer} from "./AIPlayer";
import {MarketPlayer} from "../ai/marketPlayer";
import {ResourceBundle} from "./ResourceBundle";


export class Game {
    id: string
    players: Player[]
    aiPlayers: AIPlayer[]
    executedContracts: Contract[]
    currentContracts: Contract[]
    availableResources: AvailableResources
    started: boolean

    constructor(id: string = generateRandomID(5), players = [], executedContracts = [], currentContracts = [], started = false, aiState = {}) {
        this.id = id
        this.players = players
        this.executedContracts = executedContracts
        this.currentContracts = currentContracts
        this.started = started

        // populate ai
        this.aiPlayers.push(new MarketPlayer(this.currentContracts, this.availableResources, aiState['resourceMarket'] ? aiState['resourceMarket'] : {}))
    }

    toJSON(): Object {
        return {
            id: this.id,
            players: this.players.map(p => p.toJSON()),
            currentContracts: this.currentContracts.map(c => c.toJSON()),
            executedContracts: this.executedContracts.map(c => c.toJSON()),
            started: this.started,
            aiState: this.generateAIState()
        }
    }

    static fromJSON(json: any): Game {
        const players = json.players.map((playerJson) => Player.fromJSON(playerJson))
        const id = json.id
        const executedContracts = json.executedContracts.map((executedContractJSON) => Contract.fromJSON(executedContractJSON))
        const currentContracts = json.currentContracts.map((currentContractsJSON) => Contract.fromJSON(currentContractsJSON))
        const started = json.started
        const aiState = json.aiState
        return new Game(id, players, currentContracts, executedContracts, started, aiState)
    }

    generateAIState() {
        const aiState = {}
        this.aiPlayers.forEach((ai) => {
            aiState[ai.id] = ai.generatePlayerStateJSON()
        })
        return aiState
    }

    startGame(): void {
        this.started = true

        // create resource pyramid
        // TODO

        // populate ai
        this.aiPlayers.push(new MarketPlayer(this.currentContracts, this.availableResources))
    }

    // Player Methods //
    addPlayer(player: Player): void {
        // create new resource and give player generator
        // TODO: don't use random string as resource name
        const newResource = generateRandomID(3)
        this.availableResources[1].push(newResource)
        const generatorName = newResource + 'Generator'
        this.availableResources[-1].push(generatorName)

        player.addResourceBundle(new ResourceBundle({ [generatorName]: 1}))

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

    // Action methods //
    handleAction(action: GameAction): boolean {
        if (this.isActionValid(action)) {
            this.executeAction(action);

            let responseActions: GameAction[] = []

            // AIs respond to the action
            this.aiPlayers.forEach((aiPlayer) => {
                const AIResponseActions: GameAction[] = aiPlayer.respondToAction(action, this.currentContracts, this.availableResources)
                responseActions = responseActions.concat(AIResponseActions)
            })
            responseActions.forEach((responseAction) => {
                this.executeAction(responseAction)
            })

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


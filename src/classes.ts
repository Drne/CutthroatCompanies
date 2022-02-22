const { Contract, ExecutedContract, Player, GameAction, GameActionType} = require("./types");
const { generateRandomID } = require("./utilities");

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

    addPlayer(player: Player): void {
        this.players.push(player)
    }

    addContract(contract: Contract): void {
        this.currentContracts.push(contract)
    }

    removeContract(contract: Contract): void {
        this.currentContracts = this.currentContracts.filter((contract) => contract.id !=)
    }

    handleAction(action: GameAction): void {
        if (this.isActionValid(action)) {
            this.executeAction(action);
        }

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

                break;
            case GameActionType.fulfill:
                this.addContract(action.contract)
                break;
            case GameActionType.rescind:
                this.
                break;
            default:
                break;
        }
    }
}


import {AvailableResources, GameAction} from "../types";
import {ResourceBundle} from "./ResourceBundle";
import {Contract} from "./Contract";
import {Player} from "./Player";

export class AIPlayer extends Player {

    constructor(id: string, name: string) {
        super(id, name, '', new ResourceBundle())
    }

    // An AI looks at the current game state and generates actions they want to execute on it
    generateActions(currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {
        throw new Error("Function unimplemented")
    }

    // An AI can respond to actions with more actions
    respondToAction(action: GameAction, currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {
        throw new Error("Function unimplemented")
    }

    generatePlayerStateJSON() {
        throw new Error("Function unimplemented")
    }
}
import {AIPlayer} from "../classes/AIPlayer";
import {AvailableResources, GameAction} from "../types";
import {Contract} from "../classes/Contract";

// EnginePlayer sells engines and creates engine contracts
export class MarketPlayer extends AIPlayer{

    // Create an infinite supply of all possible x->y engines
    constructor(currentContracts: Contract[], availableResources: AvailableResources) {
        super("1", 'Engine Market')
    }

    generateActions(currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {

        return []
    }
}

function generateEngineContracts() {

}
import {AIPlayer} from "../classes/AIPlayer";
import {AvailableResources, GameAction} from "../types";
import {Contract} from "../classes/Contract";

// Provides resource bundles and finished product bundles for money
export class SupplyBundlePlayer extends AIPlayer{

    constructor(currentContracts: Contract[], availableResources: AvailableResources) {
        super("3", "Supply Market")

    }

    generateActions(currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {

        return []
    }
}
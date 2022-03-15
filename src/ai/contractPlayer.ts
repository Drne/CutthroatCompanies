import {AIPlayer} from "../classes/AIPlayer";
import {AvailableResources, GameAction} from "../types";
import {Contract} from "../classes/Contract";

export class ContractPlayer extends AIPlayer{

    constructor(currentContracts: Contract[], availableResources: AvailableResources) {
        super("0", 'Finished Product Contracts')
    }

    generateActions(currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {

        return []
    }
}
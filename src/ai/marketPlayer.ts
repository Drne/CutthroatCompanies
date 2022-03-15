import {AIPlayer} from "../classes/AIPlayer";
import {AvailableResources, GameAction, GameActionType} from "../types";
import {Contract} from "../classes/Contract";
import {Resource, ResourceBundle} from "../classes/ResourceBundle";

// MarketPlayer wants to provide deals for every resource in the game that isn't money, for money
export class MarketPlayer extends AIPlayer{

    valueMap: {[resource: Resource]: {currentBuyValue: number, currentSellValue: number}}

    constructor(currentContracts: Contract[], availableResources: AvailableResources, valueMap = {}) {

        super("resourceMarket", "Resource Market")
        this.valueMap = valueMap

        // First time setup
        //TODO: Why is key a string?
        if (Object.entries(valueMap).length === 0) {
            Object.entries(availableResources).forEach(([key, value]: [string, Resource[]]) => {
                const startingValue = {currentBuyValue: parseInt(key) * 5, currentSellValue: parseInt(key) * 5}
                value.forEach((resource) => {
                    this.valueMap[resource] = startingValue
                })
            })
        }
    }

    generatePlayerStateJSON() {
        return this.valueMap
    }

    respondToAction(action: GameAction, currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {
        const actions = []

        // if this AI's contract was fulfilled, adjust market rate and create new one
        if (action.contract.offeringPlayerID === this.id && action.type === GameActionType.fulfill) {

            // The market sold resources
            if (action.contract.desiredBundle.getResource('money') > 0) {
                // fetch the resource from executed contract
                const resource = Object.keys(action.contract.offeredBundle.bundle)[0]

                // adjust market rate
                this.valueMap[resource].currentBuyValue += 1

                // replace contract
                const offeredBundle = new ResourceBundle({[resource]: 1})
                const desiredBundle = new ResourceBundle({['money']: this.valueMap[resource].currentBuyValue})
                const contract: Contract = new Contract(offeredBundle, desiredBundle, this.id)
                const newAction: GameAction = {type: GameActionType.add, actingPlayerID: this.id, contract}
                actions.push(newAction)

            } else { // the market bought resources
                // fetch the resource from executed contract
                const resource = Object.keys(action.contract.desiredBundle.bundle)[0]

                // adjust market rate
                this.valueMap[resource].currentSellValue -= 1

                // replace contract
                const desiredBundle = new ResourceBundle({[resource]: 1})
                const offeredBundle = new ResourceBundle({['money']: this.valueMap[resource].currentSellValue})
                const contract: Contract = new Contract(offeredBundle, desiredBundle, this.id)
                const newAction: GameAction = {type: GameActionType.add, actingPlayerID: this.id, contract}
                actions.push(newAction)
            }
        }


        return actions
    }

    adjustResourceValue(resource: Resource, contractType: 'buy' | 'sell', value: number) {
        const type = contractType === 'buy' ? 'currentBuyValue' : 'currentSellValue'
        this.valueMap[resource][type] = value
    }

    generateActions(currentContracts: Contract[], availableResources: AvailableResources): GameAction[] {

        const actions: GameAction[] = []
        const delayedMarketAdjustments: (() => void)[] = []

        // Fulfil any contracts offering resources for the market rate or better

        let ignoredResources: Resource[] = []
        Object.entries(availableResources).forEach(([key, value]: [string, Resource[]]) => {
            // ignore special resources
            if (parseInt(key) < 0) {
                ignoredResources = ignoredResources.concat(value)
            }
        })

        currentContracts.forEach((contract) => {
            if (!(contract.offeredBundle.containsAny(ignoredResources) || contract.desiredBundle.containsAny(ignoredResources))) {

                // determine if contract is =< market rate
                /// Convert offer to money
                let offerValue = contract.offeredBundle.bundle['money']
                Object.entries(contract.offeredBundle.bundle).forEach(([resource, amount]: [Resource, number]) => {
                    if (this.valueMap[resource] !== undefined) {
                        offerValue += this.valueMap[resource].currentSellValue * amount
                    }
                })
                // convert desired bundle to money
                let desiredBundleValue = contract.desiredBundle.bundle['money']
                Object.entries(contract.desiredBundle.bundle).forEach(([resource, amount]: [Resource, number]) => {
                    if (this.valueMap[resource] !== undefined) {
                        desiredBundleValue += this.valueMap[resource].currentBuyValue * amount
                    }
                })

                // fulfil contract if it is
                if (offerValue >= desiredBundleValue) {

                    // adjust market rates
                    // for buy
                    Object.entries(contract.desiredBundle).forEach(([resource, amount]) => {
                        if (resource !== 'money') {
                            delayedMarketAdjustments.push(() => this.adjustResourceValue(resource, 'buy', amount))
                        }
                    })

                    // for sell
                    Object.entries(contract.offeredBundle).forEach(([resource, amount]) => {
                        if (resource !== 'money') {
                            delayedMarketAdjustments.push(() => this.adjustResourceValue(resource, 'sell', -amount))
                        }
                    })


                    const fulfilGameAction: GameAction = {contract, actingPlayerID: this.id, type: GameActionType.fulfill}
                    actions.push(fulfilGameAction)
                }
            }
        })

        // execute delayed market adjustments
        delayedMarketAdjustments.forEach((adjustment) => adjustment())

        // create any missing contracts for resources. Adjust market rate for each
        const marketContracts = currentContracts.filter((contract) => contract.offeringPlayerID === this.id)

        // rescind all current market contracts
        marketContracts.forEach(contract => {
            const rescindAction: GameAction = {
                type: GameActionType.rescind,
                contract,
                actingPlayerID: this.id
            }
            actions.push(rescindAction)
        })

        // Adjust market rates and create new contracts for each resource
        Object.entries(availableResources).forEach(([key, value]: [string, Resource[]]) => {
            // ignore special resources
            if (parseInt(key) > 0) {
                value.forEach((resource) => {
                    // change market rate
                    const resourceSellValue = this.valueMap[resource].currentSellValue
                    const resourceBuyValue = this.valueMap[resource].currentBuyValue
                    if (Math.abs(resourceSellValue - resourceBuyValue) > 1) {
                        // decrease buy, increase sell
                        if (resourceBuyValue > resourceSellValue + 1) {
                            this.valueMap[resource].currentSellValue += 1
                            this.valueMap[resource].currentBuyValue = Math.max(this.valueMap[resource].currentBuyValue - 1, 1)
                        // increase buy, decrease sell
                        } else if (resourceSellValue > resourceSellValue + 1) {
                            this.valueMap[resource].currentBuyValue += 1
                            this.valueMap[resource].currentSellValue = Math.max(this.valueMap[resource].currentSellValue - 1, 1)
                        }
                    }

                    // create new sell contract for resource
                    const offeringSellBundle = new ResourceBundle({[resource]: 1})
                    const requestedSellBundle = new ResourceBundle({'money': this.valueMap[resource].currentSellValue})
                    const newSellContract = new Contract(offeringSellBundle, requestedSellBundle, this.id)
                    const generatedSellGameAction: GameAction = {
                        type: GameActionType.add,
                        actingPlayerID: this.id,
                        contract: newSellContract
                    }
                    actions.push(generatedSellGameAction)

                    // create new buy contract for resource
                    const requestedBuyBundle = new ResourceBundle({[resource]: 1})
                    const offeringBuyBundle = new ResourceBundle({'money': this.valueMap[resource].currentBuyValue})
                    const newBuyContract = new Contract(offeringBuyBundle, requestedBuyBundle, this.id)
                    const generatedBuyGameAction: GameAction = {
                        type: GameActionType.add,
                        actingPlayerID: this.id,
                        contract: newBuyContract
                    }
                    actions.push(generatedBuyGameAction)
                })
            }
        })

        return actions
    }
}
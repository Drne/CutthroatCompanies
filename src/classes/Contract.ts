import {ResourceBundle} from "./ResourceBundle";

export class Contract {
    id: string
    offeredBundle: ResourceBundle
    desiredBundle: ResourceBundle
    alternativeContracts: Contract[]
    offeringPlayerID: string

    constructor(id: string, offeredBundle: ResourceBundle, desiredBundle: ResourceBundle, alternativeContracts: Contract[], playerID: string) {
        this.id = id;
        this.offeredBundle = offeredBundle;
        this.desiredBundle = desiredBundle;
        this.alternativeContracts = alternativeContracts;
        this.offeringPlayerID = playerID;
    }

    toJSON(): Object {
        return {
            id: this.id,
            offeredBundle: this.offeredBundle.toJSON(),
            desiredBundle: this.desiredBundle.toJSON(),
            playerID: this.offeringPlayerID
        }
    }

    static fromJSON(json: any) {
        const id = json.id
        const offeredBundle = ResourceBundle.fromJson(json.offeredBundle)
        const desiredBundle = ResourceBundle.fromJson(json.desiredBundle)
        const alternativeContracts = json.alternativeContracts.map((altContract) => Contract.fromJSON(altContract))
        const offeringPlayer = json.offeringPlayerID
        return new Contract(id, offeredBundle, desiredBundle, alternativeContracts, offeringPlayer)
    }
}
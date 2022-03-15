import {ResourceBundle} from "./ResourceBundle";
import {generateRandomID} from "../utilities";

export class Contract {
    id: string
    offeredBundle: ResourceBundle
    desiredBundle: ResourceBundle
    alternativeContracts: Contract[]
    offeringPlayerID: string

    constructor(offeredBundle: ResourceBundle, desiredBundle: ResourceBundle, playerID: string, id?, alternativeContracts: Contract[] = []) {
        this.id = id ? id : generateRandomID(5);
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
        return new Contract(offeredBundle, desiredBundle, offeringPlayer, id, alternativeContracts)
    }
}
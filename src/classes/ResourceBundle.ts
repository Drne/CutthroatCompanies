import {BundleType} from "../types";

// export enum Resource {
//     money="money",
//     square="square",
//     circle="circle",
//     triangle="triangle",
//     squareToCircleEngine="squareToCircleEngine",
//     controllingInterest="controllingInterest",
// }

export type Resource = string

export class ResourceBundle {
    bundle: BundleType

    constructor(bundle: BundleType = {}) {
        this.bundle = bundle;
    }

    toJSON(): Object {
        return {
            bundle: this.bundle
        }
    }

    static fromJson(obj: any): ResourceBundle {
        const bundle : BundleType = obj.bundle
        return new ResourceBundle(bundle)
    }

    // is this bundle a subset of the given bundle
    isSubset(bundle: ResourceBundle): boolean {
        for (const [resource, amount] of Object.entries(this.bundle)) {
            if (!(resource in bundle && amount <= bundle[resource])) {
                return false
            }
        }
        return true
    }

    getResource(resource: Resource): number {
        if (!this.bundle[resource]){
            return 0
        } else {
            return this.bundle[resource]
        }
    }

    modifyResource(resource: Resource, amount: number): void {
        if (this.getResource(resource) + amount < 0) {
            throw Error("Attempt to lower " + resource + " below 0")
        }
        this.bundle[resource] = this.getResource(resource) + amount
    }

    combine(bundle: ResourceBundle) {
        for (const [resource, amount] of Object.entries(bundle)) {
            this.modifyResource(<Resource>resource, amount)
        }
    }

    remove(bundle: ResourceBundle) {
        for (const [resource, amount] of Object.entries(bundle)) {
            this.modifyResource(<Resource>resource, -1 * <number>amount)
        }
    }

    contains(resource, amount = 1): boolean {
        return this.bundle[resource] && this.bundle[resource] >= amount
    }

    containsAny(resources: Resource[]): boolean {
        return resources.some((resource) => {
            this.contains(resource)
        })
    }
}

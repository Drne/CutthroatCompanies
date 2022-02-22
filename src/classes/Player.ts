import {ResourceBundle } from "./ResourceBundle";

export class Player {
    id: string
    name: string
    logo: string
    resources: ResourceBundle

    constructor(id: string, name: string, logo: string, resources: ResourceBundle = new ResourceBundle()) {
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.resources = resources;
    }

    toJSON(): Object {
        return {
            id: this.id,
            name: this.name,
            resources: this.resources
        }
    }

    fromJSON(obj: Object): Player {
        return new Player()
    }

    addResourceBundle(resourceBundle: ResourceBundle): void {
        this.resources.combine(resourceBundle)
    }

    removeResourceBundle(resourceBundle: ResourceBundle): void {
        this.resources.remove(resourceBundle)
    }
}
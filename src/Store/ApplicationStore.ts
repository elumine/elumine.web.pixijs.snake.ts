import { createContext } from "react";
import { Session } from "./Session";
import { GameStore } from "./GameStore";

export class ApplicationStore {
    session = new Session();
    game = new GameStore();
    
    constructor() {
        console.info(this);   
    }
}

export const applicationStore = new ApplicationStore();
export const ApplicationContext = createContext(applicationStore);

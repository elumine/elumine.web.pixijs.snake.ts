import { createContext } from "react";
import { Session } from "./Session";
import { GameStore } from "./GameStore";
import { GameAnalytics } from "./Analytics";

export class ApplicationStore {
    session = new Session();
    game = new GameStore();
    analytics = new GameAnalytics();
    
    constructor() {
        console.info(this);   
    }
}

export const applicationStore = new ApplicationStore();
export const ApplicationContext = createContext(applicationStore);

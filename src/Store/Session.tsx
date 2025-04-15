import { makeAutoObservable } from "mobx";
import { StorageCommon } from "./Storage";

export class Session {
    static StorageToken = 'session/token';
    token: string = null;
    
    constructor() {
        makeAutoObservable(this);
        this.token = StorageCommon.GetItem(Session.StorageToken);
    }

    get exists() { return !!this.token; }

    setSession(token: string) {
        this.token = token;
        StorageCommon.SetItem(Session.StorageToken, this.token);
    }

    async login(username: string, password: string) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response =  await fetch(`https://3r7knulpzckk2d566xiubopydu0eynbi.lambda-url.us-east-1.on.aws/`)
        const data = await response.json();
        this.setSession(data);
    }

    async logout() {
        this.setSession(null);
    }
}
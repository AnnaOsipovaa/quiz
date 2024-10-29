import { Router } from "./router.js";

class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handlRouteChanging.bind(this));
        window.addEventListener('popstate', this.handlRouteChanging.bind(this));
    }

    handlRouteChanging() {
        this.router.openRoute();
    }
}


(new App());
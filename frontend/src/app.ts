import { Router } from "./router";

class App {
    private router: Router;

    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handlRouteChanging.bind(this));
        window.addEventListener('popstate', this.handlRouteChanging.bind(this));
    }

    private handlRouteChanging(): void {
        this.router.openRoute();
    }
}


(new App());
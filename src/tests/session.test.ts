import { SessionManager } from "../apps/bot/session/SessionManager";

const manager = new SessionManager();

const session = manager.create(

    "user-001",

    "628123456789"

);

console.log(session);

console.log(manager.has("628123456789"));

console.log(manager.get("628123456789"));
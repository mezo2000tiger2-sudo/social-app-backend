import { EventEmitter } from "node:events";
export const eventEmitter = new EventEmitter()

eventEmitter.on("Confirm_email", (fn: () => Promise<unknown>) => {
    Promise.resolve(fn()).catch((err) => console.error("Confirm_email failed:", err));
});
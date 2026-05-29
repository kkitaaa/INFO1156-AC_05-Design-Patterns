import { Observer } from "./observer.interface"

export class LoggerObserver implements Observer {
    update(event: string, payload: unknown): void {
        console.log(`[event:${event}]`, payload)
    }
}

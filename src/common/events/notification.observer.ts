import { Observer } from "./observer.interface"

export class NotificationObserver implements Observer {
    update(event: string, payload: unknown): void {
        const eventType = event.split(".")[0] || "event"

        console.log(`[notify:${eventType}]`, payload)
    }
}

import { LoggerObserver } from "./logger.observer"
import { NotificationObserver } from "./notification.observer"
import { Observer } from "./observer.interface"
import { RecomputeObserver } from "./recompute.observer"

export class EventManager {
    private readonly observers = new Set<Observer>()

    subscribe(observer: Observer): void {
        this.observers.add(observer)
    }

    unsubscribe(observer: Observer): void {
        this.observers.delete(observer)
    }

    notify(event: string, payload: unknown): void {
        this.observers.forEach((observer) => observer.update(event, payload))
    }
}

export const eventManager = new EventManager()

// Default observers keep the side effects decoupled from commands/controllers.
eventManager.subscribe(new LoggerObserver())
eventManager.subscribe(new NotificationObserver())
eventManager.subscribe(new RecomputeObserver())

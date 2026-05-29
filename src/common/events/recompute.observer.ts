import { Observer } from "./observer.interface"

export class RecomputeObserver implements Observer {
    update(event: string, payload: unknown): void {
        const postId =
            typeof payload === "object" &&
            payload !== null &&
            "postId" in payload
                ? Number((payload as { postId?: number }).postId)
                : undefined

        if (typeof postId === "number" && !Number.isNaN(postId)) {
            console.log(`[recompute] postId=${postId}`)
        }
    }
}

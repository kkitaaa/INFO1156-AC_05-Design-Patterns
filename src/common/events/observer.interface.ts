export interface Observer {
    update(event: string, payload: unknown): void
}

// este archivo define el formato estandar que el adapter siempre va a devolver
// como es solo una interfaz no tiene logica.
export interface ModerationResult {
    blocked: boolean;
    reason?: string;
}
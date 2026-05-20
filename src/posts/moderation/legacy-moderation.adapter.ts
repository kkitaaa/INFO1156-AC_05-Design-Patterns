import { legacyModerationApi } from "@/posts/legacy-moderation.client"
import { ModerationResult } from "@/posts/moderation/moderation-result.interface"

export class LegacyModerationAdapter {
    review(content: string): ModerationResult {
        const response = legacyModerationApi.review(content)

        if (response === "BLOCK") {
            return { blocked: true, reason: "blocked-by-legacy" }
        }

        if (typeof response === "number") {
            return { blocked: response < 1, reason: "numeric-legacy-rule" }
        }

        if (typeof response === "object" && "pass" in response) {
            return { blocked: !response.pass, reason: response.reason }
        }

        // response === "OK" u otro caso
        return { blocked: false }
    }
}

// esto es lo que hace cada bloque:

// lo que devuelve la api legacy  //   lo que devuelve el adapter

// BLOCK                             { blocked: true, reason: "blocked-by-legacy" }    
// 1 (número ≥ 1)                    { blocked: false, reason: "numeric-legacy-rule" }           
// 0 (número < 1)                    { blocked: true, reason: "numeric-legacy-rule" }
// { pass: true }                    { blocked: false, reason: "legacy-rule-3" }
// "OK" u otro caso                  { blocked: false }
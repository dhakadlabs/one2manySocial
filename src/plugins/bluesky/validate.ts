import type { BasePost, ValidationResult } from '../_interface/PlatformPlugin'
import { BLUESKY_CONFIG } from './config'

export function validate(post: BasePost): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!post.body || post.body.trim().length === 0) {
        errors.push('Post body cannot be empty')
    }

    if (post.body && post.body.length > BLUESKY_CONFIG.maxPostLength) {
        warnings.push(
            `Body exceeds ${BLUESKY_CONFIG.maxPostLength} characters — will be trimmed automatically`
        )
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
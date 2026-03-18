import type { BasePost, ValidationResult } from '../_interface/PlatformPlugin'
import { TELEGRAM_CONFIG } from './config'

export function validate(post: BasePost): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!post.body || post.body.trim().length === 0) {
        errors.push('Post body cannot be empty')
    }

    if (post.body && post.body.length > TELEGRAM_CONFIG.maxMessageLength) {
        errors.push(`Body exceeds Telegram limit of ${TELEGRAM_CONFIG.maxMessageLength} characters`)
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
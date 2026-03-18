import type { BasePost, ValidationResult } from '../_interface/PlatformPlugin'
import { DISCORD_CONFIG } from './config'

export function validate(post: BasePost): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!post.body || post.body.trim().length === 0) {
        errors.push('Post body cannot be empty')
    }

    if (post.body && post.body.length > DISCORD_CONFIG.embedMaxLength) {
        errors.push(`Body exceeds Discord limit of ${DISCORD_CONFIG.embedMaxLength} characters`)
    }

    if (post.body && post.body.length > DISCORD_CONFIG.maxBodyLength) {
        warnings.push('Body exceeds 2000 chars — will be sent as an embed instead of plain message')
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
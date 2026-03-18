import type { BasePost, ValidationResult } from '../_interface/PlatformPlugin'
import { DEVTO_CONFIG } from './config'

export function validate(post: BasePost): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!post.title || post.title.trim().length === 0) {
        errors.push('Title is required for Dev.to articles')
    }

    if (post.title && post.title.length > DEVTO_CONFIG.maxTitleLength) {
        errors.push(`Title exceeds Dev.to limit of ${DEVTO_CONFIG.maxTitleLength} characters`)
    }

    if (!post.body || post.body.trim().length === 0) {
        errors.push('Body cannot be empty')
    }

    if (post.tags && post.tags.length > DEVTO_CONFIG.maxTags) {
        warnings.push(`Dev.to supports max ${DEVTO_CONFIG.maxTags} tags — only first ${DEVTO_CONFIG.maxTags} will be used`)
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
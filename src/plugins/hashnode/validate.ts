import type { BasePost, ValidationResult } from '../_interface/PlatformPlugin'
import { HASHNODE_CONFIG } from './config'

export function validate(post: BasePost): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!post.title || post.title.trim().length === 0) {
        errors.push('Title is required for Hashnode articles')
    }

    if (!post.body || post.body.trim().length === 0) {
        errors.push('Body cannot be empty')
    }

    if (post.tags && post.tags.length > HASHNODE_CONFIG.maxTags) {
        warnings.push(
            `Hashnode supports max ${HASHNODE_CONFIG.maxTags} tags — only first ${HASHNODE_CONFIG.maxTags} will be used`
        )
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
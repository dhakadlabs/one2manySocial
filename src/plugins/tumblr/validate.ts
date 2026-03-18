import type { BasePost, ValidationResult } from '../_interface/PlatformPlugin'

export function validate(post: BasePost): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!post.body || post.body.trim().length === 0) {
        errors.push('Post body cannot be empty')
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}
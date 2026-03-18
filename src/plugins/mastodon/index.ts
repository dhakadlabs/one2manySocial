import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { MASTODON_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class MastodonPlugin implements PlatformPlugin {
    readonly id = MASTODON_CONFIG.id
    readonly name = MASTODON_CONFIG.name
    readonly description = MASTODON_CONFIG.description
    readonly authType = 'oauth2' as const
    readonly color = MASTODON_CONFIG.color
    readonly limits = {
        maxBodyLength: MASTODON_CONFIG.maxPostLength,
        requiresTitle: false,
        requiresImage: false,
        supportsMarkdown: false,
        supportsTags: true,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('Instance URL is required')
        await connect(credentials)
    }

    async disconnect(): Promise<void> {
        await disconnect()
    }

    async isConnected(): Promise<boolean> {
        return isConnected()
    }

    validate(post: BasePost): ValidationResult {
        return validate(post)
    }

    transform(post: BasePost): Record<string, unknown> {
        return transform(post) as Record<string, unknown>
    }

    async publish(post: BasePost): Promise<PublishResult> {
        return publishPost(post)
    }
}
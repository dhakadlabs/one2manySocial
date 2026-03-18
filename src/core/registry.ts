import type { PlatformPlugin } from '../plugins/_interface/PlatformPlugin'
import { DiscordPlugin } from '../plugins/discord'
import { DevToPlugin } from '../plugins/devto'
import { TelegramPlugin } from '../plugins/telegram'
import { BlueskyPlugin } from '../plugins/bluesky'
import { MastodonPlugin } from '../plugins/mastodon'

export const PLATFORM_REGISTRY: PlatformPlugin[] = [
    new DiscordPlugin(),
    new DevToPlugin(),
    new TelegramPlugin(),
    new BlueskyPlugin(),
    new MastodonPlugin(),
]

export function getPlugin(id: string): PlatformPlugin | undefined {
    return PLATFORM_REGISTRY.find(p => p.id === id)
}

export function getAllPlugins(): PlatformPlugin[] {
    return PLATFORM_REGISTRY
}
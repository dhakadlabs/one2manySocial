import type { PlatformPlugin } from '../plugins/_interface/PlatformPlugin'
import { DiscordPlugin } from '../plugins/discord'

// Registry of all available platform plugins
// Add new plugins here as they are built
export const PLATFORM_REGISTRY: PlatformPlugin[] = [
    new DiscordPlugin(),
]

export function getPlugin(id: string): PlatformPlugin | undefined {
    return PLATFORM_REGISTRY.find(p => p.id === id)
}

export function getAllPlugins(): PlatformPlugin[] {
    return PLATFORM_REGISTRY
}
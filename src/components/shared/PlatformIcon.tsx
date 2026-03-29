import {
    FaDiscord,
    FaTelegram,
} from 'react-icons/fa'
import {
    SiBluesky,
    SiMastodon,
    SiDevdotto,
    SiHashnode,
} from 'react-icons/si'

interface PlatformIconProps {
    platformId: string
    size?: number
    color?: string
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    discord: FaDiscord,
    telegram: FaTelegram,
    bluesky: SiBluesky,
    mastodon: SiMastodon,
    devto: SiDevdotto,
    hashnode: SiHashnode,
}

const PLATFORM_COLORS: Record<string, string> = {
    discord: '#5865f2',
    telegram: '#0088cc',
    bluesky: '#0085ff',
    mastodon: '#6364ff',
    devto: '#0838fe',
    hashnode: '#2962ff',
}

export default function PlatformIcon({ platformId, size = 18, color }: PlatformIconProps) {
    const Icon = PLATFORM_ICONS[platformId]
    const iconColor = color ?? PLATFORM_COLORS[platformId] ?? '#ffffff'

    if (!Icon) {
        return (
            <span style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: `${size * 0.6}px`,
                fontWeight: 800,
                color: iconColor,
            }}>
                {platformId.slice(0, 2).toUpperCase()}
            </span>
        )
    }

    return <Icon size={size} color={iconColor} />
}
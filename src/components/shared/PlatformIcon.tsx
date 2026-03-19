import {
    FaReddit,
    FaDiscord,
    FaTelegram,
    FaTumblr,
    FaWordpress,
    FaPinterest,
} from 'react-icons/fa'
import {
    SiBluesky,
    SiMastodon,
    SiDevdotto,
    SiHashnode,
    SiMedium,
} from 'react-icons/si'

interface PlatformIconProps {
    platformId: string
    size?: number
    color?: string
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    reddit: FaReddit,
    discord: FaDiscord,
    telegram: FaTelegram,
    tumblr: FaTumblr,
    wordpress: FaWordpress,
    pinterest: FaPinterest,
    bluesky: SiBluesky,
    mastodon: SiMastodon,
    devto: SiDevdotto,
    hashnode: SiHashnode,
    medium: SiMedium,
}

const PLATFORM_COLORS: Record<string, string> = {
    reddit: '#ff4500',
    discord: '#5865f2',
    telegram: '#0088cc',
    tumblr: '#35465c',
    wordpress: '#21759b',
    pinterest: '#e60023',
    bluesky: '#0085ff',
    mastodon: '#6364ff',
    devto: '#0838fe',
    hashnode: '#2962ff',
    medium: '#ffffff',
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
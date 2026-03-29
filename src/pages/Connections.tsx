import { useState } from 'react'
import { usePlatforms } from '../hooks/usePlatforms'
import { getPlugin } from '../core/registry'
import PlatformIcon from '../components/shared/PlatformIcon'

const ALL_PLATFORMS = [
    {
        id: 'discord',
        name: 'Discord',
        description: 'Post to a channel via webhook',
        authType: 'webhook',
        color: '#5865f2',
        bg: 'rgba(88,101,242,0.10)',
        fields: [
            {
                key: 'webhookUrl',
                label: 'Webhook URL',
                placeholder: 'https://discord.com/api/webhooks/...',
                type: 'text',
                hint: 'In Discord: Channel Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL',
            },
        ],
    },
    {
        id: 'devto',
        name: 'Dev.to',
        description: 'Publish articles to Dev.to',
        authType: 'api_token',
        color: '#0838fe',
        bg: 'rgba(8,56,254,0.10)',
        fields: [
            {
                key: 'apiKey',
                label: 'API Key',
                placeholder: 'Paste your Dev.to API key here...',
                type: 'password',
                hint: 'Get your API key from dev.to → Settings → Extensions → DEV API Keys → Generate API Key',
            },
        ],
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Post to a channel or group via bot',
        authType: 'bot_token',
        color: '#0088cc',
        bg: 'rgba(0,136,204,0.10)',
        fields: [
            {
                key: 'botToken',
                label: 'Bot Token',
                placeholder: '7123456789:AAF-xxxxxxxxxxxxxxxxxxxx',
                type: 'password',
                hint: 'Get your token from @BotFather on Telegram → /newbot',
            },
            {
                key: 'chatId',
                label: 'Chat ID',
                placeholder: '123456789 or -100123456789',
                type: 'text',
                hint: 'Send a message to your bot then visit: api.telegram.org/bot{TOKEN}/getUpdates',
            },
        ],
    },
    {
        id: 'bluesky',
        name: 'Bluesky',
        description: 'Post to Bluesky via AT Protocol',
        authType: 'api_token',
        color: '#0085ff',
        bg: 'rgba(0,133,255,0.10)',
        fields: [
            {
                key: 'handle',
                label: 'Handle',
                placeholder: 'yourname.bsky.social',
                type: 'text',
                hint: 'Your Bluesky handle — e.g. yourname.bsky.social',
            },
            {
                key: 'appPassword',
                label: 'App Password',
                placeholder: 'xxxx-xxxx-xxxx-xxxx',
                type: 'password',
                hint: 'Go to Bluesky → Settings → Privacy and Security → App Passwords → Add App Password',
            },
        ],
    },
    {
        id: 'mastodon',
        name: 'Mastodon',
        description: 'Post to any Mastodon instance via OAuth',
        authType: 'oauth2',
        color: '#6364ff',
        bg: 'rgba(99,100,255,0.10)',
        fields: [
            {
                key: 'instanceUrl',
                label: 'Instance URL',
                placeholder: 'https://mastodon.social',
                type: 'text',
                hint: 'Enter your Mastodon instance URL — e.g. https://mastodon.social or https://fosstodon.org',
            },
        ],
    },
    {
        id: 'hashnode',
        name: 'Hashnode',
        description: 'Publish articles to Hashnode',
        authType: 'graphql_token',
        color: '#2962ff',
        bg: 'rgba(41,98,255,0.10)',
        fields: [
            {
                key: 'accessToken',
                label: 'Personal Access Token',
                placeholder: 'Paste your Hashnode access token...',
                type: 'password',
                hint: 'Go to hashnode.com → Profile → Settings → Developer → Personal Access Tokens → Generate Token',
            },
            {
                key: 'publicationId',
                label: 'Publication ID',
                placeholder: '64a3b2c1d4e5f6a7b8c9d0e1',
                type: 'text',
                hint: 'Go to your Hashnode blog dashboard → Settings → scroll down to find Publication ID',
            },
        ],
    },
]

export default function Connections() {
    const { platforms, refresh } = usePlatforms()
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [connecting, setConnecting] = useState<string | null>(null)
    const [disconnecting, setDisconnecting] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const getConnectionStatus = (platformId: string) => {
        const p = platforms.find(p => p.plugin.id === platformId)
        return p?.connected ?? false
    }

    const handleConnect = async (platformId: string) => {
        const plugin = getPlugin(platformId)
        if (!plugin) return

        setConnecting(platformId)
        setError(null)
        setSuccess(null)

        try {
            await plugin.connect(formValues)
            setSuccess(`${plugin.name} connected successfully!`)
            setExpandedId(null)
            setFormValues({})
            await refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed')
        } finally {
            setConnecting(null)
        }
    }

    const handleDisconnect = async (platformId: string) => {
        const plugin = getPlugin(platformId)
        if (!plugin) return

        setDisconnecting(platformId)
        setError(null)
        setSuccess(null)

        try {
            await plugin.disconnect()
            setSuccess(`${plugin.name} disconnected.`)
            await refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Disconnect failed')
        } finally {
            setDisconnecting(null)
        }
    }

    return (
        <div style={styles.root}>

            {/* HEADER */}
            <div style={styles.header}>
                <h1 style={styles.title}>Connections</h1>
                <p style={styles.subtitle}>
                    Connect your platform accounts. All credentials are encrypted and stored locally in your browser only.
                </p>
            </div>

            {/* ALERTS */}
            {error && (
                <div style={styles.alertError}>
                    ✗ {error}
                </div>
            )}
            {success && (
                <div style={styles.alertSuccess}>
                    ✓ {success}
                </div>
            )}

            {/* PLATFORM LIST */}
            <div style={styles.list}>
                {ALL_PLATFORMS.map(platform => {
                    const connected = getConnectionStatus(platform.id)
                    const isExpanded = expandedId === platform.id
                    const isConnecting = connecting === platform.id
                    const isDisconnecting = disconnecting === platform.id

                    return (
                        <div key={platform.id} style={styles.card}>

                            {/* CARD HEADER */}
                            <div style={styles.cardHeader}>
                                <div style={styles.cardLeft}>
                                    <div style={{
                                        ...styles.platformIcon,
                                        background: platform.bg,
                                        border: `1px solid ${platform.color}30`,
                                    }}>
                                        <PlatformIcon platformId={platform.id} size={20} color={platform.color} />
                                    </div>
                                    <div style={styles.cardInfo}>
                                        <div style={styles.cardName}>{platform.name}</div>
                                        <div style={styles.cardDesc}>{platform.description}</div>
                                    </div>
                                </div>

                                <div style={styles.cardRight}>
                                    {/* STATUS */}
                                    <div style={styles.statusBadge}>
                                        <div style={{
                                            ...styles.statusDot,
                                            background: connected ? 'var(--success)' : 'var(--text-muted)',
                                            boxShadow: connected ? '0 0 6px var(--success)' : 'none',
                                        }} />
                                        <span style={{
                                            color: connected ? 'var(--success)' : 'var(--text-muted)',
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '11px',
                                        }}>
                                            {connected ? 'Connected' : 'Not connected'}
                                        </span>
                                    </div>

                                    {/* ACTION BUTTON */}
                                    {connected ? (
                                        <button
                                            style={styles.btnDanger}
                                            onClick={() => handleDisconnect(platform.id)}
                                            disabled={isDisconnecting}
                                        >
                                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                        </button>
                                    ) : (
                                        <button
                                            style={styles.btnPrimary}
                                            onClick={() => {
                                                setExpandedId(isExpanded ? null : platform.id)
                                                setError(null)
                                                setSuccess(null)
                                                setFormValues({})
                                            }}
                                        >
                                            {isExpanded ? 'Cancel' : 'Connect →'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* EXPANDED FORM */}
                            {isExpanded && !connected && (
                                <div style={styles.form}>
                                    <div style={styles.formDivider} />

                                    {platform.fields.map(field => (
                                        <div key={field.key} style={styles.fieldGroup}>
                                            <label style={styles.fieldLabel}>{field.label}</label>
                                            <input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={formValues[field.key] ?? ''}
                                                onChange={e => setFormValues(prev => ({
                                                    ...prev,
                                                    [field.key]: e.target.value,
                                                }))}
                                                style={styles.fieldInput}
                                            />
                                            {field.hint && (
                                                <div style={styles.fieldHint}>{field.hint}</div>
                                            )}
                                        </div>
                                    ))}

                                    <div style={styles.privacyNote}>
                                        🔒 Stored encrypted locally. Never sent to any server.
                                    </div>

                                    <button
                                        style={{
                                            ...styles.btnConnect,
                                            opacity: isConnecting ? 0.6 : 1,
                                            cursor: isConnecting ? 'not-allowed' : 'pointer',
                                        }}
                                        onClick={() => handleConnect(platform.id)}
                                        disabled={isConnecting}
                                    >
                                        {isConnecting ? 'Connecting...' : `Connect ${platform.name}`}
                                    </button>
                                </div>
                            )}

                        </div>
                    )
                })}
            </div>

        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        padding: '32px',
        maxWidth: '760px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },

    header: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    title: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    subtitle: {
        fontSize: '14px',
        fontWeight: 300,
        color: 'var(--text-muted)',
        lineHeight: 1.6,
    },

    alertError: {
        background: 'var(--error-dim)',
        border: '1px solid rgba(255,96,112,0.30)',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
        color: 'var(--error)',
        fontFamily: "'DM Sans', sans-serif",
    },
    alertSuccess: {
        background: 'var(--success-dim)',
        border: '1px solid rgba(94,255,192,0.30)',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
        color: 'var(--success)',
        fontFamily: "'DM Sans', sans-serif",
    },

    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },

    card: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        overflow: 'hidden',
    },

    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
    },
    cardLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    platformIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Syne', sans-serif",
        fontSize: '13px',
        fontWeight: 800,
        flexShrink: 0,
    },
    cardInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    cardName: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    cardDesc: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: 300,
    },
    cardRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    statusDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
    },

    btnPrimary: {
        background: 'linear-gradient(135deg, #8b78ff 0%, #7060ee 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '8px 18px',
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '13px',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(139,120,255,0.30)',
        transition: 'all 0.15s ease',
    },
    btnDanger: {
        background: 'var(--error-dim)',
        color: 'var(--error)',
        border: '1px solid rgba(255,96,112,0.25)',
        borderRadius: '8px',
        padding: '8px 18px',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },

    form: {
        padding: '0 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    formDivider: {
        height: '1px',
        background: 'var(--border-subtle)',
        marginBottom: '4px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    fieldInput: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'var(--text-primary)',
        fontFamily: "'DM Mono', monospace",
        fontSize: '12px',
        outline: 'none',
        transition: 'all 0.15s ease',
        width: '100%',
    },
    fieldHint: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.5,
    },
    privacyNote: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif",
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
    },
    btnConnect: {
        background: 'linear-gradient(135deg, #8b78ff 0%, #7060ee 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '11px 24px',
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(139,120,255,0.30)',
        transition: 'all 0.15s ease',
        alignSelf: 'flex-start',
    },

    comingSoon: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '24px',
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
    },
    comingSoonLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    comingSoonGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    comingSoonChip: {
        background: 'var(--glass-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '100px',
        padding: '4px 12px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif",
    },
}
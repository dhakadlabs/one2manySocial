import { useState } from 'react'
import PlatformIcon from '../components/shared/PlatformIcon'

interface HelpSection {
    platformId: string
    name: string
    color: string
    bg: string
    authType: string
    intro: string
    steps: {
        title: string
        description: string
        code?: string
    }[]
    notes?: string[]
}

const HELP_SECTIONS: HelpSection[] = [
    {
        platformId: 'discord',
        name: 'Discord',
        color: '#5865f2',
        bg: 'rgba(88,101,242,0.10)',
        authType: 'Webhook URL',
        intro: 'Discord uses a webhook URL to receive messages. No account login required — just create a webhook in your server settings.',
        steps: [
            {
                title: 'Open your Discord server',
                description: 'Go to the Discord server where you want to post. You need to have admin or manage webhooks permission.',
            },
            {
                title: 'Go to Channel Settings',
                description: 'Right-click on the channel you want to post to and click "Edit Channel".',
            },
            {
                title: 'Open Integrations',
                description: 'In the channel settings, click on "Integrations" in the left sidebar.',
            },
            {
                title: 'Create a Webhook',
                description: 'Click "Webhooks" then "New Webhook". Give it a name like "one2manySocial" and optionally set an avatar.',
            },
            {
                title: 'Copy the Webhook URL',
                description: 'Click "Copy Webhook URL". It will look like this:',
                code: 'https://discord.com/api/webhooks/1234567890/xxxxxxxxxxxx',
            },
            {
                title: 'Paste in the app',
                description: 'Go to Connections → Discord → Connect → paste the webhook URL and click Connect Discord.',
            },
        ],
        notes: [
            'The webhook posts as a bot, not your personal account',
            'You can create different webhooks for different channels',
            'Webhook URLs should be kept private — anyone with the URL can post to your channel',
        ],
    },
    {
        platformId: 'devto',
        name: 'Dev.to',
        color: '#0838fe',
        bg: 'rgba(8,56,254,0.10)',
        authType: 'API Key',
        intro: 'Dev.to uses a simple API key for authentication. You generate it once from your account settings and paste it into the app.',
        steps: [
            {
                title: 'Log in to Dev.to',
                description: 'Go to dev.to and log in to your account.',
            },
            {
                title: 'Open Settings',
                description: 'Click your profile picture in the top right → Settings.',
            },
            {
                title: 'Go to Extensions',
                description: 'In the left sidebar of Settings, click "Extensions".',
            },
            {
                title: 'Generate an API Key',
                description: 'Scroll down to "DEV Community API Keys". Type a description like "one2manySocial" and click "Generate API Key".',
            },
            {
                title: 'Copy the key',
                description: 'Copy the generated key immediately — it will only be shown once.',
            },
            {
                title: 'Paste in the app',
                description: 'Go to Connections → Dev.to → Connect → paste the API key and click Connect Dev.to.',
            },
        ],
        notes: [
            'Posts are published immediately as public articles',
            'Title is required for Dev.to articles',
            'You can add up to 4 tags',
            'Markdown is fully supported',
        ],
    },
    {
        platformId: 'telegram',
        name: 'Telegram',
        color: '#0088cc',
        bg: 'rgba(0,136,204,0.10)',
        authType: 'Bot Token + Chat ID',
        intro: 'Telegram uses a bot to send messages. You create a bot via BotFather, then use it to post to any chat, group, or channel.',
        steps: [
            {
                title: 'Open Telegram and find BotFather',
                description: 'Search for @BotFather in Telegram and open a chat with it.',
            },
            {
                title: 'Create a new bot',
                description: 'Send the command /newbot to BotFather.',
                code: '/newbot',
            },
            {
                title: 'Set a name and username',
                description: 'BotFather will ask for a display name and a username. The username must end in "bot" — for example: one2manysocial_bot',
            },
            {
                title: 'Copy the bot token',
                description: 'BotFather will give you a token that looks like this:',
                code: '7123456789:AAF-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            },
            {
                title: 'Get your Chat ID',
                description: 'Send any message to your bot, then open this URL in your browser (replace YOUR_TOKEN with your actual token):',
                code: 'https://api.telegram.org/botYOUR_TOKEN/getUpdates',
            },
            {
                title: 'Find the chat ID in the response',
                description: 'Look for "chat":{"id": in the JSON response. That number is your Chat ID. For channels it will be a negative number starting with -100.',
            },
            {
                title: 'Add bot to channel (if posting to a channel)',
                description: 'Go to your channel → Settings → Administrators → Add Administrator → search for your bot → give it "Post Messages" permission.',
            },
            {
                title: 'Paste in the app',
                description: 'Go to Connections → Telegram → Connect → paste the bot token and chat ID → click Connect Telegram.',
            },
        ],
        notes: [
            'For personal chats: Chat ID is a positive number',
            'For groups: Chat ID is a negative number',
            'For channels: Chat ID starts with -100',
            'Your bot must be added as admin to post in channels',
        ],
    },
    {
        platformId: 'bluesky',
        name: 'Bluesky',
        color: '#0085ff',
        bg: 'rgba(0,133,255,0.10)',
        authType: 'Handle + App Password',
        intro: 'Bluesky uses App Passwords — special passwords separate from your main account password — for third-party apps.',
        steps: [
            {
                title: 'Log in to Bluesky',
                description: 'Go to bsky.app and log in to your account.',
            },
            {
                title: 'Open Settings',
                description: 'Click your profile picture → Settings.',
            },
            {
                title: 'Go to Privacy and Security',
                description: 'In settings, find "Privacy and Security" section.',
            },
            {
                title: 'Open App Passwords',
                description: 'Click "App Passwords" then "Add App Password".',
            },
            {
                title: 'Name your app password',
                description: 'Give it a name like "one2manySocial" and click "Next".',
            },
            {
                title: 'Copy the app password',
                description: 'Copy the generated password — it looks like this:',
                code: 'xxxx-xxxx-xxxx-xxxx',
            },
            {
                title: 'Find your handle',
                description: 'Your handle is your Bluesky username — it looks like:',
                code: 'yourname.bsky.social',
            },
            {
                title: 'Paste in the app',
                description: 'Go to Connections → Bluesky → Connect → enter your handle and app password → click Connect Bluesky.',
            },
        ],
        notes: [
            'Never use your main account password — always use an App Password',
            'Posts are limited to 300 characters',
            'Hashtags count toward the character limit',
            'You can revoke app passwords anytime from Settings',
        ],
    },
    {
        platformId: 'mastodon',
        name: 'Mastodon',
        color: '#6364ff',
        bg: 'rgba(99,100,255,0.10)',
        authType: 'OAuth 2.0',
        intro: 'Mastodon uses OAuth 2.0. You enter your instance URL and the app will open Mastodon in your browser to approve access.',
        steps: [
            {
                title: 'Find your instance URL',
                description: 'Your Mastodon instance is the server you signed up on. Look at your profile URL — it will be something like:',
                code: 'https://mastodon.social or https://fosstodon.org',
            },
            {
                title: 'Click Connect in the app',
                description: 'Go to Connections → Mastodon → Connect → enter your instance URL (e.g. https://mastodon.social).',
            },
            {
                title: 'Approve access in browser',
                description: 'Your browser will open your Mastodon instance. Log in if needed and click "Authorize" to grant access.',
            },
            {
                title: 'You will be redirected back',
                description: 'After approving, you will be automatically redirected back to the app and Mastodon will be connected.',
            },
        ],
        notes: [
            'Works with any Mastodon instance — not just mastodon.social',
            'Posts are limited to 500 characters by default (some instances allow more)',
            'You can revoke access anytime from your Mastodon account settings',
            'The app only requests write permissions for posting',
        ],
    },
    {
        platformId: 'hashnode',
        name: 'Hashnode',
        color: '#2962ff',
        bg: 'rgba(41,98,255,0.10)',
        authType: 'Personal Access Token + Publication ID',
        intro: 'Hashnode requires a personal access token and your publication ID. Both are found in your Hashnode dashboard settings.',
        steps: [
            {
                title: 'Log in to Hashnode',
                description: 'Go to hashnode.com and log in to your account.',
            },
            {
                title: 'Open Account Settings',
                description: 'Click your profile picture → Account Settings.',
            },
            {
                title: 'Go to Developer settings',
                description: 'In the left sidebar, click "Developer".',
            },
            {
                title: 'Generate a Personal Access Token',
                description: 'Click "Generate New Token", give it a name like "one2manySocial", and copy the token.',
            },
            {
                title: 'Find your Publication ID',
                description: 'Go to your blog dashboard (hashnode.com/dashboard). Click on your blog → Settings. Scroll down to find your Publication ID.',
            },
            {
                title: 'Paste in the app',
                description: 'Go to Connections → Hashnode → Connect → paste your access token and publication ID → click Connect Hashnode.',
            },
        ],
        notes: [
            'Title is required for Hashnode articles',
            'You can add up to 5 tags',
            'Markdown is fully supported',
            'Posts are published immediately as public articles',
        ],
    },
]

export default function Help() {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    return (
        <div style={styles.root}>

            <div style={styles.header}>
                <h1 style={styles.title}>Help & Connections Guide</h1>
                <p style={styles.subtitle}>
                    Step-by-step instructions for connecting each platform to one2manySocial.
                    Click on any platform to expand the setup guide.
                </p>
            </div>

            <div style={styles.list}>
                {HELP_SECTIONS.map(section => {
                    const isExpanded = expandedId === section.platformId

                    return (
                        <div key={section.platformId} style={styles.card}>

                            {/* HEADER */}
                            <div
                                style={styles.cardHeader}
                                onClick={() => setExpandedId(isExpanded ? null : section.platformId)}
                            >
                                <div style={styles.cardLeft}>
                                    <div style={{
                                        ...styles.platformIcon,
                                        background: section.bg,
                                        border: `1px solid ${section.color}30`,
                                    }}>
                                        <PlatformIcon
                                            platformId={section.platformId}
                                            size={22}
                                            color={section.color}
                                        />
                                    </div>
                                    <div style={styles.cardInfo}>
                                        <div style={styles.cardName}>{section.name}</div>
                                        <div style={styles.cardAuthType}>
                                            Auth: {section.authType}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    ...styles.expandIcon,
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                }}>
                                    ▾
                                </div>
                            </div>

                            {/* EXPANDED CONTENT */}
                            {isExpanded && (
                                <div style={styles.expandedSection}>
                                    <div style={styles.divider} />

                                    <p style={styles.intro}>{section.intro}</p>

                                    <div style={styles.stepsLabel}>Setup Steps</div>

                                    <div style={styles.steps}>
                                        {section.steps.map((step, i) => (
                                            <div key={i} style={styles.step}>
                                                <div style={styles.stepNumber}>{i + 1}</div>
                                                <div style={styles.stepContent}>
                                                    <div style={styles.stepTitle}>{step.title}</div>
                                                    <div style={styles.stepDesc}>{step.description}</div>
                                                    {step.code && (
                                                        <div style={styles.codeBlock}>
                                                            {step.code}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {section.notes && section.notes.length > 0 && (
                                        <div style={styles.notesSection}>
                                            <div style={styles.notesLabel}>Notes</div>
                                            {section.notes.map((note, i) => (
                                                <div key={i} style={styles.noteItem}>
                                                    <span style={styles.noteDot}>◆</span>
                                                    {note}
                                                </div>
                                            ))}
                                        </div>
                                    )}

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
        maxWidth: '780px',
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
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    card: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        cursor: 'pointer',
    },
    cardLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    platformIcon: {
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
    cardAuthType: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
    },
    expandIcon: {
        color: 'var(--text-muted)',
        fontSize: '16px',
        transition: 'transform 0.2s ease',
    },
    expandedSection: {
        padding: '0 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    divider: {
        height: '1px',
        background: 'var(--border-subtle)',
    },
    intro: {
        fontSize: '13.5px',
        fontWeight: 300,
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
    },
    stepsLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    steps: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    step: {
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'var(--accent-dim)',
        border: '1px solid var(--border-accent)',
        color: 'var(--accent-bright)',
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '2px',
    },
    stepContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
    },
    stepTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    stepDesc: {
        fontSize: '13px',
        fontWeight: 300,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    codeBlock: {
        marginTop: '6px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        color: 'var(--accent-bright)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
    notesSection: {
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    notesLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '2px',
    },
    noteItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        fontSize: '12.5px',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
    },
    noteDot: {
        color: 'var(--accent)',
        fontSize: '7px',
        flexShrink: 0,
        marginTop: '4px',
    },
}
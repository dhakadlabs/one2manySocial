import { useState } from 'react'
import { db } from '../db/client'

export default function Settings() {
    const [clearing, setClearing] = useState(false)
    const [cleared, setCleared] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleClearData = async () => {
        setClearing(true)
        try {
            await db.posts.clear()
            await db.postPlatforms.clear()
            await db.scheduledPosts.clear()
            setCleared(true)
            setShowConfirm(false)
            setTimeout(() => setCleared(false), 3000)
        } catch (err) {
            console.error('Failed to clear data:', err)
        } finally {
            setClearing(false)
        }
    }

    const handleClearConnections = async () => {
        await db.platformAccounts.clear()
        sessionStorage.clear()
        window.location.reload()
    }

    return (
        <div style={styles.root}>

            <div style={styles.header}>
                <h1 style={styles.title}>Settings</h1>
                <p style={styles.subtitle}>
                    Manage your app preferences and local data.
                </p>
            </div>

            {/* ABOUT */}
            <div style={styles.section}>
                <div style={styles.sectionLabel}>About</div>
                <div style={styles.card}>
                    <div style={styles.aboutRow}>
                        <div style={styles.aboutLogo}>
                            one2many<span style={{ color: 'var(--accent)' }}>Social</span>
                        </div>
                        <div style={styles.aboutMeta}>by Dhakad Labs</div>
                    </div>
                    <div style={styles.aboutDesc}>
                        A privacy-first, local-first web app for publishing content across multiple platforms simultaneously.
                        No server. No login. No cloud. Everything stays on your device.
                    </div>
                    <div style={styles.aboutStats}>
                        {[
                            { label: 'Architecture', value: 'Local-first' },
                            { label: 'Storage', value: 'IndexedDB (browser)' },
                            { label: 'Encryption', value: 'AES-256-GCM' },
                            { label: 'Backend', value: 'None' },
                        ].map(stat => (
                            <div key={stat.label} style={styles.statItem}>
                                <div style={styles.statLabel}>{stat.label}</div>
                                <div style={styles.statValue}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DATA MANAGEMENT */}
            <div style={styles.section}>
                <div style={styles.sectionLabel}>Data Management</div>
                <div style={styles.card}>

                    <div style={styles.dataRow}>
                        <div style={styles.dataInfo}>
                            <div style={styles.dataTitle}>Clear Post History</div>
                            <div style={styles.dataDesc}>
                                Removes all posts and publish logs from your local storage.
                                Your platform connections will not be affected.
                            </div>
                        </div>
                        <button
                            style={styles.btnDanger}
                            onClick={() => setShowConfirm(true)}
                            disabled={clearing}
                        >
                            {clearing ? 'Clearing...' : 'Clear History'}
                        </button>
                    </div>

                    {cleared && (
                        <div style={styles.successMsg}>
                            ✓ Post history cleared successfully.
                        </div>
                    )}

                    {showConfirm && (
                        <div style={styles.confirmBox}>
                            <div style={styles.confirmText}>
                                Are you sure? This will permanently delete all your post history and publish logs.
                            </div>
                            <div style={styles.confirmBtns}>
                                <button
                                    style={styles.btnDanger}
                                    onClick={handleClearData}
                                    disabled={clearing}
                                >
                                    {clearing ? 'Clearing...' : 'Yes, clear everything'}
                                </button>
                                <button
                                    style={styles.btnGhost}
                                    onClick={() => setShowConfirm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={styles.divider} />

                    <div style={styles.dataRow}>
                        <div style={styles.dataInfo}>
                            <div style={styles.dataTitle}>Disconnect All Platforms</div>
                            <div style={styles.dataDesc}>
                                Removes all connected platform accounts and encrypted tokens from your browser.
                                You will need to reconnect each platform.
                            </div>
                        </div>
                        <button
                            style={styles.btnDanger}
                            onClick={handleClearConnections}
                        >
                            Disconnect All
                        </button>
                    </div>

                </div>
            </div>

            {/* PRIVACY NOTE */}
            <div style={styles.section}>
                <div style={styles.sectionLabel}>Privacy</div>
                <div style={styles.privacyCard}>
                    {[
                        '🔒  All tokens encrypted with AES-256-GCM before storage',
                        '💾  Everything stored locally in your browser — nothing on any server',
                        '📡  Only outbound traffic is direct API calls to platforms you choose',
                        '🚫  No analytics, no tracking, no data collection of any kind',
                        '🗑️  Clearing browser data removes everything — no data lingers anywhere',
                    ].map((point, i) => (
                        <div key={i} style={styles.privacyPoint}>{point}</div>
                    ))}
                </div>
            </div>

        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        padding: '32px',
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
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
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    sectionLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    card: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    aboutRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    aboutLogo: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '18px',
        fontWeight: 800,
        color: 'var(--text-primary)',
    },
    aboutMeta: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '1px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
    },
    aboutDesc: {
        fontSize: '13px',
        fontWeight: 300,
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
    },
    aboutStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
    },
    statItem: {
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    statLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    statValue: {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)',
    },
    dataRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '20px',
    },
    dataInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
    },
    dataTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    dataDesc: {
        fontSize: '12px',
        fontWeight: 300,
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        maxWidth: '420px',
    },
    divider: {
        height: '1px',
        background: 'var(--border-subtle)',
    },
    successMsg: {
        background: 'var(--success-dim)',
        border: '1px solid rgba(94,255,192,0.25)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        color: 'var(--success)',
        fontFamily: "'DM Sans', sans-serif",
    },
    confirmBox: {
        background: 'rgba(255,96,112,0.06)',
        border: '1px solid rgba(255,96,112,0.20)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    confirmText: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    confirmBtns: {
        display: 'flex',
        gap: '10px',
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
        whiteSpace: 'nowrap',
    },
    btnGhost: {
        background: 'transparent',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '8px 18px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
    privacyCard: {
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    privacyPoint: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.6,
        padding: '8px 12px',
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
    },
}
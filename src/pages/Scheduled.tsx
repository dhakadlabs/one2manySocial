export default function Scheduled() {
    return (
        <div style={styles.root}>
            <div style={styles.header}>
                <h1 style={styles.title}>Scheduled</h1>
                <p style={styles.subtitle}>
                    Schedule posts to publish automatically at a specific time.
                </p>
            </div>

            <div style={styles.comingSoon}>
                <div style={styles.icon}>◷</div>
                <div style={styles.comingTitle}>Coming Soon</div>
                <div style={styles.comingDesc}>
                    Scheduling is currently in development. You will be able to schedule posts
                    to publish automatically across all your connected platforms at any future date and time.
                </div>
                <div style={styles.features}>
                    {[
                        'Schedule to multiple platforms at once',
                        'Posts run locally — no server needed',
                        'Missed post recovery on app relaunch',
                        'Full history of scheduled and published posts',
                    ].map((f, i) => (
                        <div key={i} style={styles.featureItem}>
                            <span style={styles.featureDot}>◆</span>
                            {f}
                        </div>
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
    comingSoon: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
    },
    icon: {
        fontSize: '48px',
        color: 'var(--accent)',
        fontFamily: "'Syne', sans-serif",
    },
    comingTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    comingDesc: {
        fontSize: '14px',
        fontWeight: 300,
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        maxWidth: '480px',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '8px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'left',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        padding: '10px 14px',
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
    },
    featureDot: {
        color: 'var(--accent)',
        fontSize: '8px',
        flexShrink: 0,
    },
}
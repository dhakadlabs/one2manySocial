import { useNavigate } from 'react-router-dom'

const platforms = [
    { id: 'mastodon', name: 'Mastodon', abbr: 'Ms', color: '#6364ff', bg: 'rgba(99,100,255,0.12)' },
    { id: 'bluesky', name: 'Bluesky', abbr: 'Bs', color: '#0085ff', bg: 'rgba(0,133,255,0.12)' },
    { id: 'discord', name: 'Discord', abbr: 'Dc', color: '#5865f2', bg: 'rgba(88,101,242,0.12)' },
    { id: 'telegram', name: 'Telegram', abbr: 'Tg', color: '#0088cc', bg: 'rgba(0,136,204,0.12)' },
    { id: 'devto', name: 'Dev.to', abbr: 'Dv', color: '#0838fe', bg: 'rgba(8,56,254,0.12)' },
    { id: 'hashnode', name: 'Hashnode', abbr: 'Hn', color: '#2962ff', bg: 'rgba(41,98,255,0.12)' },
]

const features = [
    {
        icon: '✦',
        title: 'Write Once',
        desc: 'One composer. One post. The app handles formatting and distribution for every platform automatically.',
    },
    {
        icon: '⬡',
        title: 'Publish Everywhere',
        desc: 'Mastodon, Bluesky, Discord, Telegram, Dev.to, Hashnode — all at once.',
    },
    {
        icon: '◈',
        title: 'Own Everything',
        desc: 'No server. No login. No cloud. Every token is encrypted and stored in your browser only. Your data never leaves your device.',
    },
    {
        icon: '◎',
        title: 'Failures Are Isolated',
        desc: 'If one platform fails, the rest still succeed. Independent tasks per platform. Nothing blocks anything.',
    },
]

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div style={styles.root}>

            {/* NAV */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.logo}>
                        one2many<span style={styles.logoAccent}>Social</span>
                    </div>
                    <div style={styles.navRight}>
                        <span style={styles.navTag}>by Dhakad Labs</span>
                        <button
                            style={styles.btnPrimary}
                            onClick={() => navigate('/app')}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(139,120,255,0.5)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(139,120,255,0.35)'
                            }}
                        >
                            Enter App →
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section style={styles.hero}>
                <div style={styles.heroInner}>

                    <div style={styles.heroBadge}>
                        <span style={styles.heroBadgeDot} />
                        Local-first · Privacy-focused · No login required
                    </div>

                    <div style={styles.heroBeta}>
                        Beta version · Currently supports publishing articles without images and videos...
                    </div>

                    <h1 style={styles.heroTitle}>
                        Write once.<br />
                        <span style={styles.heroTitleAccent}>Reach everywhere.</span>
                    </h1>

                    <p style={styles.heroSub}>
                        Stop opening 10 tabs and copy-pasting the same post everywhere.
                        one2manySocial publishes your content to every platform simultaneously —
                        privately, directly from your browser.
                    </p>

                    <div style={styles.heroBtns}>
                        <button
                            style={styles.btnPrimaryLg}
                            onClick={() => navigate('/app')}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(139,120,255,0.55)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 32px rgba(139,120,255,0.40)'
                            }}
                        >
                            Enter App — it's free
                        </button>
                        <button
                            style={styles.btnGhost}
                            onClick={() => window.open('https://github.com/dhakadlabs/one2manySocial', '_blank')}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)'
                            }}
                        >
                            View on GitHub
                        </button>

                        <button
                            style={{ ...styles.btnGhost, borderColor: 'rgba(139,120,255,0.3)' }}
                            onClick={() => window.open('https://dhakadlabs.site/#support', '_blank')}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,120,255,0.08)'
                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,120,255,0.5)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,120,255,0.3)'
                            }}
                        >
                            Support Us
                        </button>
                    </div>

                    {/* PLATFORM PILLS */}
                    <div style={styles.platformRow}>
                        {platforms.map((p, i) => (
                            <div
                                key={p.id}
                                style={{
                                    ...styles.platformPill,
                                    background: p.bg,
                                    color: p.color,
                                    border: `1px solid ${p.color}30`,
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            >
                                {p.name}
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* PROBLEM */}
            <section style={styles.section}>
                <div style={styles.sectionInner}>
                    <p style={styles.sectionLabel}>The Problem</p>
                    <h2 style={styles.sectionTitle}>
                        The internet is fragmented.<br />Your time isn't.
                    </h2>
                    <p style={styles.sectionDesc}>
                        Every developer, indie hacker, and creator maintains a presence across
                        6, 8, maybe 10 different platforms. Every time you have something to say —
                        a launch, an update, a thought worth sharing — you open each platform one by one.
                        Copy. Paste. Reformat. Rewrite. Repeat.
                    </p>
                    <div style={styles.problemCard}>
                        <div style={styles.problemCardInner}>
                            <span style={styles.problemNumber}>30–45</span>
                            <span style={styles.problemLabel}>minutes wasted per announcement</span>
                        </div>
                        <div style={styles.problemCardInner}>
                            <span style={styles.problemNumber}>10×</span>
                            <span style={styles.problemLabel}>the same content reformatted manually</span>
                        </div>
                        <div style={styles.problemCardInner}>
                            <span style={styles.problemNumber}>0</span>
                            <span style={styles.problemLabel}>good tools that respect your privacy</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section style={styles.section}>
                <div style={styles.sectionInner}>
                    <p style={styles.sectionLabel}>The Solution</p>
                    <h2 style={styles.sectionTitle}>
                        Everything you need.<br />Nothing you don't.
                    </h2>
                    <div style={styles.featuresGrid}>
                        {features.map((f, i) => (
                            <div
                                key={i}
                                style={styles.featureCard}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,120,255,0.30)'
                                        ; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.10)'
                                        ; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                                }}
                            >
                                <div style={styles.featureIcon}>{f.icon}</div>
                                <div style={styles.featureTitle}>{f.title}</div>
                                <div style={styles.featureDesc}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLATFORMS */}
            <section style={styles.section}>
                <div style={styles.sectionInner}>
                    <p style={styles.sectionLabel}>Supported Platforms</p>
                    <h2 style={styles.sectionTitle}>6 core platforms. One composer.</h2>
                    <div className="platforms-grid">
                        {platforms.map(p => (
                            <div
                                key={p.id}
                                style={{
                                    ...styles.platformCard,
                                    background: p.bg,
                                    border: `1px solid ${p.color}25`,
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                                        ; (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}60`
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                                        ; (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}25`
                                }}
                            >
                                <div style={{ ...styles.platformCardIcon, color: p.color }}>
                                    {p.abbr}
                                </div>
                                <div style={styles.platformCardName}>{p.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRIVACY */}
            <section style={styles.section}>
                <div style={styles.sectionInner}>
                    <div style={styles.privacyCard}>
                        <p style={styles.sectionLabel}>Privacy First</p>
                        <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>
                            Your tokens never leave<br />
                            <span style={styles.heroTitleAccent}>your browser.</span>
                        </h2>
                        <p style={{ ...styles.sectionDesc, textAlign: 'center', maxWidth: '560px', margin: '0 auto 48px' }}>
                            Every OAuth token and API key is encrypted using AES-256-GCM
                            directly in your browser before being stored in IndexedDB.
                            No server ever sees them. No company stores them.
                            Not even us.
                        </p>
                        <div style={styles.privacyPoints}>
                            {[
                                '🔒  AES-256-GCM encryption in the browser',
                                '🚫  No backend server — ever',
                                '📵  No user accounts or login required',
                                '💾  Everything stored locally in your browser',
                                '📡  Only outbound traffic is direct API calls to platforms',
                                '🗑️  Uninstall = everything gone. No data lingers anywhere',
                            ].map((point, i) => (
                                <div key={i} style={styles.privacyPoint}>{point}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={styles.ctaSection}>
                <div style={styles.sectionInner}>
                    <h2 style={styles.ctaTitle}>
                        Ready to take back your time?
                    </h2>
                    <p style={styles.ctaSub}>
                        No signup. No credit card. No server. Just open and publish.
                    </p>
                    <button
                        style={styles.btnPrimaryLg}
                        onClick={() => navigate('/app')}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                                ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(139,120,255,0.55)'
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                                ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 32px rgba(139,120,255,0.40)'
                        }}
                    >
                        Enter App — it's free →
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div style={styles.logo}>
                        one2many<span style={styles.logoAccent}>Social</span>
                    </div>
                    <div style={styles.footerMeta}>
                        Built by <span style={{ color: 'var(--text-primary)' }}>Dhakad Labs</span>
                        &nbsp;·&nbsp; Local-first · No backend · No login
                    </div>
                </div>
            </footer>

        </div>
    )
}

/* ─── Styles ─────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
    root: {
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
    },

    /* NAV */
    nav: {
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(8,8,16,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    navInner: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    navTag: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        color: 'var(--text-muted)',
    },

    /* LOGO */
    logo: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '18px',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px',
    },
    logoAccent: {
        color: 'var(--accent)',
    },

    /* BUTTONS */
    btnPrimary: {
        background: 'linear-gradient(135deg, #8b78ff 0%, #7060ee 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        padding: '9px 20px',
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '13px',
        cursor: 'pointer',
        boxShadow: '0 4px 24px rgba(139,120,255,0.35)',
        transition: 'all 0.2s ease',
    },
    btnPrimaryLg: {
        background: 'linear-gradient(135deg, #8b78ff 0%, #7060ee 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '14px 32px',
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 4px 32px rgba(139,120,255,0.40)',
        transition: 'all 0.2s ease',
    },
    btnGhost: {
        background: 'rgba(255,255,255,0.03)',
        color: 'var(--text-secondary)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '12px',
        padding: '14px 28px',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    /* HERO */
    hero: {
        paddingTop: '140px',
        paddingBottom: '100px',
        textAlign: 'center' as const,
    },
    heroInner: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '28px',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(139,120,255,0.10)',
        border: '1px solid rgba(139,120,255,0.25)',
        borderRadius: '100px',
        padding: '6px 16px',
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.5px',
        color: 'var(--accent-bright)',
    },
    heroBadgeDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'var(--success)',
        boxShadow: '0 0 6px var(--success)',
        display: 'inline-block',
    },
    heroBeta: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '12px',
        color: 'var(--text-muted)',
        opacity: 0.8,
        marginTop: '-12px',
    },
    heroTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(42px, 7vw, 72px)',
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: '-2px',
        color: 'var(--text-primary)',
    },
    heroTitleAccent: {
        color: 'var(--accent)',
    },
    heroSub: {
        fontSize: '18px',
        fontWeight: 300,
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        maxWidth: '600px',
    },
    heroBtns: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap' as const,
        justifyContent: 'center',
    },
    platformRow: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '8px',
        justifyContent: 'center',
        marginTop: '8px',
    },
    platformPill: {
        padding: '5px 14px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
    },

    /* SECTIONS */
    section: {
        padding: '100px 0',
    },
    sectionInner: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '20px',
    },
    sectionLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase' as const,
        color: 'var(--accent)',
    },
    sectionTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(28px, 4vw, 48px)',
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: '-1px',
        textAlign: 'center' as const,
        color: 'var(--text-primary)',
    },
    sectionDesc: {
        fontSize: '17px',
        fontWeight: 300,
        lineHeight: 1.75,
        color: 'var(--text-secondary)',
        maxWidth: '640px',
        textAlign: 'center' as const,
    },

    /* PROBLEM */
    problemCard: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        width: '100%',
        marginTop: '16px',
    },
    problemCardInner: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'var(--shadow-glass)',
    },
    problemNumber: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '48px',
        fontWeight: 800,
        color: 'var(--accent)',
        lineHeight: 1,
    },
    problemLabel: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14px',
        color: 'var(--text-secondary)',
        textAlign: 'center' as const,
        fontWeight: 300,
    },

    /* FEATURES */
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        width: '100%',
        marginTop: '16px',
    },
    featureCard: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-glass)',
    },
    featureIcon: {
        fontSize: '24px',
        color: 'var(--accent)',
        fontFamily: "'Syne', sans-serif",
    },
    featureTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    featureDesc: {
        fontSize: '15px',
        fontWeight: 300,
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
    },

    /* PLATFORMS GRID */
    platformCard: {
        borderRadius: '16px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
        cursor: 'default',
        background: 'rgba(255,255,255,0.03)',
    },
    platformCardIcon: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '18px',
        fontWeight: 800,
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
    },
    platformCardName: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
    },

    /* PRIVACY */
    privacyCard: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '24px',
        padding: '64px 48px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '20px',
        width: '100%',
        boxShadow: 'var(--shadow-glass)',
    },
    privacyPoints: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        width: '100%',
        maxWidth: '680px',
    },
    privacyPoint: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14px',
        fontWeight: 400,
        color: 'var(--text-secondary)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '12px 16px',
    },

    /* CTA */
    ctaSection: {
        padding: '120px 0',
        textAlign: 'center' as const,
    },
    ctaTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(28px, 4vw, 52px)',
        fontWeight: 800,
        letterSpacing: '-1.5px',
        color: 'var(--text-primary)',
        marginBottom: '16px',
    },
    ctaSub: {
        fontSize: '17px',
        fontWeight: 300,
        color: 'var(--text-secondary)',
        marginBottom: '36px',
    },

    /* FOOTER */
    footer: {
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 0',
    },
    footerInner: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerMeta: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
    },
}
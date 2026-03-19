import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Composer from '../../pages/Composer'
import History from '../../pages/History'
import Scheduled from '../../pages/Scheduled'
import Connections from '../../pages/Connections'
import Settings from '../../pages/Settings'
import PlatformIcon from '../shared/PlatformIcon'

const navItems = [
    { id: 'composer', label: 'Composer', path: '/app', icon: '⊞' },
    { id: 'scheduled', label: 'Scheduled', path: '/app/scheduled', icon: '◷' },
    { id: 'history', label: 'History', path: '/app/history', icon: '≡' },
]

const settingItems = [
    { id: 'connections', label: 'Connections', path: '/app/connections', icon: '⬡' },
    { id: 'settings', label: 'Settings', path: '/app/settings', icon: '◎' },
]

const platforms = [
    { id: 'reddit', abbr: 'Rd', color: '#ff4500', bg: 'rgba(255,69,0,0.12)' },
    { id: 'mastodon', abbr: 'Ms', color: '#6364ff', bg: 'rgba(99,100,255,0.12)' },
    { id: 'bluesky', abbr: 'Bs', color: '#0085ff', bg: 'rgba(0,133,255,0.12)' },
    { id: 'discord', abbr: 'Dc', color: '#5865f2', bg: 'rgba(88,101,242,0.12)' },
    { id: 'telegram', abbr: 'Tg', color: '#0088cc', bg: 'rgba(0,136,204,0.12)' },
    { id: 'wordpress', abbr: 'Wp', color: '#21759b', bg: 'rgba(33,117,155,0.12)' },
    { id: 'devto', abbr: 'Dv', color: '#0838fe', bg: 'rgba(8,56,254,0.12)' },
    { id: 'hashnode', abbr: 'Hn', color: '#2962ff', bg: 'rgba(41,98,255,0.12)' },
    { id: 'pinterest', abbr: 'Pt', color: '#e60023', bg: 'rgba(230,0,35,0.12)' },
    { id: 'tumblr', abbr: 'Tm', color: '#35465c', bg: 'rgba(53,70,92,0.20)' },
]

export default function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [hoveredNav, setHoveredNav] = useState<string | null>(null)

    const isActive = (path: string) => {
        if (path === '/app') return location.pathname === '/app'
        return location.pathname.startsWith(path)
    }

    return (
        <div style={styles.root}>

            {/* SIDEBAR */}
            <aside style={styles.sidebar}>

                {/* Logo */}
                <div style={styles.logoWrap}>
                    <div style={styles.logo}>
                        one2many<span style={styles.logoAccent}>Social</span>
                    </div>
                    <div style={styles.logoSub}>by Dhakad Labs</div>
                    <div
                        style={styles.backBtn}
                        onClick={() => navigate('/')}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)'
                                ; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.color = 'var(--text-muted)'
                                ; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'
                        }}
                    >
                        ← Back to home
                    </div>
                </div>
        {/* Main Nav */ }
        < nav style = { styles.nav } >
            <div style={styles.navLabel}>Menu</div>
    {
        navItems.map(item => (
            <div
                key={item.id}
                style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {}),
                    ...(hoveredNav === item.id && !isActive(item.path) ? styles.navItemHover : {}),
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
            >
                {isActive(item.path) && <div style={styles.navActiveBar} />}
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
            </div>
        ))
    }

    <div style={{ ...styles.navLabel, marginTop: '16px' }}>Settings</div>
    {
        settingItems.map(item => (
            <div
                key={item.id}
                style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {}),
                    ...(hoveredNav === item.id && !isActive(item.path) ? styles.navItemHover : {}),
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
            >
                {isActive(item.path) && <div style={styles.navActiveBar} />}
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
            </div>
        ))
    }
                </nav >

        {/* Platform Chips */ }
        < div style = { styles.chipsSection } >
                    <div style={styles.navLabel}>Platforms</div>
                    <div style={styles.chipsGrid}>
                        {platforms.map(p => (
                            <div
                                key={p.id}
                                title={p.id}
                                style={{
                                    ...styles.chip,
                                    background: p.bg,
                                    border: `1px solid ${p.color}30`,
                                }}
                            >
                                <PlatformIcon platformId={p.id} size={14} color={p.color} />
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* MAIN */}
        < main style = { styles.main } >
            <Routes>
                <Route path="/" element={<Composer />} />
                <Route path="/scheduled" element={<Scheduled />} />
                <Route path="/history" element={<History />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
                </main >

        </div >
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-base)',
    },

    /* SIDEBAR */
    sidebar: {
        width: '220px',
        minWidth: '220px',
        height: '100vh',
        background: 'rgba(8,8,20,0.85)',
        backdropFilter: 'blur(64px)',
        WebkitBackdropFilter: 'blur(64px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
    },

    /* Logo */
    logoWrap: {
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border-subtle)',
    },
    logo: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '15px',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px',
    },
    logoAccent: {
        color: 'var(--accent)',
    },
    logoSub: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginTop: '4px',
    },
    backBtn: {
        marginTop: '10px',
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '5px 10px',
        display: 'inline-block',
    },

    /* Nav */
    nav: {
        padding: '16px 10px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    navLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        padding: '6px 10px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 12px',
        borderRadius: '8px',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '13.5px',
        fontWeight: 400,
        position: 'relative',
        transition: 'all 0.15s ease',
        userSelect: 'none',
    },
    navItemHover: {
        background: 'var(--glass-2)',
        color: 'var(--text-secondary)',
    },
    navItemActive: {
        background: 'var(--accent-dim)',
        color: 'var(--text-primary)',
    },
    navActiveBar: {
        position: 'absolute',
        left: 0,
        top: '20%',
        width: '3px',
        height: '60%',
        background: 'var(--accent)',
        borderRadius: '0 2px 2px 0',
    },
    navIcon: {
        fontSize: '14px',
        width: '16px',
        textAlign: 'center',
    },

    /* Platform chips */
    chipsSection: {
        padding: '12px 10px 20px',
        borderTop: '1px solid var(--border-subtle)',
    },
    chipsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '5px',
        marginTop: '6px',
    },
    chip: {
        height: '28px',
        borderRadius: '7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Syne', sans-serif",
        fontSize: '9px',
        fontWeight: 800,
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
    },

    /* Main */
    main: {
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
}

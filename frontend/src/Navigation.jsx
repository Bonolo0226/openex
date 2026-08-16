import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'

function Navigation() {
	const { isLoggedIn, username, logout } = useAuthStore()
	const location = useLocation()
	const isActive = (path) => location.pathname === path

	const [theme, setTheme] = useState('light')

	useEffect(() => {
		const stored = localStorage.getItem('openex-theme')
		const initial = stored === 'dark' ? 'dark' : 'light'
		setTheme(initial)
		document.documentElement.setAttribute('data-theme', initial)
	}, [])

	function toggleTheme() {
		const next = theme === 'light' ? 'dark' : 'light'
		setTheme(next)
		document.documentElement.setAttribute('data-theme', next)
		localStorage.setItem('openex-theme', next)
	}

	const linkStyle = (path) => ({
		color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
		fontWeight: 600,
		fontSize: '0.88rem',
		textDecoration: 'none',
		padding: '0.5rem 0.9rem',
		borderRadius: '100px',
		background: isActive(path) ? 'var(--accent-tint)' : 'transparent',
		transition: 'all 0.2s ease',
	})

	return (
		<nav
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 50,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0.9rem 2rem',
				borderBottom: '1px solid var(--border)',
				background: 'var(--nav-bg)',
				backdropFilter: 'blur(16px)',
				WebkitBackdropFilter: 'blur(16px)',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
				<span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
					<span className="text-gradient">Open</span>Ex
				</span>
				<div style={{ display: 'flex', gap: '0.4rem' }}>
					<Link to="/" style={linkStyle('/')}>Dashboard</Link>
					<Link to="/trading" style={linkStyle('/trading')}>Trading</Link>
				</div>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
				<button
					className="secondary theme-toggle"
					onClick={toggleTheme}
					aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
					title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
				>
					{theme === 'light' ? '☾' : '☀'}
				</button>
				{isLoggedIn ? (
					<>
						<span
							className="mono"
							style={{
								fontSize: '0.8rem',
								color: 'var(--text-secondary)',
								background: 'rgba(127,127,127,0.08)',
								padding: '0.4rem 0.8rem',
								borderRadius: '100px',
								border: '1px solid var(--border)',
							}}
						>
							{username}
						</span>
						<button className="secondary" onClick={logout} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
							Log out
						</button>
					</>
				) : (
					<Link to="/login" style={{ ...linkStyle('/login'), background: 'var(--gradient)', color: 'var(--on-accent)' }}>
						Login
					</Link>
				)}
			</div>
		</nav>
	)
}

export default Navigation
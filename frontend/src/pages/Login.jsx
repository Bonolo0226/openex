import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

function Login() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [isRegistering, setIsRegistering] = useState(false)
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const login = useAuthStore((state) => state.login)
	const navigate = useNavigate()

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setSubmitting(true)
		const endpoint = isRegistering ? '/auth/register' : '/auth/login'
		try {
			const response = await apiClient.post(endpoint, { username, password })
			login(response.data.token, username)
			navigate('/')
		} catch (err) {
			console.error('Auth failed:', err)
			setError('Login failed. Check your username and password.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div
			style={{
				display: 'flex',
				minHeight: 'calc(100vh - 65px)',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '2rem',
			}}
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					maxWidth: '900px',
					width: '100%',
					borderRadius: '20px',
					overflow: 'hidden',
					border: '1px solid var(--border)',
					background: 'var(--bg-glass)',
					backdropFilter: 'blur(20px)',
				}}
				className="login-split"
			>
				<div
					style={{
						padding: '3rem 2.5rem',
						background: 'var(--hero-gradient)',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						gap: '1rem',
					}}
				>
					<span style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
						<span className="text-gradient">Open</span>Ex
					</span>
					<h2 style={{ fontSize: '1.6rem', margin: 0, lineHeight: 1.3 }}>
						Trade smarter with a live, AI-assisted terminal.
					</h2>
					<p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
						Real-time order books, instant matching, and an assistant that actually knows your balance.
					</p>
				</div>

				<div style={{ padding: '3rem 2.5rem' }}>
					<h1 style={{ fontSize: '1.5rem', margin: '0 0 0.3rem 0' }}>
						{isRegistering ? 'Create an account' : 'Welcome back'}
					</h1>
					<p className="text-secondary" style={{ fontSize: '0.85rem', margin: '0 0 1.75rem 0' }}>
						{isRegistering ? 'Start trading on OpenEx' : 'Log in to your OpenEx account'}
					</p>
					<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
						<div>
							<label className="text-secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
								USERNAME
							</label>
							<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
						</div>
						<div>
							<label className="text-secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
								PASSWORD
							</label>
							<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
						</div>
						{error && (
							<div className="badge badge-red" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
								{error}
							</div>
						)}
						<button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.8rem', marginTop: '0.4rem' }}>
							{submitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Log in'}
						</button>
					</form>
					<button
						className="secondary"
						onClick={() => setIsRegistering(!isRegistering)}
						style={{ width: '100%', marginTop: '0.85rem', fontSize: '0.8rem' }}
					>
						{isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
					</button>
				</div>
			</div>

			<style>{`
				@media (max-width: 760px) {
					.login-split { grid-template-columns: 1fr !important; }
				}
			`}</style>
		</div>
	)
}

export default Login
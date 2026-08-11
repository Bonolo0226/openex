import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

function Login() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [isRegistering, setIsRegistering] = useState(false)
	const [error, setError] = useState('')

	const login = useAuthStore((state) => state.login)
	const navigate = useNavigate()

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')

		const endpoint = isRegistering ? '/auth/register' : '/auth/login'

		try {
			const response = await apiClient.post(endpoint, { username, password })
			login(response.data.token, username)
			navigate('/')
		} catch (err) {
			setError('Login failed. Check your username and password.')
		}
	}

	return (
		<div style={{ padding: '1rem' }}>
			<h1>{isRegistering ? 'Register' : 'Login'}</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Username</label>
					<br />
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>
				<div>
					<label>Password</label>
					<br />
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				{error && <p style={{ color: 'red' }}>{error}</p>}
				<button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
			</form>
			<button onClick={() => setIsRegistering(!isRegistering)}>
				{isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
			</button>
		</div>
	)
}

export default Login
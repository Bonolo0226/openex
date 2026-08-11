import { Link } from 'react-router-dom'
import useAuthStore from './store/authStore'

function Navigation() {
	const { isLoggedIn, username } = useAuthStore()

	return (
		<nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
			<Link to="/">Dashboard</Link>
			<Link to="/trading">Trading</Link>
			<Link to="/login">Login</Link>
			<span style={{ marginLeft: 'auto' }}>
				{isLoggedIn ? `Logged in as ${username}` : 'Not logged in'}
			</span>
		</nav>
	)
}

export default Navigation
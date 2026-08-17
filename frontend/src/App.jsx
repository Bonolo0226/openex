import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './Navigation'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import ChatWidget from './components/ChatWidget'
import useAuthStore from './store/authStore'

function App() {
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

	return (
		<BrowserRouter>
			<Navigation />
			<Routes>
				<Route path="/" element={isLoggedIn ? <Dashboard /> : <LandingPage />} />
				<Route path="/trading" element={<Trading />} />
				<Route path="/login" element={<Login />} />
			</Routes>
			<ChatWidget />
		</BrowserRouter>
	)
}

export default App
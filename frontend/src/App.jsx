import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './Navigation'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Login from './pages/Login'
import ChatWidget from './components/ChatWidget'

function App() {
	return (
		<BrowserRouter>
			<Navigation />
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/trading" element={<Trading />} />
				<Route path="/login" element={<Login />} />
			</Routes>
			<ChatWidget />
		</BrowserRouter>
	)
}

export default App
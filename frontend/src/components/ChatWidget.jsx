import { useState } from 'react'
import axios from 'axios'
import useAuthStore from '../store/authStore'

function ChatWidget() {
	const [open, setOpen] = useState(false)
	const [input, setInput] = useState('')
	const [messages, setMessages] = useState([])
	const [sending, setSending] = useState(false)
	const token = useAuthStore((state) => state.token)

	async function sendMessage() {
		if (!input.trim()) return

		const userMessage = input
		setMessages((current) => [...current, { role: 'user', text: userMessage }])
		setInput('')
		setSending(true)

		try {
			const response = await axios.post(
				'http://localhost:5000/api/chat',
				{ message: userMessage },
				{ headers: token ? { Authorization: `Bearer ${token}` } : {} }
			)
			setMessages((current) => [...current, { role: 'assistant', text: response.data.response }])
		} catch (err) {
			console.error('Chat request failed:', err)
			setMessages((current) => [...current, { role: 'assistant', text: 'Sorry, something went wrong.' }])
		} finally {
			setSending(false)
		}
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			sendMessage()
		}
	}

	return (
		<div style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
			{open && (
				<div
					style={{
						width: '300px',
						height: '400px',
						border: '1px solid #ccc',
						background: 'white',
						padding: '0.5rem',
						display: 'flex',
						flexDirection: 'column',
						marginBottom: '0.5rem',
					}}
				>
					<div style={{ flex: 1, overflowY: 'auto' }}>
						{messages.length === 0 && <p style={{ color: 'gray' }}>Ask me about trading, or your balance.</p>}
						{messages.map((message, index) => (
							<p key={index}>
								<strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.text}
							</p>
						))}
						{sending && <p style={{ color: 'gray' }}>Thinking...</p>}
					</div>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						style={{ marginTop: '0.5rem' }}
					/>
				</div>
			)}
			<button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Chat'}</button>
		</div>
	)
}

export default ChatWidget
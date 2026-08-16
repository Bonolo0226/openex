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

	return (
		<div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100 }}>
			{open && (
				<div
					className="card"
					style={{
						width: '340px',
						height: '440px',
						display: 'flex',
						flexDirection: 'column',
						marginBottom: '0.9rem',
						padding: '1rem',
						boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
						animation: 'fadeIn 0.25s ease',
					}}
				>
					<h3 className="card-title" style={{ margin: '0 0 0.9rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<span className="pulse-dot" /> AI Assistant
					</h3>
					<div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
						{messages.length === 0 && (
							<p className="text-secondary" style={{ fontSize: '0.85rem' }}>Ask me about trading, or your balance.</p>
						)}
						{messages.map((message, index) => (
							<div
								key={index}
								style={{
									alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
									background: message.role === 'user' ? 'var(--gradient)' : 'rgba(127,127,127,0.08)',
									color: message.role === 'user' ? 'var(--on-accent)' : 'var(--text-primary)',
									padding: '0.55rem 0.8rem',
									borderRadius: '14px',
									maxWidth: '85%',
									fontSize: '0.85rem',
									lineHeight: 1.4,
								}}
							>
								{message.text}
							</div>
						))}
						{sending && <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Thinking...</p>}
					</div>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
						placeholder="Type a message..."
						style={{ marginTop: '0.85rem' }}
					/>
				</div>
			)}
			<button
				onClick={() => setOpen(!open)}
				style={{
					width: '56px',
					height: '56px',
					borderRadius: '50%',
					fontSize: '1.3rem',
					boxShadow: '0 8px 24px var(--accent-glow)',
				}}
			>
				{open ? '✕' : '💬'}
			</button>
		</div>
	)
}

export default ChatWidget
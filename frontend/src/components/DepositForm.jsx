import { useState } from 'react'
import apiClient from '../api/client'

const COMMON_CURRENCIES = ['USD', 'BTC', 'ETH', 'SOL', 'USDT']

function DepositForm({ onDeposited }) {
	const [currency, setCurrency] = useState('USD')
	const [amount, setAmount] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setSuccess('')

		const code = currency.trim().toUpperCase()
		const parsedAmount = Number(amount)

		if (!code) {
			setError('Enter a currency code.')
			return
		}
		if (!parsedAmount || parsedAmount <= 0) {
			setError('Enter an amount greater than zero.')
			return
		}

		setSubmitting(true)
		try {
			await apiClient.post('/api/wallets/deposit', {
				currency: code,
				amount: parsedAmount,
			})
			setSuccess(`Deposited ${parsedAmount.toLocaleString()} ${code}`)
			setAmount('')
			if (onDeposited) onDeposited()
		} catch (err) {
			console.error('Deposit failed:', err)
			setError(err.response?.data?.message || 'Deposit failed. Check the amount and try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '0.75rem',
				padding: '1rem',
				background: 'rgba(127,127,127,0.05)',
				border: '1px solid var(--border)',
				borderRadius: 'var(--radius-sm)',
				marginBottom: '0.9rem',
			}}
		>
			<div style={{ display: 'flex', gap: '0.6rem' }}>
				<div style={{ flex: '0 0 120px' }}>
					<label className="text-secondary" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
						CURRENCY
					</label>
					<input
						list="deposit-currency-options"
						value={currency}
						onChange={(e) => setCurrency(e.target.value)}
						placeholder="USD"
						required
					/>
					<datalist id="deposit-currency-options">
						{COMMON_CURRENCIES.map((c) => (
							<option key={c} value={c} />
						))}
					</datalist>
				</div>
				<div style={{ flex: 1 }}>
					<label className="text-secondary" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
						AMOUNT
					</label>
					<input
						type="number"
						step="0.01"
						min="0"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="0.00"
						required
					/>
				</div>
			</div>

			{error && (
				<div className="badge badge-red" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
					{error}
				</div>
			)}
			{success && (
				<div className="badge badge-green" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
					{success}
				</div>
			)}

			<button type="submit" disabled={submitting} style={{ padding: '0.65rem' }}>
				{submitting ? 'Depositing...' : 'Confirm deposit'}
			</button>
		</form>
	)
}

export default DepositForm
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import apiClient from '../api/client'
import OrderBook from './OrderBook'

function Trading() {
	const [accounts, setAccounts] = useState([])
	const [accountId, setAccountId] = useState('')
	const [side, setSide] = useState('BUY')
	const [type, setType] = useState('LIMIT')
	const [price, setPrice] = useState('')
	const [quantity, setQuantity] = useState('')
	const [result, setResult] = useState(null)
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		async function fetchAccounts() {
			try {
				const response = await apiClient.get('/api/wallets')
				setAccounts(response.data)
				if (response.data.length > 0) setAccountId(response.data[0].accountId)
			} catch (err) {
				console.error('Failed to fetch accounts:', err)
				setError('Could not load accounts.')
			}
		}
		fetchAccounts()
	}, [])

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setResult(null)
		setSubmitting(true)
		const idempotencyKey = uuidv4()
		const orderBody = {
			accountId,
			side,
			type,
			price: type === 'LIMIT' ? Number(price) : null,
			quantity: Number(quantity),
		}
		try {
			const response = await apiClient.post('/api/orders', orderBody, {
				headers: { 'Idempotency-Key': idempotencyKey },
			})
			setResult(response.data)
		} catch (err) {
			console.error('Order failed:', err)
			setError('Order failed. Check your inputs and try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="page">
			<h1 style={{ fontSize: '1.9rem', margin: '0 0 1.5rem 0', fontWeight: 500, letterSpacing: '-0.01em' }}>Trading Terminal</h1>

			<div className="grid-trading">
				<div className="card">
					<h2 className="card-title">Place Order</h2>

					{accounts.length === 0 && <p className="text-secondary" style={{ fontSize: '0.9rem' }}>No accounts found. Deposit funds first.</p>}

					{accounts.length > 0 && (
						<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
							<div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(127,127,127,0.06)', padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}>
								<button
									type="button"
									className={side === 'BUY' ? '' : 'ghost-toggle'}
									onClick={() => setSide('BUY')}
									style={{
										flex: 1,
										background: side === 'BUY' ? 'linear-gradient(135deg, var(--green), var(--green-2))' : undefined,
										color: side === 'BUY' ? 'var(--on-accent)' : undefined,
										boxShadow: 'none',
									}}
								>
									Buy
								</button>
								<button
									type="button"
									className={side === 'SELL' ? '' : 'ghost-toggle'}
									onClick={() => setSide('SELL')}
									style={{
										flex: 1,
										background: side === 'SELL' ? 'linear-gradient(135deg, var(--red), var(--red-2))' : undefined,
										color: side === 'SELL' ? 'var(--on-accent)' : undefined,
										boxShadow: 'none',
									}}
								>
									Sell
								</button>
							</div>

							<div>
								<label className="text-secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>ACCOUNT</label>
								<select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
									{accounts.map((account) => (
										<option key={account.accountId} value={account.accountId}>
											{account.currency} — {Number(account.balance).toLocaleString()}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="text-secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>ORDER TYPE</label>
								<select value={type} onChange={(e) => setType(e.target.value)}>
									<option value="LIMIT">Limit</option>
									<option value="MARKET">Market</option>
								</select>
							</div>

							{type === 'LIMIT' && (
								<div>
									<label className="text-secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>PRICE</label>
									<input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
								</div>
							)}

							<div>
								<label className="text-secondary" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>QUANTITY</label>
								<input type="number" step="0.00000001" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
							</div>

							{error && (
								<div className="badge badge-red" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}>{error}</div>
							)}

							<button
								type="submit"
								disabled={submitting}
								style={{
									background: side === 'BUY' ? 'linear-gradient(135deg, var(--green), var(--green-2))' : 'linear-gradient(135deg, var(--red), var(--red-2))',
									color: 'var(--on-accent)',
									padding: '0.85rem',
								}}
							>
								{submitting ? 'Placing order...' : `${side === 'BUY' ? 'Buy' : 'Sell'} Now`}
							</button>
						</form>
					)}

					{result && (
						<div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
							<h3 className="card-title">Order Result</h3>
							<pre className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflowX: 'auto', margin: 0 }}>
								{JSON.stringify(result, null, 2)}
							</pre>
						</div>
					)}
				</div>

				<div className="card">
					<OrderBook />
				</div>
			</div>
		</div>
	)
}

export default Trading
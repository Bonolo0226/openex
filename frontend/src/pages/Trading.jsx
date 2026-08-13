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
				if (response.data.length > 0) {
					setAccountId(response.data[0].accountId)
				}
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
			console.error('Failed to place order:', err)
			setError('Order failed. Check your inputs and try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={{ padding: '1rem' }}>
			<h1>Trading</h1>

			{accounts.length === 0 && <p>No accounts found. Deposit funds first.</p>}

			{accounts.length > 0 && (
				<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px' }}>
					<div>
						<label>Account</label>
						<br />
						<select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
							{accounts.map((account) => (
								<option key={account.accountId} value={account.accountId}>
									{account.currency} — balance {account.balance}
								</option>
							))}
						</select>
					</div>

					<div>
						<label>Side</label>
						<br />
						<select value={side} onChange={(e) => setSide(e.target.value)}>
							<option value="BUY">Buy</option>
							<option value="SELL">Sell</option>
						</select>
					</div>

					<div>
						<label>Type</label>
						<br />
						<select value={type} onChange={(e) => setType(e.target.value)}>
							<option value="LIMIT">Limit</option>
							<option value="MARKET">Market</option>
						</select>
					</div>

					{type === 'LIMIT' && (
						<div>
							<label>Price</label>
							<br />
							<input
								type="number"
								step="0.01"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								required
							/>
						</div>
					)}

					<div>
						<label>Quantity</label>
						<br />
						<input
							type="number"
							step="0.00000001"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							required
						/>
					</div>

					<button type="submit" disabled={submitting}>
						{submitting ? 'Placing order...' : `${side === 'BUY' ? 'Buy' : 'Sell'}`}
					</button>
				</form>
			)}

			{error && <p style={{ color: 'red' }}>{error}</p>}

			{result && (
				<div style={{ marginTop: '1rem' }}>
					<h3>Order Result</h3>
					<pre>{JSON.stringify(result, null, 2)}</pre>
				</div>
			)}

			<OrderBook />
		</div>
	)
}

export default Trading
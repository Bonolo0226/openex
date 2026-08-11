import { useEffect, useState } from 'react'
import apiClient from '../api/client'

function Dashboard() {
	const [balances, setBalances] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		async function fetchBalances() {
			try {
				const response = await apiClient.get('/api/wallets')
				setBalances(response.data)
			} catch (err) {
				setError('Could not load balances. Are you logged in?')
			} finally {
				setLoading(false)
			}
		}
		fetchBalances()
	}, [])

	return (
		<div style={{ padding: '1rem' }}>
			<h1>Dashboard</h1>
			{loading && <p>Loading balances...</p>}
			{error && <p style={{ color: 'red' }}>{error}</p>}
			{!loading && !error && balances.length === 0 && <p>No accounts yet. Make a deposit to get started.</p>}
			{!loading && balances.length > 0 && (
				<table>
					<thead>
						<tr>
							<th style={{ textAlign: 'left', paddingRight: '2rem' }}>Currency</th>
							<th style={{ textAlign: 'left' }}>Balance</th>
						</tr>
					</thead>
					<tbody>
						{balances.map((account) => (
							<tr key={account.accountId}>
								<td>{account.currency}</td>
								<td>{account.balance}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}

export default Dashboard
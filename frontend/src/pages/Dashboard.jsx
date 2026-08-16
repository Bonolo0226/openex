import { useEffect, useState } from 'react'
import apiClient from '../api/client'
import PriceChart from '../components/PriceChart'

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
				console.error('Failed to fetch balances:', err)
				setError('Could not load balances. Are you logged in?')
			} finally {
				setLoading(false)
			}
		}
		fetchBalances()
	}, [])

	const total = balances.reduce((sum, b) => sum + Number(b.balance), 0)

	return (
		<div className="page">
			<div style={{ marginBottom: '2rem' }}>
				<p className="text-secondary" style={{ fontSize: '0.85rem', margin: '0 0 0.3rem 0', fontWeight: 600 }}>PORTFOLIO OVERVIEW</p>
				<h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em' }}>
					{loading ? '···' : total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					<span className="text-secondary" style={{ fontSize: '1.1rem', fontWeight: 600, marginLeft: '0.5rem' }}>USD est.</span>
				</h1>
			</div>

			<div className="grid-2">
				<div className="card">
					<h2 className="card-title">Balances</h2>
					{loading && <p className="text-secondary">Loading...</p>}
					{error && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>}
					{!loading && !error && balances.length === 0 && (
						<p className="text-secondary" style={{ fontSize: '0.9rem' }}>No accounts yet. Make a deposit to get started.</p>
					)}
					{!loading && balances.length > 0 && (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
							{balances.map((account) => (
								<div
									key={account.accountId}
									className="row-hover"
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										padding: '0.9rem 1rem',
										background: 'rgba(127,127,127,0.05)',
										border: '1px solid var(--border)',
										borderRadius: 'var(--radius-sm)',
									}}
								>
									<div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
										<div
											style={{
												width: '32px',
												height: '32px',
												borderRadius: '50%',
												background: 'var(--gradient)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: '0.7rem',
												fontWeight: 800,
												color: 'var(--on-accent)',
											}}
										>
											{account.currency.slice(0, 2)}
										</div>
										<span style={{ fontWeight: 700 }}>{account.currency}</span>
									</div>
									<span className="mono" style={{ fontSize: '0.95rem' }}>
										{Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="card">
					<h2 className="card-title">Market Price</h2>
					<PriceChart />
				</div>
			</div>
		</div>
	)
}

export default Dashboard
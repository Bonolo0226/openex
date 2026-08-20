import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

function OrderBook({ myOrderIds = [] }) {
	const [orders, setOrders] = useState({})
	const [myOrderStatus, setMyOrderStatus] = useState({})
	const [connected, setConnected] = useState(false)

	useEffect(() => {
		const client = new Client({
			webSocketFactory: () => new SockJS((import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/ws'),
			onConnect: () => {
				setConnected(true)
				client.subscribe('/topic/orderbook', (message) => {
					const update = JSON.parse(message.body)

					setOrders((current) => {
						const next = { ...current }
						if (update.status === 'FILLED' || update.status === 'CANCELLED') {
							delete next[update.orderId]
						} else {
							next[update.orderId] = update
						}
						return next
					})

					setMyOrderStatus((current) => ({ ...current, [update.orderId]: update }))
				})
			},
		})
		client.activate()
		return () => client.deactivate()
	}, [])

	const allOrders = Object.values(orders)
	const bids = allOrders.filter((o) => o.side === 'BUY').sort((a, b) => b.price - a.price)
	const asks = allOrders.filter((o) => o.side === 'SELL').sort((a, b) => a.price - b.price)
	const maxQty = Math.max(1, ...allOrders.map((o) => Number(o.quantity)))

	const myOrders = myOrderIds
		.map((id) => myOrderStatus[id])
		.filter(Boolean)
		.reverse()

	const rowStyle = {
		position: 'relative',
		display: 'flex',
		justifyContent: 'space-between',
		padding: '0.5rem 0.7rem',
		fontSize: '0.85rem',
		borderRadius: '6px',
		overflow: 'hidden',
		background: 'rgba(255,255,255,0.02)',
	}

	const depthBar = (qty, color) => ({
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: `${Math.min(100, (Number(qty) / maxQty) * 100)}%`,
		background: color,
		opacity: 0.12,
	})

	const statusColor = (status) => {
		if (status === 'FILLED') return 'var(--green)'
		if (status === 'CANCELLED') return 'var(--red)'
		return 'var(--text-secondary)'
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
				<h2 className="card-title" style={{ margin: 0 }}>Live Order Book</h2>
				<span className="badge" style={{ background: connected ? 'var(--green-bg)' : 'rgba(255,255,255,0.05)', color: connected ? 'var(--green)' : 'var(--text-secondary)' }}>
					{connected && <span className="pulse-dot" />}
					{connected ? 'Live' : 'Connecting...'}
				</span>
			</div>

			{myOrders.length > 0 && (
				<div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
					<div className="text-secondary" style={{ fontSize: '0.72rem', marginBottom: '0.6rem', fontWeight: 700 }}>
						MY ORDERS
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
						{myOrders.map((order) => (
							<div key={order.orderId} className="mono" style={rowStyle}>
								<span>{order.side} {order.price ?? 'MKT'} × {order.quantity}</span>
								<span style={{ color: statusColor(order.status), fontWeight: 700 }}>{order.status}</span>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="grid-2">
				<div>
					<div className="text-secondary" style={{ fontSize: '0.72rem', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
						<span>BID PRICE</span><span>QTY</span>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
						{bids.length === 0 && <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No open bids</p>}
						{bids.map((order) => (
							<div key={order.orderId} className="mono row-hover" style={{ ...rowStyle, color: 'var(--green)' }}>
								<div style={depthBar(order.quantity, 'var(--green)')} />
								<span style={{ position: 'relative' }}>{order.price}</span>
								<span style={{ position: 'relative' }}>{order.quantity}</span>
							</div>
						))}
					</div>
				</div>
				<div>
					<div className="text-secondary" style={{ fontSize: '0.72rem', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
						<span>ASK PRICE</span><span>QTY</span>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
						{asks.length === 0 && <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No open asks</p>}
						{asks.map((order) => (
							<div key={order.orderId} className="mono row-hover" style={{ ...rowStyle, color: 'var(--red)' }}>
								<div style={depthBar(order.quantity, 'var(--red)')} />
								<span style={{ position: 'relative' }}>{order.price}</span>
								<span style={{ position: 'relative' }}>{order.quantity}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default OrderBook
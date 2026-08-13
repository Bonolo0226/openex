import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

function OrderBook() {
	const [orders, setOrders] = useState({})
	const [connected, setConnected] = useState(false)

	useEffect(() => {
		const client = new Client({
			webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
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
				})
			},
		})

		client.activate()

		return () => {
			client.deactivate()
		}
	}, [])

	const allOrders = Object.values(orders)
	const bids = allOrders.filter((o) => o.side === 'BUY').sort((a, b) => b.price - a.price)
	const asks = allOrders.filter((o) => o.side === 'SELL').sort((a, b) => a.price - b.price)

	return (
		<div>
			<p style={{ fontSize: '0.8rem', color: connected ? 'gray' : 'orange' }}>
				{connected ? 'Connected to live order book' : 'Connecting...'}
			</p>
			<div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
				<div>
					<h3 style={{ color: 'green' }}>Bids</h3>
					{bids.length === 0 && <p>No open bids</p>}
					{bids.map((order) => (
						<div key={order.orderId} style={{ color: 'green' }}>
							{order.price} × {order.quantity}
						</div>
					))}
				</div>
				<div>
					<h3 style={{ color: 'red' }}>Asks</h3>
					{asks.length === 0 && <p>No open asks</p>}
					{asks.map((order) => (
						<div key={order.orderId} style={{ color: 'red' }}>
							{order.price} × {order.quantity}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default OrderBook
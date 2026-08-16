import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
} from 'chart.js'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function PriceChart() {
	const [chartData, setChartData] = useState(null)
	const [error, setError] = useState('')

	useEffect(() => {
		async function fetchMarketData() {
			try {
				const response = await axios.get((import.meta.env.VITE_MARKET_DATA_URL || 'http://localhost:5000') + '/api/market-data')
				const ticks = response.data

				setChartData({
					labels: ticks.map((t) => new Date(t.timestamp).toLocaleTimeString()),
					datasets: [
						{
							label: 'Price',
							data: ticks.map((t) => t.price),
							borderColor: 'blue',
							tension: 0.1,
						},
						{
							label: 'Moving Avg (10)',
							data: ticks.map((t) => t.moving_average_10),
							borderColor: 'orange',
							tension: 0.1,
						},
					],
				})
			} catch (err) {
				console.error('Failed to fetch market data:', err)
				setError('Could not load market data. Is the market-data-service running?')
			}
		}
		fetchMarketData()
	}, [])

	if (error) return <p style={{ color: 'red' }}>{error}</p>
	if (!chartData) return <p>Loading chart...</p>

	return <Line data={chartData} />
}

export default PriceChart

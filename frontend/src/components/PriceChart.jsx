import { useEffect, useMemo, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler,
} from 'chart.js'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

// Reads the live CSS custom properties so the chart repaints in the app's
// current brass/teal theme (light or dark) instead of hardcoded colors.
function getThemeColors() {
	const styles = getComputedStyle(document.documentElement)
	const read = (name, fallback) => {
		const value = styles.getPropertyValue(name).trim()
		return value || fallback
	}
	return {
		accent1: read('--accent-1', '#b8792d'),
		accent2: read('--accent-2', '#0f9c8f'),
		textPrimary: read('--text-primary', '#14181a'),
		textSecondary: read('--text-secondary', '#545f5c'),
		textDim: read('--text-dim', '#8b9591'),
		border: read('--border', 'rgba(15,20,17,0.09)'),
		bgElevated: read('--bg-elevated', '#ffffff'),
		green: read('--green', '#1f9d5e'),
		red: read('--red', '#d1324a'),
	}
}

function hexToRgba(hex, alpha) {
	const clean = hex.replace('#', '')
	if (clean.length !== 6) return `rgba(184, 121, 45, ${alpha})`
	const r = parseInt(clean.slice(0, 2), 16)
	const g = parseInt(clean.slice(2, 4), 16)
	const b = parseInt(clean.slice(4, 6), 16)
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function PriceChart() {
	const [ticks, setTicks] = useState(null)
	const [error, setError] = useState('')
	const [themeVersion, setThemeVersion] = useState(0)
	const chartRef = useRef(null)

	useEffect(() => {
		async function fetchMarketData() {
			try {
				const response = await axios.get((import.meta.env.VITE_MARKET_DATA_URL || 'http://localhost:5000') + '/api/market-data')
				setTicks(response.data)
			} catch (err) {
				console.error('Failed to fetch market data:', err)
				setError('Could not load market data. Is the market-data-service running?')
			}
		}
		fetchMarketData()
	}, [])

	// Repaint colors immediately when the nav's light/dark toggle flips data-theme
	useEffect(() => {
		const observer = new MutationObserver(() => setThemeVersion((v) => v + 1))
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
		return () => observer.disconnect()
	}, [])

	const stats = useMemo(() => {
		if (!ticks || ticks.length === 0) return null
		const first = ticks[0].price
		const last = ticks[ticks.length - 1].price
		const change = last - first
		const pctChange = first !== 0 ? (change / first) * 100 : 0
		return { last, change, pctChange, up: change >= 0 }
	}, [ticks])

	const { data, options } = useMemo(() => {
		const colors = getThemeColors()

		if (!ticks || ticks.length === 0) {
			return { data: null, options: null }
		}

		const data = {
			labels: ticks.map((t) => new Date(t.timestamp).toLocaleTimeString()),
			datasets: [
				{
					label: 'Price',
					data: ticks.map((t) => t.price),
					borderColor: colors.accent1,
					borderWidth: 2,
					pointRadius: 0,
					pointHoverRadius: 4,
					pointHoverBackgroundColor: colors.accent1,
					pointHoverBorderColor: colors.bgElevated,
					pointHoverBorderWidth: 2,
					tension: 0.25,
					fill: true,
					backgroundColor: (context) => {
						const { ctx, chartArea } = context.chart
						if (!chartArea) return hexToRgba(colors.accent1, 0.12)
						const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
						gradient.addColorStop(0, hexToRgba(colors.accent1, 0.22))
						gradient.addColorStop(1, hexToRgba(colors.accent1, 0))
						return gradient
					},
				},
				{
					label: 'Moving Avg (10)',
					data: ticks.map((t) => t.moving_average_10),
					borderColor: colors.accent2,
					borderWidth: 1.5,
					borderDash: [4, 4],
					pointRadius: 0,
					pointHoverRadius: 3,
					pointHoverBackgroundColor: colors.accent2,
					pointHoverBorderColor: colors.bgElevated,
					pointHoverBorderWidth: 2,
					tension: 0.25,
					fill: false,
				},
			],
		}

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			animation: { duration: 500, easing: 'easeOutQuart' },
			interaction: { mode: 'index', intersect: false },
			plugins: {
				legend: { display: false },
				tooltip: {
					backgroundColor: colors.bgElevated,
					titleColor: colors.textPrimary,
					bodyColor: colors.textSecondary,
					borderColor: colors.border,
					borderWidth: 1,
					padding: 10,
					cornerRadius: 6,
					displayColors: true,
					boxPadding: 4,
					titleFont: { family: 'JetBrains Mono', size: 11, weight: '600' },
					bodyFont: { family: 'JetBrains Mono', size: 11 },
				},
			},
			scales: {
				x: {
					grid: { display: false },
					border: { color: colors.border },
					ticks: {
						color: colors.textDim,
						font: { family: 'JetBrains Mono', size: 10 },
						maxRotation: 0,
						autoSkip: true,
						maxTicksLimit: 6,
					},
				},
				y: {
					grid: { color: colors.border },
					border: { display: false },
					ticks: {
						color: colors.textDim,
						font: { family: 'JetBrains Mono', size: 10 },
						maxTicksLimit: 5,
					},
				},
			},
		}

		return { data, options }
		// themeVersion is read only to force recomputation with fresh CSS var values
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticks, themeVersion])

	if (error) return <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>

	if (!ticks) {
		return (
			<div
				style={{
					height: '260px',
					borderRadius: 'var(--radius-sm)',
					background: 'rgba(127,127,127,0.05)',
					border: '1px solid var(--border)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<span className="mono text-secondary" style={{ fontSize: '0.8rem' }}>Loading chart...</span>
			</div>
		)
	}

	if (ticks.length === 0) {
		return (
			<div
				style={{
					height: '260px',
					borderRadius: 'var(--radius-sm)',
					background: 'rgba(127,127,127,0.05)',
					border: '1px solid var(--border)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<span className="mono text-secondary" style={{ fontSize: '0.8rem' }}>No market data yet.</span>
			</div>
		)
	}

	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
				<div style={{ display: 'flex', alignItems: 'baseline', gap: '0.7rem' }}>
					<span style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 500, letterSpacing: '-0.01em' }}>
						{stats.last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</span>
					<span className={`badge ${stats.up ? 'badge-green' : 'badge-red'}`}>
						{stats.up ? '▲' : '▼'} {Math.abs(stats.pctChange).toFixed(2)}%
					</span>
				</div>
				<div style={{ display: 'flex', gap: '1rem' }}>
					<span className="mono text-secondary" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
						<span style={{ width: '8px', height: '2px', background: 'var(--accent-1)', display: 'inline-block' }} />
						Price
					</span>
					<span className="mono text-secondary" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
						<span style={{ width: '8px', height: '2px', background: 'var(--accent-2)', display: 'inline-block', borderTop: '1px dashed var(--accent-2)' }} />
						MA 10
					</span>
				</div>
			</div>
			<div style={{ height: '260px', position: 'relative' }}>
				<Line ref={chartRef} data={data} options={options} />
			</div>
		</div>
	)
}

export default PriceChart
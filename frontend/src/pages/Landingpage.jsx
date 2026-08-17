import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const TICKER = [
	{ symbol: 'BTC/USD', change: '+2.4%', up: true },
	{ symbol: 'ETH/USD', change: '+1.1%', up: true },
	{ symbol: 'SOL/USD', change: '-0.8%', up: false },
	{ symbol: 'AVAX/USD', change: '+3.6%', up: true },
	{ symbol: 'DOGE/USD', change: '-1.4%', up: false },
	{ symbol: 'ADA/USD', change: '+0.6%', up: true },
	{ symbol: 'XRP/USD', change: '-0.3%', up: false },
]

const FEATURES = [
	{
		title: 'Sub-second matching',
		description: 'Orders hit the book and get matched in milliseconds, not seconds. Built for people who trade on the move.',
		icon: (
			<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
		),
	},
	{
		title: 'Live order book depth',
		description: 'Watch bids and asks stack in real time, with depth visualized so you can read the market at a glance.',
		icon: (
			<>
				<path d="M4 20V10" />
				<path d="M10 20V4" />
				<path d="M16 20v-7" />
				<path d="M22 20v-3" />
			</>
		),
	},
	{
		title: 'AI-assisted terminal',
		description: 'Ask about your balance, an order, or the market: the built-in assistant already has the context.',
		icon: (
			<>
				<path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 1 1 8.94-9Z" />
			</>
		),
	},
]

// Reveals children with a fade/slide once they scroll into view; respects
// prefers-reduced-motion globally via the .reveal transition rules in index.css.
function Reveal({ children, delay = 0 }) {
	const ref = useRef(null)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.disconnect()
				}
			},
			{ threshold: 0.15 }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<div ref={ref} className={`reveal${visible ? ' is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
			{children}
		</div>
	)
}

function useCountUp(target, duration, start) {
	const [value, setValue] = useState(0)
	useEffect(() => {
		if (!start) return
		let startTime = null
		let raf
		function tick(ts) {
			if (startTime === null) startTime = ts
			const progress = Math.min((ts - startTime) / duration, 1)
			setValue(target * progress)
			if (progress < 1) raf = requestAnimationFrame(tick)
		}
		raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(raf)
	}, [start, target, duration])
	return value
}

function StatCounter({ target, decimals = 0, suffix = '', label, start }) {
	const value = useCountUp(target, 1400, start)
	return (
		<div style={{ textAlign: 'center' }}>
			<div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 500 }}>
				{value.toFixed(decimals)}
				{suffix}
			</div>
			<div className="mono text-dim" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>
				{label}
			</div>
		</div>
	)
}

function FeatureIcon({ children }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="var(--accent-1)"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ width: '22px', height: '22px' }}
		>
			{children}
		</svg>
	)
}

function LandingPage() {
	const statsRef = useRef(null)
	const [statsVisible, setStatsVisible] = useState(false)

	useEffect(() => {
		const el = statsRef.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setStatsVisible(true)
					observer.disconnect()
				}
			},
			{ threshold: 0.3 }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<div>
			{/* Scrolling market ticker */}
			<div className="ticker-wrap">
				<div className="ticker-track">
					{[...TICKER, ...TICKER].map((t, i) => (
						<span
							key={i}
							className="mono"
							style={{ fontSize: '0.78rem', display: 'inline-flex', gap: '0.45rem', alignItems: 'center', color: t.up ? 'var(--green)' : 'var(--red)' }}
						>
							<strong style={{ color: 'var(--text-primary)' }}>{t.symbol}</strong>
							{t.up ? '▲' : '▼'} {t.change}
						</span>
					))}
				</div>
			</div>

			{/* Hero */}
			<div className="page" style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
				<div className="hero-grid">
					<Reveal>
						<span className="badge badge-green" style={{ marginBottom: '1.2rem' }}>
							<span className="pulse-dot" /> Live markets, matched instantly
						</span>
						<h1 style={{ fontSize: '3rem', lineHeight: 1.1, margin: '0 0 1.1rem 0' }}>
							Trade the moment
							<br />
							<span className="text-gradient">it happens.</span>
						</h1>
						<p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: 1.65, maxWidth: '460px', margin: '0 0 1.9rem 0' }}>
							A precision order book, sub-second matching, and an AI terminal that actually knows your balance.
							Built for traders who don't wait around.
						</p>
						<div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
							<Link to="/login">
								<button style={{ padding: '0.9rem 1.7rem', fontSize: '0.95rem' }}>Get started free</button>
							</Link>
							<Link to="/login">
								<button className="secondary" style={{ padding: '0.9rem 1.7rem', fontSize: '0.95rem' }}>
									View live markets →
								</button>
							</Link>
						</div>
					</Reveal>

					<Reveal delay={150}>
						<div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
							<h2 className="card-title">Market Pulse</h2>
							<svg viewBox="0 0 400 170" style={{ width: '100%', height: 'auto', display: 'block' }}>
								<path
									d="M0,140 C40,120 60,150 90,110 C120,70 150,90 180,60 C210,30 240,50 270,35 C300,20 330,40 360,15 L400,8"
									fill="none"
									stroke="var(--border)"
									strokeWidth="2"
								/>
								<path
									className="hero-line"
									d="M0,140 C40,120 60,150 90,110 C120,70 150,90 180,60 C210,30 240,50 270,35 C300,20 330,40 360,15 L400,8"
									fill="none"
									stroke="var(--accent-1)"
									strokeWidth="2.5"
									pathLength="1"
								/>
							</svg>
							<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
								<span className="mono text-dim" style={{ fontSize: '0.68rem' }}>24H</span>
								<span className="badge badge-green">▲ 2.4%</span>
							</div>
						</div>
					</Reveal>
				</div>
			</div>

			{/* Features */}
			<div className="page" style={{ paddingTop: '1rem' }}>
				<Reveal>
					<p className="mono text-dim" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '1.2rem' }}>
						Why OpenEx
					</p>
				</Reveal>
				<div className="grid-3">
					{FEATURES.map((feature, i) => (
						<Reveal key={feature.title} delay={i * 120}>
							<div className="card" style={{ height: '100%' }}>
								<div
									style={{
										width: '42px',
										height: '42px',
										borderRadius: '50%',
										border: '1px solid var(--border-hover)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '1rem',
									}}
								>
									<FeatureIcon>{feature.icon}</FeatureIcon>
								</div>
								<h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.02rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
									{feature.title}
								</h3>
								<p className="text-secondary" style={{ fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
									{feature.description}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>

			{/* Stats */}
			<div ref={statsRef} className="page" style={{ paddingTop: '1rem' }}>
				<div className="card" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', padding: '2rem 1.5rem' }}>
					<StatCounter target={4} suffix="ms" label="Median match latency" start={statsVisible} />
					<StatCounter target={99.98} decimals={2} suffix="%" label="Uptime" start={statsVisible} />
					<StatCounter target={120} suffix="+" label="Markets" start={statsVisible} />
				</div>
			</div>

			{/* Closing CTA */}
			<Reveal>
				<div className="page" style={{ textAlign: 'center', paddingTop: '1rem' }}>
					<h2 style={{ fontSize: '2rem', margin: '0 0 0.8rem 0' }}>Ready to place your first order?</h2>
					<p className="text-secondary" style={{ margin: '0 0 1.6rem 0' }}>No card required. Just a username and a plan.</p>
					<Link to="/login">
						<button style={{ padding: '0.9rem 1.9rem', fontSize: '0.95rem' }}>Create free account</button>
					</Link>
				</div>
			</Reveal>
		</div>
	)
}

export default LandingPage
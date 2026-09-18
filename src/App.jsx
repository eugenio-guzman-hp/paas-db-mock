import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DEFAULT_RANGE,
  PRESETS,
  STATUS_COLORS,
  formatDelta,
  formatValue,
  getSlice,
} from './data/mockData'

const HP_BLUE = '#0096D6'
const GRID = '#EDF1F4'
const TICK = { fill: '#6B737A', fontSize: 11 }
const CANCEL_COLORS = ['#9B1C1C', '#D32F2F', '#E25A5A', '#EE8A8A', '#F3B4B4', '#F8D4D4']

function HpMark() {
  return (
    <img
      className="hp-mark"
      src={`${import.meta.env.BASE_URL}HP_logo_2012.svg.webp`}
      alt="HP"
    />
  )
}

function Sparkline({ points, color }) {
  if (!points?.length) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const width = 88
  const height = 28
  const path = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width
      const y = height - ((value - min) / span) * (height - 4) - 2
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function KpiTile({ kpi }) {
  const color = STATUS_COLORS[kpi.status]
  return (
    <article className={`tile status-${kpi.status}`}>
      <div className="tile-top">
        <span className="status-dot" style={{ background: color }} />
        <h3>{kpi.name}</h3>
      </div>
      <div className="tile-main">
        <p className="tile-value" style={{ color }}>
          {formatValue(kpi.value, kpi.format)}
          {kpi.format === 'days' ? <small>days</small> : null}
        </p>
        <Sparkline points={kpi.points} color={color} />
      </div>
      <p className="tile-delta" style={{ color }}>
        {formatDelta(kpi)}
      </p>
    </article>
  )
}

function ChartCard({ title, children }) {
  return (
    <section className="chart-card">
      <h3>{title}</h3>
      <div className="chart-body">{children}</div>
    </section>
  )
}

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #E6EAEE',
  borderRadius: 0,
  fontSize: 12,
}

export default function App() {
  const [from, setFrom] = useState(DEFAULT_RANGE.from)
  const [to, setTo] = useState(DEFAULT_RANGE.to)
  const slice = useMemo(() => getSlice(from, to), [from, to])
  const activePreset = PRESETS.find((preset) => preset.from === from && preset.to === to)?.id

  const cancelData = Object.entries(slice.cancellationReasons).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="page">
      <div className="brand-stripe" />
      <header className="topbar">
        <div className="brand">
          <HpMark />
          <h1>PaaS Subscriptions Dashboard</h1>
        </div>
        <div className="status-legend" aria-label="Status legend">
          <span className="good">{slice.counts.good} good</span>
          <span className="watch">{slice.counts.watch} watch</span>
          <span className="bad">{slice.counts.bad} at risk</span>
        </div>
        <form className="date-slice" onSubmit={(event) => event.preventDefault()}>
          <span>Date slice</span>
          <div className="presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={activePreset === preset.id ? 'active' : ''}
                onClick={() => {
                  setFrom(preset.from)
                  setTo(preset.to)
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label>
            <input
              type="date"
              min="2026-05-01"
              max={to}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label>
            <input
              type="date"
              min={from}
              max="2026-07-31"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </form>
      </header>

      <div className="kpi-grid">
        {slice.kpis.map((kpi) => (
          <KpiTile key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="chart-grid">
        <ChartCard title="Operational timing">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slice.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} unit="d" width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="activationLeadTime" name="Activation Lead Time" stroke={STATUS_COLORS.bad} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="billingReadinessDelay" name="Billing Readiness Delay" stroke={HP_BLUE} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="technicalActivationDelay" name="Technical Activation Delay" stroke={STATUS_COLORS.good} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="changeOrderProcessingTime" name="Change Order Processing Time" stroke={STATUS_COLORS.watch} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cancellation Rate">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slice.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} unit="%" width={36} domain={[0, 6]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="cancellationRate" name="Cancellation Rate" stroke={STATUS_COLORS.bad} strokeWidth={2.25} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contracts in Grace Period">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={slice.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="contractsInGracePeriod" name="Contracts in Grace Period" stroke={STATUS_COLORS.watch} fill="#F8E8C4" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Integrity rates">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slice.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} unit="%" width={42} domain={[96, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="statusIntegrityRate" name="Status Integrity Rate" stroke={STATUS_COLORS.good} strokeWidth={2.25} dot={false} />
              <Line type="monotone" dataKey="billingCycleIntegrityRate" name="Billing Cycle Integrity Rate" stroke={HP_BLUE} strokeWidth={2.25} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Change order, account lock & billing replication">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slice.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} unit="%" width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="changeOrderRejectionRate" name="Change Order Rejection Rate" stroke={STATUS_COLORS.watch} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="contractAccountLockRate" name="Contract Account Lock Rate" stroke={HP_BLUE} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="missingBillingReplicationRate" name="Missing Billing Replication Rate" stroke={STATUS_COLORS.bad} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top cancellation reasons">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cancelData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={TICK} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value}%`, name]} />
              <Bar dataKey="value" barSize={14}>
                {cancelData.map((entry, index) => (
                  <Cell key={entry.name} fill={CANCEL_COLORS[index % CANCEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

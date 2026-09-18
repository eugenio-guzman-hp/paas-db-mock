const MONTH_KEYS = [
  '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07',
]

const CANCEL_REASONS = [
  'Price',
  'Consolidation',
  'Product fit',
  'Service quality',
  'Contract terms',
  'Other',
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const STATUS_COLORS = {
  good: '#1F8A4C',
  watch: '#C79212',
  bad: '#D32F2F',
  neutral: '#6B737A',
}

function round(value, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function series(index, start, end, wobble) {
  const t = index / (MONTH_KEYS.length - 1)
  return start + (end - start) * t + Math.sin((index + 1.4) * 0.85) * wobble
}

function shareSet(weights) {
  const total = weights.reduce((sum, value) => sum + value, 0)
  return weights.map((value) => round((value / total) * 100, 1))
}

function buildMonthlySnapshots() {
  return MONTH_KEYS.map((month, index) => {
    const reasonShares = shareSet([
      27 + Math.sin(index * 0.3) * 3,
      22 + Math.cos(index * 0.45) * 2,
      18 + Math.sin(index * 0.5) * 2,
      13 + Math.cos(index * 0.2) * 1.5,
      11 + Math.sin(index * 0.6) * 1.2,
      9 + Math.cos(index * 0.7) * 1,
    ])

    return {
      month,
      activationLeadTime: round(series(index, 11.2, 12.4, 0.15)),
      billingReadinessDelay: round(series(index, 5.8, 6.4, 0.12)),
      cancellationRate: round(series(index, 2.8, 3.5, 0.08)),
      changeOrderProcessingTime: round(series(index, 4.9, 5.4, 0.1)),
      changeOrderRejectionRate: round(series(index, 7.5, 8.3, 0.15)),
      technicalActivationDelay: round(series(index, 3.5, 3.9, 0.08)),
      contractsInGracePeriod: Math.round(series(index, 51, 60, 2)),
      statusIntegrityRate: round(series(index, 98.9, 98.6, 0.06)),
      contractAccountLockRate: round(series(index, 1.5, 1.8, 0.05)),
      missingBillingReplicationRate: round(series(index, 1.3, 1.8, 0.08)),
      billingCycleIntegrityRate: round(series(index, 99.1, 98.9, 0.04)),
      cancellationReasons: Object.fromEntries(
        CANCEL_REASONS.map((label, i) => [label, reasonShares[i]]),
      ),
    }
  })
}

export const SNAPSHOTS = buildMonthlySnapshots()

export const KPI_CATALOG = [
  {
    id: 'activationLeadTime',
    name: 'Activation Lead Time',
    unit: 'days',
    format: 'days',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 9.5, bad: 12 },
  },
  {
    id: 'billingReadinessDelay',
    name: 'Billing Readiness Delay',
    unit: 'days',
    format: 'days',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 5.5, bad: 7 },
  },
  {
    id: 'technicalActivationDelay',
    name: 'Technical Activation Delay',
    unit: 'days',
    format: 'days',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 3.6, bad: 5 },
  },
  {
    id: 'changeOrderProcessingTime',
    name: 'Change Order Processing Time',
    unit: 'days',
    format: 'days',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 5, bad: 6.5 },
  },
  {
    id: 'cancellationRate',
    name: 'Cancellation Rate',
    unit: '%',
    format: 'percent',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 2.4, bad: 3.3 },
  },
  {
    id: 'contractsInGracePeriod',
    name: 'Contracts in Grace Period',
    unit: '',
    format: 'count',
    aggregation: 'latest',
    higherIsBetter: false,
    informational: true,
    thresholds: { good: 45, bad: 70 },
  },
  {
    id: 'statusIntegrityRate',
    name: 'Status Integrity Rate',
    unit: '%',
    format: 'percent',
    aggregation: 'avg',
    higherIsBetter: true,
    thresholds: { good: 98.8, bad: 97.5 },
  },
  {
    id: 'changeOrderRejectionRate',
    name: 'Change Order Rejection Rate',
    unit: '%',
    format: 'percent',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 7, bad: 9 },
  },
  {
    id: 'contractAccountLockRate',
    name: 'Contract Account Lock Rate',
    unit: '%',
    format: 'percent',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 1.4, bad: 2.2 },
  },
  {
    id: 'missingBillingReplicationRate',
    name: 'Missing Billing Replication Rate',
    unit: '%',
    format: 'percent',
    aggregation: 'avg',
    higherIsBetter: false,
    thresholds: { good: 1.0, bad: 1.8 },
  },
  {
    id: 'billingCycleIntegrityRate',
    name: 'Billing Cycle Integrity Rate',
    unit: '%',
    format: 'percent',
    aggregation: 'avg',
    higherIsBetter: true,
    informational: true,
    thresholds: { good: 99.0, bad: 98.0 },
  },
]

export const PRESETS = [
  { id: 'may', label: 'May', from: '2026-05-01', to: '2026-05-31' },
  { id: 'jun', label: 'Jun', from: '2026-06-01', to: '2026-06-30' },
  { id: 'jul', label: 'Jul', from: '2026-07-01', to: '2026-07-31' },
  { id: 'all', label: 'May–Jul', from: '2026-05-01', to: '2026-07-31' },
]

export const DEFAULT_RANGE = { from: '2026-05-01', to: '2026-07-31' }

function monthStart(key) {
  return `${key}-01`
}

function monthEnd(key) {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month, 0)
  const day = String(date.getDate()).padStart(2, '0')
  return `${key}-${day}`
}

export function monthLabel(key) {
  const [year, month] = key.split('-')
  return `${MONTH_NAMES[Number(month) - 1]} ${year.slice(2)}`
}

export function monthsInRange(from, to) {
  return SNAPSHOTS.filter((snapshot) => {
    const start = monthStart(snapshot.month)
    const end = monthEnd(snapshot.month)
    return end >= from && start <= to
  })
}

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function previousRange(from, to) {
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  const duration = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000)
  const prevStart = new Date(prevEnd.getTime() - duration)
  return { from: toIsoDate(prevStart), to: toIsoDate(prevEnd) }
}

function aggregateField(rows, field, method) {
  if (!rows.length) return null
  if (method === 'latest') return rows[rows.length - 1][field]
  const sum = rows.reduce((total, row) => total + row[field], 0)
  return round(sum / rows.length, 1)
}

function averageMap(rows, field) {
  if (!rows.length) return {}
  const keys = Object.keys(rows[0][field])
  return Object.fromEntries(
    keys.map((key) => {
      const sum = rows.reduce((total, row) => total + row[field][key], 0)
      return [key, round(sum / rows.length, 1)]
    }),
  )
}

export function statusOf(value, kpi) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'neutral'
  if (!kpi.thresholds) return 'neutral'
  const { good, bad } = kpi.thresholds
  if (kpi.higherIsBetter) {
    if (value >= good) return 'good'
    if (value <= bad) return 'bad'
    return 'watch'
  }
  if (value <= good) return 'good'
  if (value >= bad) return 'bad'
  return 'watch'
}

export function formatValue(value, format) {
  if (value === null || Number.isNaN(value)) return '—'
  if (format === 'percent') return `${value.toFixed(1)}%`
  if (format === 'days') return value.toFixed(1)
  if (format === 'delta') {
    const sign = value > 0 ? '+' : ''
    return `${sign}${Math.round(value)}`
  }
  return Math.round(value).toLocaleString()
}

export function formatDelta(kpi) {
  if (kpi.delta === null) return '—'
  const sign = kpi.delta > 0 ? '+' : ''
  if (kpi.format === 'percent') return `${sign}${kpi.delta.toFixed(1)} pts`
  if (kpi.format === 'days') return `${sign}${kpi.delta.toFixed(1)}d`
  return `${sign}${Math.round(kpi.delta)}`
}

export function formatRangeLabel(from, to) {
  const format = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  return `${format(from)} – ${format(to)}`
}

export function getSlice(from, to) {
  const current = monthsInRange(from, to)
  const prior = previousRange(from, to)
  const previous = monthsInRange(prior.from, prior.to)

  const kpis = KPI_CATALOG.map((kpi) => {
    const value = aggregateField(current, kpi.id, kpi.aggregation)
    const previousValue = aggregateField(previous, kpi.id, kpi.aggregation)
    const points = current.map((row) => row[kpi.id])
    const delta =
      value !== null && previousValue !== null
        ? round(value - previousValue, kpi.format === 'count' ? 0 : 1)
        : null

    return {
      ...kpi,
      value,
      previousValue,
      delta,
      points,
      status: statusOf(value, kpi),
    }
  })

  const trend = current.map((row) => ({
    month: monthLabel(row.month),
    activationLeadTime: row.activationLeadTime,
    billingReadinessDelay: row.billingReadinessDelay,
    technicalActivationDelay: row.technicalActivationDelay,
    changeOrderProcessingTime: row.changeOrderProcessingTime,
    cancellationRate: row.cancellationRate,
    contractsInGracePeriod: row.contractsInGracePeriod,
    statusIntegrityRate: row.statusIntegrityRate,
    billingCycleIntegrityRate: row.billingCycleIntegrityRate,
    changeOrderRejectionRate: row.changeOrderRejectionRate,
    contractAccountLockRate: row.contractAccountLockRate,
    missingBillingReplicationRate: row.missingBillingReplicationRate,
  }))

  return {
    from,
    to,
    label: formatRangeLabel(from, to),
    monthCount: current.length,
    kpis,
    cancellationReasons: averageMap(current, 'cancellationReasons'),
    trend,
    counts: {
      good: kpis.filter((kpi) => kpi.status === 'good').length,
      watch: kpis.filter((kpi) => kpi.status === 'watch').length,
      bad: kpis.filter((kpi) => kpi.status === 'bad').length,
    },
  }
}

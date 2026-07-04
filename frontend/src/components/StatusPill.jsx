const STYLES = {
  pending: 'bg-watch/15 text-watch border-watch/30',
  verified: 'bg-safe/15 text-safe border-safe/30',
  rejected: 'bg-danger/15 text-danger border-danger/30',
  low: 'bg-safe/15 text-safe border-safe/30',
  medium: 'bg-watch/15 text-watch border-watch/30',
  high: 'bg-danger/15 text-danger border-danger/30',
}

export default function StatusPill({ value }) {
  const style = STYLES[value] || 'bg-mist text-deep border-deep/20'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${style}`}>
      {value}
    </span>
  )
}

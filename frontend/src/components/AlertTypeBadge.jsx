const LABELS = {
  boil_notice: { text: 'Boil notice', className: 'bg-watch/15 text-watch border-watch/30' },
  contamination: { text: 'Contamination', className: 'bg-danger/15 text-danger border-danger/30' },
  outage: { text: 'Outage', className: 'bg-deep/10 text-deep border-deep/30' },
}

export default function AlertTypeBadge({ type }) {
  const info = LABELS[type] || { text: type, className: 'bg-mist text-deep border-deep/20' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${info.className}`}>
      {info.text}
    </span>
  )
}

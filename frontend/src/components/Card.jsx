export default function Card({ title, action, children, className = '' }) {
  return (
    <section className={`bg-white rounded-xl border border-deep/10 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-deep/10">
          {title && <h2 className="font-display font-semibold text-deep">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

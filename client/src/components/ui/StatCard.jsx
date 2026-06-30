export default function StatCard({ label, value, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-emerald-600 text-white',
    purple: 'bg-violet-600 text-white',
    gold: 'bg-gold text-ink',
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
        </div>
        {Icon ? (
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tones[tone]}`}>
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

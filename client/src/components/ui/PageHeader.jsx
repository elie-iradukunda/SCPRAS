export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="muted-label">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

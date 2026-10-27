export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6F94E]/80">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-[36px]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-white/40">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
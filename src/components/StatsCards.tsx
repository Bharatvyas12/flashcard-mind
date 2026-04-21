export function ProgressRing({ radius, stroke, progress }: { radius: number, stroke: number, progress: number }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = isNaN(progress) ? circumference : circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transform"
      >
        <circle
          stroke="var(--surface-hover)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--coral)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
}

export function StatsCard({ title, value, subtitle, icon, type = "default" }: { title: string, value: string | number, subtitle?: string, icon: React.ReactNode, type?: "default" | "success" | "danger" | "warning" }) {
  const colorClass = {
    default: "bg-surface text-primary border-surface-hover",
    success: "bg-success/10 text-success border-success/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  }[type];

  return (
    <div className={`p-6 rounded-2xl border ${colorClass.split(' ')[2]} bg-surface`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-foreground/60 font-medium">{title}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold">{value}</h2>
        {subtitle && <p className="text-sm text-foreground/50 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

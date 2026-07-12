interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  colorGlow?: string;
}

export default function StatsCard({ title, value, icon, trend, trendDirection = 'up', colorGlow = 'rgba(0, 242, 254, 0.15)' }: StatsCardProps) {
  return (
    <div className="glass-panel glass-panel-hover" style={{
      padding: '24px',
      flex: '1 1 calc(25% - 20px)',
      minWidth: '220px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient glow corner */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: colorGlow,
        filter: 'blur(30px)',
        zIndex: 0
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
      </div>

      <div style={{ zIndex: 1, position: 'relative' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{value}</h3>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <span style={{
              color: trendDirection === 'up' ? 'var(--success)' : trendDirection === 'down' ? 'var(--danger)' : 'var(--text-secondary)',
              fontWeight: 600
            }}>
              {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '•'} {trend}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}

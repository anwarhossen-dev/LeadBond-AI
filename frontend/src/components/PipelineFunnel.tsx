interface PipelineFunnelProps {
  data: Record<string, number>;
}

export default function PipelineFunnel({ data }: PipelineFunnelProps) {
  const stages = [
    { key: 'Captured', label: 'Captured Leads', color: '#60a5fa' },
    { key: 'Contacted', label: 'Contacted', color: '#fbbf24' },
    { key: 'Qualified', label: 'Qualified Leads', color: '#34d399' },
    { key: 'Proposal', label: 'Proposal Sent', color: '#c084fc' },
    { key: 'Won', label: 'Deals Won', color: '#00e676' },
    { key: 'Lost', label: 'Deals Lost', color: '#f87171' }
  ];

  const maxVal = Math.max(...Object.values(data), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {stages.map((stage) => {
        const count = data[stage.key] || 0;
        const percentage = Math.round((count / maxVal) * 100);

        return (
          <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stage.color }}></span>
                {stage.label}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {count} <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>({percentage}%)</span>
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.max(percentage, 2)}%`,
                height: '100%',
                backgroundColor: stage.color,
                borderRadius: '4px',
                transition: 'width 0.8s ease-out',
                boxShadow: `0 0 8px ${stage.color}44`
              }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

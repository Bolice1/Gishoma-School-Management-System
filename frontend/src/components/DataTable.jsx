export default function DataTable({ columns = [], data }) {
  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {(columns || []).map((col, i) => (
              <th key={col.key ?? col.label ?? i} style={styles.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row, i) => (
            <tr key={row?.id ?? i}>
              {(columns || []).map((col, j) => (
                <td key={col.key ?? col.label ?? j} style={styles.td}>
                  {col.render ? col.render(row) : row?.[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(!data || data.length === 0) && (
        <div style={styles.empty}>No data</div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--color-surface)',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    background: 'var(--color-surface-hover)',
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
  },
  td: { padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)' },
  empty: { padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' },
};

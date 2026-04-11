import shop from '../data/shop.json';

export default function Footer() {
  return (
    <footer style={{ padding: '24px 28px', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
      <span style={{ fontSize: '18px', fontWeight: 900 }}>
        <span style={{ color: '#4A7FD4' }}>Ronny</span><span style={{ color: '#E03A2F' }}>Cutz</span>
      </span>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={'tel:' + shop.phone.replace(/\D/g,'')} style={{ color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
          📞 {shop.phone}
        </a>
        <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4A7FD4', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
          @{shop.instagram}
        </a>
        <span style={{ color: '#aaa', fontSize: '12px' }}>{shop.address}</span>
      </div>
      <span style={{ color: '#555', fontSize: '11px' }}>© {new Date().getFullYear()}</span>
    </footer>
  );
}
import shop from '../data/shop.json';

export default function Footer() {
  return (
    <footer style={{ padding: '24px 28px', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
      <span style={{ fontSize: '18px', fontWeight: 900 }}>
        <span style={{ color: '#4A7FD4' }}>Ronny</span><span style={{ color: '#E03A2F' }}>Cutz</span>
      </span>
      <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>
        <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4A7FD4', fontWeight: 700, textDecoration: 'none' }}>@{shop.instagram}</a>
        &nbsp;·&nbsp; {shop.address} &nbsp;·&nbsp; © {new Date().getFullYear()}
      </span>
    </footer>
  );
}
import { motion } from 'framer-motion';
import { SectionHeader } from './Services.jsx';

const REVIEWS = [];

function Stars() {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E03A2F" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const googleReviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJ_RonnyCutzLubbockTX';

  return (
    <section id="reviews" style={{ padding: '44px 16px', background: '#fff', borderBottom: '3px solid #111' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <SectionHeader eyebrow="Client Reviews" title="What People Say" />

        {REVIEWS.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '40px 20px' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#E03A2F" stroke="#111" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#111', marginBottom: '8px' }}>Be the first to leave a review!</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
              Enjoyed your cut? Leave a Google review and help others find RonnyCutz in Lubbock.
            </p>
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#4A7FD4', color: '#fff', padding: '13px 28px', borderRadius: '9999px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', border: '2.5px solid #111', boxShadow: '4px 4px 0 #111' }}
            >
              Leave a Google Review
            </a>
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {REVIEWS.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  style={{ background: i % 2 === 0 ? '#FFF0EF' : '#EEF4FF', border: '2.5px solid #111', borderRadius: '14px', padding: '20px', boxShadow: '4px 4px 0 #111' }}
                >
                  <Stars />
                  <p style={{ fontSize: '14px', color: '#333', fontWeight: 600, margin: '12px 0', lineHeight: 1.6 }}>"{review.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '14px', border: '2px solid #111', flexShrink: 0 }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#111' }}>{review.name}</div>
                      <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>{review.date}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#4A7FD4', color: '#fff', padding: '12px 24px', borderRadius: '9999px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', border: '2.5px solid #111', boxShadow: '3px 3px 0 #111' }}
              >
                Leave a Google Review
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
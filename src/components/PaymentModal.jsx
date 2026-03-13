import { useState } from 'react'
import { useMediaQuery } from '../lib/useMediaQuery'

const methods = [
  { id: 'card',      label: 'CREDIT / DEBIT CARD', icon: '💳', active: false },
  { id: 'qr',        label: 'QR PAYMENT',           icon: '⬛', active: false },
  { id: 'cash',      label: 'CASH',                  icon: '💵', active: false },
  { id: 'demo',      label: 'PLACE FREE FOR DEMO',   icon: '⚡', active: true  },
]

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    zIndex: 400, display: 'flex', alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    width: '100%', maxWidth: 430, margin: '0 auto',
    background: '#fff', borderRadius: '24px 24px 0 0',
    animation: 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  header: {
    padding: '24px 20px 16px', textAlign: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  title: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 26,
    color: '#111', letterSpacing: 1,
  },
  sub: { fontSize: 12, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
    padding: '20px',
  },
  card: (selected, active) => ({
    padding: '20px 12px', borderRadius: 16, cursor: active ? 'pointer' : 'not-allowed',
    border: selected ? '2.5px solid #111' : '2px solid #eee',
    background: selected ? '#111' : active ? '#fff' : '#fafafa',
    opacity: active ? 1 : 0.45,
    textAlign: 'center', transition: 'all 0.15s', position: 'relative',
  }),
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: (selected) => ({
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
    fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5,
    color: selected ? '#fff' : '#333',
  }),
  demoBadge: {
    position: 'absolute', top: -8, right: -8,
    background: '#FFD600', color: '#111', fontSize: 10,
    fontWeight: 900, padding: '3px 7px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  disabledNote: {
    textAlign: 'center', fontSize: 11, color: '#bbb',
    padding: '0 20px 16px', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  footer: { padding: '0 20px 28px' },
  proceedBtn: (can) => ({
    width: '100%', padding: '16px', borderRadius: 14,
    background: can ? '#D32F2F' : '#e0e0e0', color: can ? '#fff' : '#aaa',
    border: 'none', fontFamily: 'Bebas Neue, sans-serif',
    fontSize: 20, letterSpacing: 1.5, cursor: can ? 'pointer' : 'not-allowed',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.2s',
  }),
}

export default function PaymentModal({ total, onClose, onConfirm }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const canProceed = selected !== null
  const selectedMethod = methods.find(m => m.id === selected)

  const handleProceed = async () => {
    if (!canProceed || loading) return
    setLoading(true)
    await onConfirm(selectedMethod.label)
    setLoading(false)
  }

  const overlayStyle = isDesktop ? { ...S.overlay, alignItems: 'center', padding: 24 } : S.overlay
  const sheetStyle = isDesktop
    ? { ...S.sheet, maxWidth: 820, borderRadius: 24, animation: 'scaleIn 0.25s cubic-bezier(0.32,0.72,0,1)' }
    : S.sheet
  const gridStyle = isDesktop ? { ...S.grid, gridTemplateColumns: 'repeat(4, 1fr)' } : S.grid

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={sheetStyle}>
        <div style={S.header}>
          <div style={S.title}>CHOOSE PAYMENT METHOD</div>
          <div style={S.sub}>Total: ${total}</div>
        </div>

        <div style={gridStyle}>
          {methods.map(m => (
            <div
              key={m.id}
              style={S.card(selected === m.id, m.active)}
              onClick={() => m.active && setSelected(m.id)}
            >
              {m.id === 'demo' && <div style={S.demoBadge}>FREE</div>}
              <div style={S.cardIcon}>{m.icon}</div>
              <div style={S.cardLabel(selected === m.id)}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={S.disabledNote}>
          Other payment methods coming soon
        </div>

        <div style={S.footer}>
          <button style={S.proceedBtn(canProceed)} onClick={handleProceed} disabled={!canProceed || loading}>
            <span>{loading ? 'PLACING ORDER...' : 'PROCEED PAYMENT'}</span>
            {!loading && <span>→</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

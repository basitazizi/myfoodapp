import { useMediaQuery } from '../lib/useMediaQuery'

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    zIndex: 300, display: 'flex', alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    width: '100%', maxWidth: 430, margin: '0 auto',
    background: '#fff', borderRadius: '24px 24px 0 0',
    animation: 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
    maxHeight: '80vh', display: 'flex', flexDirection: 'column',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  header: {
    padding: '20px 20px 12px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #f0f0f0',
  },
  title: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 28,
    letterSpacing: 1, color: '#111',
  },
  closeBtn: {
    background: '#f4f4f4', border: 'none', width: 34, height: 34,
    borderRadius: 50, fontSize: 16, cursor: 'pointer', color: '#555',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, overflowY: 'auto', padding: '0 20px' },
  emptyMsg: {
    textAlign: 'center', padding: '48px 20px', color: '#aaa',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 1,
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 0', borderBottom: '1px solid #f5f5f5',
  },
  itemImg: {
    width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
    fontSize: 14, textTransform: 'uppercase', color: '#111',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  itemSub: { fontSize: 11, color: '#aaa', marginTop: 2, textTransform: 'uppercase' },
  qtyWrap: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8, border: '1.5px solid #eee',
    background: '#fff', fontSize: 16, fontWeight: 700, color: '#111',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { fontWeight: 800, fontSize: 15, minWidth: 20, textAlign: 'center' },
  itemPrice: {
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
    fontSize: 16, color: '#111', flexShrink: 0,
  },
  totalRow: {
    padding: '16px 20px 0', borderTop: '2px solid #111',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#fff',
  },
  totalLabel: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 1, color: '#555',
  },
  totalAmt: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#111',
  },
  footer: { padding: '12px 20px 24px', background: '#fff' },
  checkoutBtn: {
    width: '100%', padding: '16px', borderRadius: 14,
    background: '#D32F2F', color: '#fff', border: 'none',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 1.5,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
}

export default function CartDrawer({ cart, onClose, onQtyChange, onCheckout }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const total = cart.reduce((sum, i) => sum + i.totalPrice, 0)

  const overlayStyle = isDesktop ? { ...S.overlay, alignItems: 'center', padding: 24 } : S.overlay
  const sheetStyle = isDesktop
    ? { ...S.sheet, maxWidth: 720, borderRadius: 24, animation: 'scaleIn 0.25s cubic-bezier(0.32,0.72,0,1)' }
    : S.sheet

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={sheetStyle}>
        <div style={S.header}>
          <div style={S.title}>CART 🛒</div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.body}>
          {cart.length === 0 ? (
            <div style={S.emptyMsg}>Your cart is empty 🍕</div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} style={S.itemRow}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={S.itemImg}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=60' }}
                />
                <div style={S.itemInfo}>
                  <div style={S.itemName}>{item.name}</div>
                  <div style={S.itemSub}>{item.customLabel}</div>
                </div>
                <div style={S.qtyWrap}>
                  <button style={S.qtyBtn} onClick={() => onQtyChange(idx, item.qty - 1)}>−</button>
                  <span style={S.qtyNum}>{item.qty}</span>
                  <button style={S.qtyBtn} onClick={() => onQtyChange(idx, item.qty + 1)}>+</button>
                </div>
                <div style={S.itemPrice}>${item.totalPrice.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <>
            <div style={S.totalRow}>
              <span style={S.totalLabel}>TOTAL ORDER</span>
              <span style={S.totalAmt}>${total.toFixed(2)}</span>
            </div>
            <div style={S.footer}>
              <button style={S.checkoutBtn} onClick={onCheckout}>
                <span>💳</span>
                <span>CHECKOUT</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

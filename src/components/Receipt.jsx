import { useMediaQuery } from '../lib/useMediaQuery'

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, animation: 'fadeIn 0.25s ease',
  },
  paper: {
    width: '100%', maxWidth: 360,
    background: 'linear-gradient(145deg,#fff 0%,#f8f8f8 100%)',
    borderRadius: 4, padding: '32px 28px 28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.03)',
    fontFamily: 'Barlow, sans-serif', animation: 'scaleIn 0.4s cubic-bezier(0.32,0.72,0,1)',
    position: 'relative', maxHeight: '90vh', overflowY: 'auto',
  },
  // Torn top edge effect
  tearTop: {
    position: 'absolute', top: -6, left: 0, right: 0, height: 12,
    background: 'repeating-linear-gradient(90deg, #fff 0, #fff 8px, transparent 8px, transparent 12px)',
  },
  restaurantName: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, letterSpacing: 2,
    textAlign: 'center', color: '#111', marginBottom: 4,
  },
  tagline: {
    textAlign: 'center', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 2, color: '#666', marginBottom: 20,
  },
  divider: {
    borderTop: '1.5px dashed #ccc', margin: '12px 0',
  },
  metaRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: '#555', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 4,
  },
  metaVal: { fontWeight: 700, color: '#222' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '40px 1fr 60px',
    fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: 1, color: '#999', padding: '8px 0', marginBottom: 4,
  },
  itemRow: {
    display: 'grid', gridTemplateColumns: '40px 1fr 60px',
    padding: '8px 0', borderBottom: '1px solid #f0f0f0',
  },
  itemQty: { fontSize: 13, fontWeight: 800, color: '#111' },
  itemName: { fontSize: 12, fontWeight: 700, color: '#111', textTransform: 'uppercase' },
  itemSub: { fontSize: 10, color: '#aaa', textTransform: 'uppercase', marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: 800, color: '#111', textAlign: 'right' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '14px 0 8px', alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
    fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: '#111',
  },
  totalAmt: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#111',
  },
  thanks: {
    textAlign: 'center', marginTop: 16,
    fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1.5,
  },
  doneBtn: {
    marginTop: 20, width: '100%', padding: '14px',
    background: '#111', color: '#fff', border: 'none', borderRadius: 10,
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 1,
    cursor: 'pointer',
  },
}

export default function Receipt({ order, onDone }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  if (!order) return null

  const paperStyle = isDesktop ? { ...S.paper, maxWidth: 520 } : S.paper

  const date = new Date(order.created_at || Date.now())
  const dateStr = date.toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).toUpperCase()

  return (
    <div style={S.overlay}>
      <div style={paperStyle}>
        <div style={S.tearTop} />
        <div style={S.restaurantName}>ANOOOONIM PIZZA</div>
        <div style={S.tagline}>FRESHLY BAKED MADE FOR YOU</div>
        <div style={S.divider} />

        <div style={S.metaRow}>
          <span>QUEUE NUMBER:</span>
          <span style={S.metaVal}>#{String(order.queue_number).padStart(3,'0')}</span>
        </div>
        <div style={S.metaRow}>
          <span>ORDER ID:</span>
          <span style={S.metaVal}>{order.order_id}</span>
        </div>
        <div style={S.metaRow}>
          <span>LABEL:</span>
          <span style={S.metaVal}>ORDERED BY KIOSK</span>
        </div>
        <div style={S.metaRow}>
          <span>DATE:</span>
          <span style={S.metaVal}>{dateStr}</span>
        </div>

        <div style={S.divider} />

        <div style={S.tableHeader}>
          <span>QTY</span><span>ITEM</span><span style={{textAlign:'right'}}>TOTAL</span>
        </div>

        {order.items.map((item, idx) => (
          <div key={idx} style={S.itemRow}>
            <span style={S.itemQty}>{String(item.qty).padStart(2,'0')}</span>
            <div>
              <div style={S.itemName}>{item.name}</div>
              <div style={S.itemSub}>{item.customLabel}</div>
            </div>
            <span style={S.itemTotal}>${item.totalPrice.toFixed(2)}</span>
          </div>
        ))}

        <div style={S.divider} />

        <div style={S.totalRow}>
          <span style={S.totalLabel}>TOTAL PAYMENT</span>
          <span style={S.totalAmt}>${order.total.toFixed(2)}</span>
        </div>

        <div style={S.thanks}>
          <div>THANK YOU FOR HAVING ME!</div>
          <div>ENJOY YOUR MEAL.</div>
        </div>

        <button style={S.doneBtn} onClick={onDone}>NEW ORDER →</button>
      </div>
    </div>
  )
}

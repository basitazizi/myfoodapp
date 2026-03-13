import { useState } from 'react'
import { useMediaQuery } from '../lib/useMediaQuery'
import emailjs from '@emailjs/browser'

const EMAILJS_PUBLIC_KEY = 'hi9B0tlxyAkYFXl_B'
const EMAILJS_SERVICE_ID = 'service_qz6tbpd'
const EMAILJS_TEMPLATE_ID = 'template_l72974e'

if (typeof window !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}

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
  emailSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px dashed #ddd',
  },
  emailTitle: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailRow: { display: 'flex', gap: 8 },
  emailInput: {
    flex: 1,
    padding: '12px 12px',
    borderRadius: 10,
    border: '1.5px solid #e6e6e6',
    fontFamily: 'Barlow, sans-serif',
    fontSize: 13,
    outline: 'none',
  },
  sendBtn: (can) => ({
    padding: '12px 14px',
    borderRadius: 10,
    border: 'none',
    background: can ? '#D32F2F' : '#eee',
    color: can ? '#fff' : '#aaa',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 900,
    letterSpacing: 1,
    textTransform: 'uppercase',
    cursor: can ? 'pointer' : 'not-allowed',
    whiteSpace: 'nowrap',
  }),
  msgOk: { marginTop: 8, fontSize: 11, color: '#2E7D32', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6 },
  msgErr: { marginTop: 8, fontSize: 11, color: '#D32F2F', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6 },
}

export default function Receipt({ order, onDone }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  if (!order) return null

  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const paperStyle = isDesktop ? { ...S.paper, maxWidth: 520 } : S.paper

  const date = new Date(order.created_at || Date.now())
  const dateStr = date.toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).toUpperCase()

  const canSend = !sending && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSend = async () => {
    if (!canSend) return
    setSending(true)
    setSentMsg('')
    setErrMsg('')
    try {
      const orders = (Array.isArray(order.items) ? order.items : []).map((i) => ({
        name: i?.name,
        units: i?.qty,
        price: i?.totalPrice,
        customization: i?.customLabel,
      }))

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        email: email.trim(),
        order_id: order.order_id,
        queue_number: order.queue_number,
        date: dateStr,
        orders,
        total: order.total,
      })

      setSentMsg('Receipt sent! Check your inbox ✅')
    } catch (e) {
      setErrMsg(e?.text || e?.message || 'Failed to send receipt.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={S.overlay}>
      <div style={paperStyle}>
        <div style={S.tearTop} />
        <div style={S.restaurantName}>BASIT'S CAFE</div>
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

        <div style={S.emailSection}>
          <div style={S.emailTitle}>Want a copy? Enter your email</div>
          <div style={S.emailRow}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
              style={S.emailInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button style={S.sendBtn(canSend)} onClick={handleSend} disabled={!canSend}>
              {sending ? 'SENDING...' : 'SEND RECEIPT'}
            </button>
          </div>
          {sentMsg && <div style={S.msgOk}>{sentMsg}</div>}
          {errMsg && <div style={S.msgErr}>{errMsg}</div>}
        </div>
      </div>
    </div>
  )
}

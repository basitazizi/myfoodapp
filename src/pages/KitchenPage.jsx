import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useMediaQuery } from '../lib/useMediaQuery'

const STATUS_FLOW = ['pending', 'preparing', 'ready', 'completed']
const STATUS_META = {
  pending:    { label: 'PENDING',    color: '#FF8F00', bg: '#FFF8E1', emoji: '⏳', next: 'ACCEPT ORDER' },
  preparing:  { label: 'PREPARING', color: '#1565C0', bg: '#E3F2FD', emoji: '👨‍🍳', next: 'MARK READY' },
  ready:      { label: 'READY',     color: '#2E7D32', bg: '#E8F5E9', emoji: '✅', next: 'COMPLETE' },
  completed:  { label: 'DONE',      color: '#777',    bg: '#F5F5F5', emoji: '🎉', next: null },
}

const S = {
  shell: {
    width: '100%', minHeight: '100vh',
    background: '#0f1a0f', display: 'flex', flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(160deg,#1B3320 0%,#0f1f12 100%)',
    padding: '20px 20px 24px', flexShrink: 0,
  },
  topRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
    padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', textTransform: 'uppercase',
  },
  liveIndicator: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 20,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#4CAF50',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  liveText: { fontSize: 11, color: '#fff', fontWeight: 700, letterSpacing: 1 },
  kitchenTitle: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 38,
    color: '#fff', letterSpacing: 2, marginBottom: 4,
  },
  kitchenSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' },
  stats: {
    display: 'flex', gap: 10, marginTop: 16,
  },
  statBox: (color) => ({
    flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 14,
    padding: '12px', textAlign: 'center', border: `1px solid ${color}33`,
  }),
  statNum: (color) => ({
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 28,
    color: color, display: 'block',
  }),
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 },
  // Filter tabs
  filterRow: {
    display: 'flex', gap: 8, padding: '16px 16px 8px', overflowX: 'auto',
    background: '#0f1a0f', flexShrink: 0,
  },
  filterTab: (active) => ({
    padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
    background: active ? '#fff' : 'rgba(255,255,255,0.08)',
    color: active ? '#111' : 'rgba(255,255,255,0.5)',
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
    fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5,
    whiteSpace: 'nowrap', border: 'none', transition: 'all 0.15s',
  }),
  // Order list
  orderList: { flex: 1, overflowY: 'auto', padding: '8px 12px 24px' },
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    color: 'rgba(255,255,255,0.2)',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 20,
    letterSpacing: 1, color: 'rgba(255,255,255,0.3)',
  },
  // Order card
  orderCard: (status) => ({
    background: '#1a2a1a', borderRadius: 18,
    border: `1.5px solid ${STATUS_META[status].color}44`,
    marginBottom: 12, overflow: 'hidden',
    transition: 'all 0.2s',
  }),
  cardTop: (status) => ({
    background: STATUS_META[status].bg + '22',
    padding: '14px 16px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }),
  cardTopLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  statusEmoji: { fontSize: 22 },
  queueNum: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 24,
    color: '#fff', letterSpacing: 1,
  },
  statusBadge: (status) => ({
    background: STATUS_META[status].color, color: '#fff',
    fontSize: 10, fontWeight: 800, padding: '4px 10px',
    borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5,
  }),
  timeBadge: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  // Items inside card
  itemsSection: { padding: '12px 16px 8px' },
  orderItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  itemLeft: { flex: 1 },
  itemName: {
    fontSize: 12, fontWeight: 700, color: '#fff',
    textTransform: 'uppercase', fontFamily: 'Barlow Condensed, sans-serif',
  },
  itemCustom: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1, textTransform: 'uppercase' },
  itemQty: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: '#aaa',
    marginLeft: 8, flexShrink: 0,
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', padding: '10px 16px 0',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  totalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontWeight: 700 },
  totalAmt: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#fff',
  },
  payMethod: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' },
  // Action button
  actionBtn: (status) => ({
    width: '100%', padding: '13px', border: 'none', cursor: status === 'completed' ? 'default' : 'pointer',
    background: status === 'completed' ? 'rgba(255,255,255,0.05)' : STATUS_META[status].color,
    color: status === 'completed' ? 'rgba(255,255,255,0.25)' : '#fff',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 1,
    transition: 'all 0.15s',
  }),
  loadingText: {
    textAlign: 'center', padding: '40px 20px',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 20,
    color: 'rgba(255,255,255,0.3)', letterSpacing: 1,
  },
}

export default function KitchenPage() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  // Load initial orders
  useEffect(() => {
    fetchOrders()
  }, [])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'myfoodapp' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o))
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('myfoodapp')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) console.error('Fetch error:', error.message)
    else setOrders(data || [])
    setLoading(false)
  }

  const advanceStatus = async (order) => {
    const currentIdx = STATUS_FLOW.indexOf(order.status)
    if (currentIdx >= STATUS_FLOW.length - 1) return
    const nextStatus = STATUS_FLOW[currentIdx + 1]

    const { error } = await supabase
      .from('myfoodapp')
      .update({ status: nextStatus })
      .eq('id', order.id)

    if (error) console.error('Update error:', error.message)
    else setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o))
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready:     orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  const formatTime = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const headerStyle = isDesktop ? { ...S.header, padding: '28px 36px 28px' } : S.header
  const statsStyle = isDesktop ? { ...S.stats, gap: 14, marginTop: 18 } : S.stats
  const filterRowStyle = isDesktop ? { ...S.filterRow, padding: '18px 24px 10px' } : S.filterRow

  const orderListStyle = isDesktop
    ? {
        ...S.orderList,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 14,
        padding: '16px 24px 32px',
        alignContent: 'start',
      }
    : S.orderList

  const emptyStateStyle = isDesktop ? { ...S.emptyState, gridColumn: '1 / -1' } : S.emptyState
  const loadingTextStyle = isDesktop ? { ...S.loadingText, gridColumn: '1 / -1' } : S.loadingText
  const refreshBtnBase = {
    width: '100%', padding: '12px', marginTop: 8,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.4)', borderRadius: 12, cursor: 'pointer',
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
    fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
  }
  const refreshBtnStyle = isDesktop ? { ...refreshBtnBase, gridColumn: '1 / -1' } : refreshBtnBase

  return (
    <div style={S.shell}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={S.topRow}>
          <button style={S.backBtn} onClick={() => navigate('/')}>← MENU</button>
          <div style={S.liveIndicator}>
            <div style={S.liveDot} />
            <span style={S.liveText}>LIVE</span>
          </div>
        </div>
        <div style={S.kitchenTitle}>🍳 KITCHEN DISPLAY</div>
        <div style={S.kitchenSub}>REAL-TIME ORDER MANAGEMENT</div>

        {/* Stats */}
        <div style={statsStyle}>
          {[
            { label: 'PENDING',   count: counts.pending,   color: '#FF8F00' },
            { label: 'PREPARING', count: counts.preparing, color: '#42A5F5' },
            { label: 'READY',     count: counts.ready,     color: '#66BB6A' },
            { label: 'DONE',      count: counts.completed, color: '#777' },
          ].map(s => (
            <div key={s.label} style={S.statBox(s.color)}>
              <span style={S.statNum(s.color)}>{s.count}</span>
              <span style={S.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={filterRowStyle}>
        {[
          { id: 'all',       label: 'ALL ORDERS' },
          { id: 'pending',   label: '⏳ PENDING' },
          { id: 'preparing', label: '👨‍🍳 PREPARING' },
          { id: 'ready',     label: '✅ READY' },
          { id: 'completed', label: '🎉 DONE' },
        ].map(tab => (
          <button key={tab.id} style={S.filterTab(filterStatus === tab.id)} onClick={() => setFilterStatus(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ORDER LIST */}
      <div style={orderListStyle}>
        {loading ? (
          <div style={loadingTextStyle}>LOADING ORDERS...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={S.emptyIcon}>🍽️</div>
            <div style={S.emptyText}>NO ORDERS YET</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Waiting for new orders...
            </div>
          </div>
        ) : (
          filteredOrders.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.pending
            const items = Array.isArray(order.items) ? order.items : []
            return (
              <div key={order.id} style={S.orderCard(order.status)}>
                {/* Top row */}
                <div style={S.cardTop(order.status)}>
                  <div style={S.cardTopLeft}>
                    <span style={S.statusEmoji}>{meta.emoji}</span>
                    <div>
                      <div style={S.queueNum}>#{String(order.queue_number || 0).padStart(3,'0')}</div>
                      <div style={S.timeBadge}>{formatTime(order.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={S.statusBadge(order.status)}>{meta.label}</div>
                    <div style={S.payMethod}>{order.payment_method || 'DEMO'}</div>
                  </div>
                </div>

                {/* Items */}
                <div style={S.itemsSection}>
                  {items.map((item, idx) => (
                    <div key={idx} style={S.orderItem}>
                      <div style={S.itemLeft}>
                        <div style={S.itemName}>{item.name}</div>
                        <div style={S.itemCustom}>{item.customLabel}</div>
                      </div>
                      <span style={S.itemQty}>×{item.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={S.totalRow}>
                  <div>
                    <div style={S.totalLabel}>TOTAL</div>
                  </div>
                  <div style={S.totalAmt}>${(order.total || 0).toFixed(2)}</div>
                </div>

                {/* Action button */}
                <button
                  style={S.actionBtn(order.status)}
                  onClick={() => advanceStatus(order)}
                >
                  {meta.next || `${meta.emoji} COMPLETED`}
                  {meta.next && ' →'}
                </button>
              </div>
            )
          })
        )}

        {/* Refresh button */}
        <button
          onClick={fetchOrders}
          style={refreshBtnStyle}
        >
          ↻ REFRESH ORDERS
        </button>
      </div>
    </div>
  )
}

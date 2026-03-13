import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories, menuItems } from '../data/menuData'
import { supabase } from '../lib/supabase'
import { useMediaQuery } from '../lib/useMediaQuery'
import ItemModal from '../components/ItemModal'
import CartDrawer from '../components/CartDrawer'
import PaymentModal from '../components/PaymentModal'
import Receipt from '../components/Receipt'

function formatHeaderTime(d) {
  return d.toLocaleString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase()
}

function genOrderId() {
  return Math.floor(10000000000 + Math.random() * 89999999999).toString()
}

function Icon({ name, size = 22, color = 'currentColor' }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { display: 'block' },
  }

  switch (name) {
    case 'grid':
      return (
        <svg {...p}>
          <path d="M4 4h7v7H4z" />
          <path d="M13 4h7v7h-7z" />
          <path d="M4 13h7v7H4z" />
          <path d="M13 13h7v7h-7z" />
        </svg>
      )
    case 'pizza':
      return (
        <svg {...p}>
          <path d="M12 2c4.6 0 8.6 1.8 10 4.5L12 22 2 6.5C3.4 3.8 7.4 2 12 2z" />
          <path d="M7.5 10.5h.01" />
          <path d="M12 8.5h.01" />
          <path d="M16.5 11.5h.01" />
        </svg>
      )
    case 'burgers':
      return (
        <svg {...p}>
          <path d="M5 9c1.2-3 4.2-5 7-5s5.8 2 7 5" />
          <path d="M4 12h16" />
          <path d="M6 12v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2" />
          <path d="M6 19h12" />
        </svg>
      )
    case 'drinks':
      return (
        <svg {...p}>
          <path d="M7 6h10l-1 14H8L7 6z" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M12 10v4" />
          <path d="M13.5 9.5 12 10 10.5 9.5" />
        </svg>
      )
    case 'kitchen':
      return (
        <svg {...p}>
          <path d="M4 3h4v8H4z" />
          <path d="M6 11v10" />
          <path d="M14 3v8" />
          <path d="M14 11c0-2.2 1.8-4 4-4v4a4 4 0 0 1-4 4z" />
          <path d="M14 15v6" />
        </svg>
      )
    case 'sort':
      return (
        <svg {...p}>
          <path d="M8 7h12" />
          <path d="M4 7h.01" />
          <path d="M8 12h10" />
          <path d="M4 12h.01" />
          <path d="M8 17h6" />
          <path d="M4 17h.01" />
        </svg>
      )
    default:
      return null
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  shell: {
    width: '100%', minHeight: '100vh',
    background: '#fff', display: 'flex', flexDirection: 'column',
    position: 'relative',
  },
  // Hero section
  hero: {
    background: 'linear-gradient(160deg, #1B3320 0%, #0f1f12 100%)',
    padding: '0 0 18px 0',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  heroGlow: {
    position: 'absolute',
    inset: -120,
    background:
      'radial-gradient(closest-side at 18% 20%, rgba(255,214,0,0.12), transparent 60%),' +
      'radial-gradient(closest-side at 80% 30%, rgba(239,83,80,0.10), transparent 60%),' +
      'radial-gradient(closest-side at 30% 85%, rgba(255,255,255,0.06), transparent 55%)',
    filter: 'blur(0px)',
    opacity: 1,
    pointerEvents: 'none',
  },
  heroNoise: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15)),' +
      'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 10px)',
    opacity: 0.35,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
  },
  heroTopBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px 10px', zIndex: 2, position: 'relative',
  },
  brandPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(0,0,0,0.20)',
    backdropFilter: 'blur(10px)',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: 'linear-gradient(145deg, rgba(255,214,0,0.92), rgba(239,83,80,0.92))',
    boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.05,
  },
  brandName: {
    fontFamily: 'Bebas Neue, sans-serif',
    color: '#fff',
    letterSpacing: 2,
    fontSize: 18,
  },
  brandSub: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
  topRight: { display: 'flex', alignItems: 'center', gap: 8 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(0,0,0,0.18)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: 'uppercase',
    backdropFilter: 'blur(10px)',
    whiteSpace: 'nowrap',
  },
  chipDim: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: 700,
  },
  heroContent: {
    padding: '8px 20px 32px',
    display: 'flex',
    justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2,
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: 44, lineHeight: 1, color: '#fff', letterSpacing: 2,
    textShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  heroSub: {
    fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 2,
    textTransform: 'uppercase', marginTop: 6,
  },
  heroMetaRow: {
    marginTop: 14,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  promoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.16)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    backdropFilter: 'blur(10px)',
  },
  heroPizzaImg: {
    width: 130, height: 130, borderRadius: '50%', objectFit: 'cover',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.15)',
    marginRight: -10, marginBottom: -10,
  },
  heroWave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 40,
    zIndex: 1,
    pointerEvents: 'none',
  },
  // Body
  body: {
    flex: 1, background: '#fff', borderRadius: '24px 24px 0 0',
    marginTop: -16, display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  // Filter tabs
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '16px 16px 8px', borderBottom: '1px solid #f0f0f0',
  },
  filterTab: (active) => ({
    padding: '7px 16px', borderRadius: 20,
    background: active ? '#111' : 'transparent',
    color: active ? '#fff' : '#888',
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
    fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
    border: active ? 'none' : '1.5px solid #e8e8e8',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
  }),
  sortPill: (active) => ({
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
    borderRadius: 999,
    background: active ? '#111' : '#fff',
    color: active ? '#fff' : '#555',
    border: '1.5px solid #e8e8e8',
    cursor: 'pointer',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 800,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),
  // Category sidebar + menu grid
  menuArea: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: {
    width: 78, flexShrink: 0, overflowY: 'auto', background: '#fff',
    borderRight: '1px solid #f0f0f0', padding: '12px 0',
  },
  catItem: (active) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 6px', cursor: 'pointer', gap: 6,
    borderLeft: active ? '3px solid #111' : '3px solid transparent',
    background: active ? '#f8f8f8' : 'transparent',
    transition: 'all 0.15s',
  }),
  catIcon: { width: 22, height: 22, display: 'block' },
  catIconBox: (active) => ({
    width: 50, height: 50, borderRadius: 14,
    background: active ? '#111' : '#f4f4f4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  }),
  catLabel: (active) => ({
    fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: 0.5, color: active ? '#111' : '#999',
    textAlign: 'center', lineHeight: 1.2,
  }),
  // Grid
  gridArea: { flex: 1, overflowY: 'auto', padding: 12 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  // Item card
  card: {
    background: '#f8f8f8', borderRadius: 18, overflow: 'hidden',
    cursor: 'pointer', position: 'relative', transition: 'transform 0.1s',
    border: '1.5px solid #efefef',
  },
  cardImgWrap: {
    width: '100%',
    aspectRatio: '16 / 10',
    overflow: 'hidden',
    position: 'relative',
    background: 'linear-gradient(145deg,#f2f2f2,#f9f9f9)',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
    transform: 'scale(1)',
  },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    background: '#D32F2F', color: '#fff',
    fontSize: 9, fontWeight: 900, padding: '3px 7px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  trendingBadge: {
    position: 'absolute', top: 8, left: 8,
    background: '#FF8F00', color: '#fff',
    fontSize: 9, fontWeight: 900, padding: '3px 7px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardBody: { padding: '10px 12px 12px' },
  cardName: {
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
    fontSize: 15, textTransform: 'uppercase', color: '#111',
    lineHeight: 1.15, marginBottom: 6,
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 },
  cardPrice: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#D32F2F',
  },
  cardOrigPrice: {
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
    fontSize: 14, color: '#bbb', textDecoration: 'line-through',
  },
  // Bottom bar
  bottomBar: {
    position: 'sticky', bottom: 0, display: 'flex',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    flexShrink: 0,
    boxShadow: '0 -10px 30px rgba(0,0,0,0.06)',
  },
  kitchenBtn: {
    width: 56,
    border: 'none',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0.55,
    transition: 'opacity 0.15s',
  },
  cartBtn: {
    flex: 1, padding: '16px', background: 'transparent', border: 'none',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 1,
    color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: 8, justifyContent: 'center',
  },
  cartBadge: {
    background: '#D32F2F', color: '#fff', borderRadius: 50,
    width: 22, height: 22, fontSize: 12, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  checkoutBtn: (can) => ({
    flex: 1.2,
    padding: '16px',
    background: can ? '#D32F2F' : '#f0f0f0',
    border: 'none',
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: 18,
    letterSpacing: 1.5,
    color: can ? '#fff' : '#b7b7b7',
    cursor: can ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    transition: 'all 0.15s',
  }),
}

const FILTER_TABS = ['ALL', 'DISCOUNT', 'TRENDING']

export default function MenuPage() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [now, setNow] = useState(() => new Date())
  const [sortMode, setSortMode] = useState('featured') // featured | price_asc | price_desc
  const [activeCategory, setActiveCategory] = useState('pizza')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const orderCounter = useRef(Math.floor(10 + Math.random() * 90))

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30 * 1000)
    return () => clearInterval(t)
  }, [])

  const dateStr = useMemo(() => formatHeaderTime(now), [now])
  const timeStr = useMemo(() => now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase(), [now])
  const dayStr = useMemo(() => now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  }).toUpperCase(), [now])

  const sortLabel =
    sortMode === 'featured' ? 'SORT' :
    sortMode === 'price_asc' ? 'PRICE LOW' :
    'PRICE HIGH'

  const cycleSort = () => {
    setSortMode(m => (m === 'featured' ? 'price_asc' : m === 'price_asc' ? 'price_desc' : 'featured'))
  }

  const rawItems = useMemo(() => {
    if (activeCategory === 'all') return Object.values(menuItems).flat()
    return menuItems[activeCategory] || []
  }, [activeCategory])

  const filteredItems = useMemo(() => {
    const base = activeFilter === 'ALL'
      ? rawItems
      : rawItems.filter(i => i.tags.includes(activeFilter.toLowerCase()))

    const sorted = [...base]
    if (sortMode === 'price_asc') sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sortMode === 'price_desc') sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    return sorted
  }, [rawItems, activeFilter, sortMode])

  const heroTopBarStyle = isDesktop ? { ...S.heroTopBar, padding: '18px 48px 12px' } : S.heroTopBar
  const heroContentStyle = isDesktop ? { ...S.heroContent, padding: '14px 48px 30px' } : S.heroContent
  const heroTitleStyle = isDesktop ? { ...S.heroTitle, fontSize: 64 } : S.heroTitle
  const heroPizzaImgStyle = isDesktop ? { ...S.heroPizzaImg, width: 180, height: 180 } : S.heroPizzaImg

  const sidebarStyle = isDesktop ? { ...S.sidebar, width: 120 } : S.sidebar
  const catIconBoxStyle = (active) => {
    const base = S.catIconBox(active)
    return isDesktop ? { ...base, width: 64, height: 64, borderRadius: 16 } : base
  }
  const catLabelStyle = (active) => {
    const base = S.catLabel(active)
    return isDesktop ? { ...base, fontSize: 11 } : base
  }

  const gridAreaStyle = isDesktop ? { ...S.gridArea, padding: 20 } : S.gridArea
  const gridStyle = isDesktop
    ? { ...S.grid, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }
    : S.grid
  const cardImgWrapStyle = isDesktop ? { ...S.cardImgWrap, aspectRatio: '16 / 9' } : S.cardImgWrap

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.totalPrice, 0)
  const canCheckout = cartCount > 0

  const handleAddToCart = (item) => {
    setCart(prev => {
      // Check if same item with same customization exists
      const idx = prev.findIndex(c => c.id === item.id && c.customLabel === item.customLabel)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          qty: updated[idx].qty + item.qty,
          totalPrice: (updated[idx].qty + item.qty) * updated[idx].unitPrice,
        }
        return updated
      }
      return [...prev, item]
    })
  }

  const handleQtyChange = (idx, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter((_, i) => i !== idx))
    } else {
      setCart(prev => prev.map((item, i) =>
        i === idx
          ? { ...item, qty: newQty, totalPrice: parseFloat((newQty * item.unitPrice).toFixed(2)) }
          : item
      ))
    }
  }

  const handleConfirmPayment = async (paymentMethod) => {
    const queueNumber = orderCounter.current++
    const orderId = genOrderId()
    const total = parseFloat(cartTotal.toFixed(2))

    const orderPayload = {
      queue_number: queueNumber,
      order_id: orderId,
      status: 'pending',
      payment_method: paymentMethod,
      total,
      items: cart,
      created_at: new Date().toISOString(),
    }

    // Save to Supabase
    const { error } = await supabase.from('myfoodapp').insert([orderPayload])
    if (error) console.error('Supabase insert error:', error.message)

    setShowPayment(false)
    setShowCart(false)
    setReceipt({ ...orderPayload })
    setCart([])
  }

  const heroImages = {
    all:     'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
    pizza:   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
    burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
    drinks:  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80',
  }

  return (
    <div style={S.shell}>
      {/* HERO */}
      <div style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroNoise} />
        <div style={heroTopBarStyle}>
          <div style={S.brandPill}>
            <div style={S.brandMark}>
              <Icon name="pizza" size={18} color="#111" />
            </div>
            <div style={S.brandText}>
              <div style={S.brandName}>ANOOOONIM PIZZA</div>
              <div style={S.brandSub}>IN-RESTAURANT ORDERING</div>
            </div>
          </div>
          <div style={S.topRight}>
            <span style={S.chip} title={dateStr}>
              <span style={S.chipDim}>{dayStr}</span>
              <span>{timeStr}</span>
            </span>
            <span style={S.chip}>
              <span style={S.chipDim}>KIOSK</span>
              <span>#{String(orderCounter.current).padStart(3,'0')}</span>
            </span>
          </div>
        </div>
        <div style={heroContentStyle}>
          <div style={S.heroText}>
            <div style={heroTitleStyle}>WHAT'S YOUR<br />CRAVING TODAY?</div>
            <div style={S.heroSub}>FRESHLY MADE. SERVED FAST. EAT IN OR TAKE OUT.</div>
            <div style={S.heroMetaRow}>
              <span style={S.promoChip}>HOUSE FAVORITES</span>
              <span style={S.promoChip}>CUSTOMIZE EVERYTHING</span>
              <span style={S.promoChip}>NO WAITING IN LINE</span>
            </div>
          </div>
          <img
            src={heroImages[activeCategory] || heroImages.all}
            alt="food"
            style={heroPizzaImgStyle}
            onError={e => { e.target.src = heroImages.pizza }}
          />
        </div>

        <svg style={S.heroWave} viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,34 C180,62 360,6 540,34 C720,62 900,6 1080,34 C1260,62 1380,22 1440,34 L1440,60 L0,60 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* BODY */}
      <div style={S.body}>
        {/* Filter bar */}
        <div style={S.filterBar}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              style={S.filterTab(activeFilter === tab)}
              onClick={() => setActiveFilter(tab)}
            >
              {tab === 'DISCOUNT' ? '⊘ ' : tab === 'TRENDING' ? '↗ ' : ''}{tab}
            </button>
          ))}
          <button style={S.sortPill(sortMode !== 'featured')} onClick={cycleSort} title={`Sort: ${sortLabel}`}>
            <Icon name="sort" size={16} color={sortMode !== 'featured' ? '#fff' : '#777'} />
            <span>{sortLabel}</span>
          </button>
        </div>

        {/* Menu area */}
        <div style={S.menuArea}>
          {/* Sidebar categories */}
          <div style={sidebarStyle}>
            {/* All button */}
            <div
              style={S.catItem(activeCategory === 'all')}
              onClick={() => { setActiveCategory('all'); setActiveFilter('ALL') }}
            >
              <div style={catIconBoxStyle(activeCategory === 'all')}>
                <Icon name="grid" size={22} color={activeCategory === 'all' ? '#fff' : '#777'} />
              </div>
              <span style={catLabelStyle(activeCategory === 'all')}>ALL</span>
            </div>

            {categories.map(cat => (
              <div
                key={cat.id}
                style={S.catItem(activeCategory === cat.id)}
                onClick={() => { setActiveCategory(cat.id); setActiveFilter('ALL') }}
              >
                <div style={catIconBoxStyle(activeCategory === cat.id)}>
                  <span style={S.catIcon}>
                    <Icon name={cat.id} size={22} color={activeCategory === cat.id ? '#fff' : '#777'} />
                  </span>
                </div>
                <span style={catLabelStyle(activeCategory === cat.id)}>{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Items grid */}
          <div style={gridAreaStyle}>
            <div style={gridStyle}>
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    ...S.card,
                    animation: 'scaleIn 0.28s cubic-bezier(0.32,0.72,0,1) both',
                    animationDelay: `${Math.min(idx, 14) * 28}ms`,
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={cardImgWrapStyle}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={S.cardImg}
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=60'
                      }}
                    />
                    {item.tags.includes('discount') && (
                      <div style={S.discountBadge}>SALE</div>
                    )}
                    {item.tags.includes('trending') && !item.tags.includes('discount') && (
                      <div style={S.trendingBadge}>HOT</div>
                    )}
                  </div>
                  <div style={S.cardBody}>
                    <div style={S.cardName}>{item.name}</div>
                    <div style={S.priceRow}>
                      <span style={S.cardPrice}>${item.price}</span>
                      {item.originalPrice && (
                        <span style={S.cardOrigPrice}>${item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 1 }}>
                    NO ITEMS IN THIS FILTER
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={S.bottomBar}>
        {/* Small / hidden Kitchen entry */}
        <button
          style={S.kitchenBtn}
          onClick={() => navigate('/kitchen')}
          title="Kitchen"
          onMouseEnter={e => { e.currentTarget.style.opacity = 0.95 }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.55 }}
        >
          <Icon name="kitchen" size={20} color="#111" />
        </button>

        <button
          style={{ ...S.cartBtn, opacity: canCheckout ? 1 : 0.6 }}
          onClick={() => canCheckout && setShowCart(true)}
          title={canCheckout ? 'View cart' : 'Add items to your cart'}
        >
          <span>{canCheckout ? 'CART' : 'BROWSE'}</span>
          {canCheckout && <span style={S.cartBadge}>{cartCount}</span>}
        </button>

        <button
          style={S.checkoutBtn(canCheckout)}
          onClick={() => { if (canCheckout) { setShowCart(false); setShowPayment(true) } }}
          disabled={!canCheckout}
          title={canCheckout ? 'Checkout' : 'Add items to checkout'}
        >
          <span>CHECKOUT</span>
        </button>
      </div>

      {/* MODALS */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddToCart}
        />
      )}

      {showCart && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onQtyChange={handleQtyChange}
          onCheckout={() => { setShowCart(false); setShowPayment(true) }}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={cartTotal.toFixed(2)}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
        />
      )}

      {receipt && (
        <Receipt
          order={receipt}
          onDone={() => setReceipt(null)}
        />
      )}
    </div>
  )
}

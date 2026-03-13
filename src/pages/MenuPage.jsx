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
    padding: '0 0 0 0', position: 'relative', overflow: 'hidden', flexShrink: 0,
  },
  heroTopBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px 10px', zIndex: 2, position: 'relative',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  topRight: { display: 'flex', alignItems: 'center', gap: 8 },
  dateTag: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  orderNum: {
    background: 'rgba(255,255,255,0.15)', color: '#fff',
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
  },
  heroContent: {
    padding: '4px 20px 22px', display: 'flex',
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
  heroPizzaImg: {
    width: 130, height: 130, borderRadius: '50%', objectFit: 'cover',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.15)',
    marginRight: -10, marginBottom: -10,
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
  sortBtn: {
    marginLeft: 'auto', background: 'none', border: 'none',
    fontSize: 18, cursor: 'pointer', color: '#888', padding: '4px 8px',
  },
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
  catIcon: { fontSize: 22 },
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
  cardImgWrap: { width: '100%', height: 110, overflow: 'hidden', position: 'relative' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
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
    borderTop: '1px solid #eee', background: '#fff',
    flexShrink: 0,
  },
  cartBtn: {
    flex: 1, padding: '16px', background: '#fff', border: 'none',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 1,
    color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: 8, justifyContent: 'center',
  },
  cartBadge: {
    background: '#D32F2F', color: '#fff', borderRadius: 50,
    width: 22, height: 22, fontSize: 12, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  checkoutBtn: {
    flex: 1.2, padding: '16px', background: '#D32F2F', border: 'none',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 1.5,
    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: 8, justifyContent: 'center',
  },
}

const FILTER_TABS = ['ALL', 'DISCOUNT', 'TRENDING']

export default function MenuPage() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [activeCategory, setActiveCategory] = useState('pizza')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const orderCounter = useRef(Math.floor(10 + Math.random() * 90))

  const rawItems = menuItems[activeCategory] || []
  const filteredItems = activeFilter === 'ALL'
    ? rawItems
    : rawItems.filter(i => i.tags.includes(activeFilter.toLowerCase()))

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
  const cardImgWrapStyle = isDesktop ? { ...S.cardImgWrap, height: 150 } : S.cardImgWrap

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.totalPrice, 0)

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
    pizza:   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
    burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
    drinks:  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80',
  }

  return (
    <div style={S.shell}>
      {/* HERO */}
      <div style={S.hero}>
        <div style={heroTopBarStyle}>
          <button style={S.backBtn} onClick={() => navigate('/kitchen')}>
            ⚙ KITCHEN
          </button>
          <div style={S.topRight}>
            <span style={S.dateTag}>{dateStr}</span>
            <span style={S.orderNum}>#{String(orderCounter.current).padStart(3,'0')}</span>
          </div>
        </div>
        <div style={heroContentStyle}>
          <div style={S.heroText}>
            <div style={heroTitleStyle}>DO YOU HAVE ANY<br />ORDER TODAY?</div>
            <div style={S.heroSub}>FRESHLY BAKED. MADE FOR YOU TODAY.</div>
          </div>
          <img
            src={heroImages[activeCategory]}
            alt="food"
            style={heroPizzaImgStyle}
            onError={e => { e.target.src = heroImages.pizza }}
          />
        </div>
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
          <button style={S.sortBtn}>↕</button>
        </div>

        {/* Menu area */}
        <div style={S.menuArea}>
          {/* Sidebar categories */}
          <div style={sidebarStyle}>
            {/* All button */}
            <div
              style={S.catItem(false)}
              onClick={() => {}}
            >
              <div style={catIconBoxStyle(false)}>
                <span style={{ fontSize: 20, color: '#999' }}>⊞</span>
              </div>
              <span style={catLabelStyle(false)}>ALL</span>
            </div>

            {categories.map(cat => (
              <div
                key={cat.id}
                style={S.catItem(activeCategory === cat.id)}
                onClick={() => { setActiveCategory(cat.id); setActiveFilter('ALL') }}
              >
                <div style={catIconBoxStyle(activeCategory === cat.id)}>
                  <span style={S.catIcon}>{cat.icon}</span>
                </div>
                <span style={catLabelStyle(activeCategory === cat.id)}>{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Items grid */}
          <div style={gridAreaStyle}>
            <div style={gridStyle}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={S.card}
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
                      <div style={S.trendingBadge}>🔥 HOT</div>
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
      {cartCount > 0 && (
        <div style={S.bottomBar}>
          <button style={S.cartBtn} onClick={() => setShowCart(true)}>
            <span>🛒</span>
            <span>CART</span>
            <span style={S.cartBadge}>{cartCount}</span>
          </button>
          <button style={S.checkoutBtn} onClick={() => { setShowCart(false); setShowPayment(true) }}>
            <span>💳</span>
            <span>CHECKOUT</span>
          </button>
        </div>
      )}

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

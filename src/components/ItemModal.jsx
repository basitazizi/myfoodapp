import { useState } from 'react'
import { useMediaQuery } from '../lib/useMediaQuery'

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    zIndex: 200, display: 'flex', alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    width: '100%', maxWidth: 430, margin: '0 auto',
    background: '#fff', borderRadius: '24px 24px 0 0',
    paddingBottom: 'env(safe-area-inset-bottom)',
    animation: 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  imgWrap: {
    width: '100%', height: 220, overflow: 'hidden',
    borderRadius: '24px 24px 0 0', position: 'relative', flexShrink: 0,
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  body: { padding: '20px 20px 0' },
  name: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 28,
    color: '#111', letterSpacing: 1, marginBottom: 4,
  },
  desc: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  price: { fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 32, color: '#111' },
  section: { marginTop: 18 },
  sectionTitle: {
    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
    fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5,
    color: '#555', marginBottom: 10,
  },
  ingRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  ingChip: (active) => ({
    padding: '7px 14px', borderRadius: 50,
    border: `1.5px solid ${active ? '#111' : '#ddd'}`,
    background: active ? '#111' : '#fff',
    color: active ? '#fff' : '#888',
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    textTransform: 'uppercase', letterSpacing: 0.5,
    transition: 'all 0.15s',
    textDecoration: active ? 'none' : 'line-through',
  }),
  extraRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #f0f0f0',
  },
  extraName: { fontSize: 13, fontWeight: 600, color: '#222', textTransform: 'uppercase' },
  extraPrice: { fontSize: 13, fontWeight: 700, color: '#555' },
  extraToggle: (active) => ({
    width: 28, height: 28, borderRadius: 8,
    border: `2px solid ${active ? '#D32F2F' : '#ddd'}`,
    background: active ? '#D32F2F' : '#fff',
    color: active ? '#fff' : '#bbb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 16, fontWeight: 900,
    transition: 'all 0.15s',
  }),
  qtyRow: {
    display: 'flex', alignItems: 'center', gap: 20,
    justifyContent: 'center', margin: '20px 0 8px',
  },
  qtyBtn: (disabled) => ({
    width: 40, height: 40, borderRadius: 50,
    border: '1.5px solid #ddd', background: disabled ? '#f5f5f5' : '#fff',
    fontSize: 20, fontWeight: 700, color: disabled ? '#ccc' : '#111',
    cursor: disabled ? 'default' : 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  }),
  qtyNum: {
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 32,
    color: '#111', minWidth: 36, textAlign: 'center',
  },
  footer: {
    position: 'sticky', bottom: 0, background: '#fff',
    padding: '16px 20px 24px', borderTop: '1px solid #f0f0f0',
  },
  addBtn: {
    width: '100%', padding: '16px', borderRadius: 14,
    background: '#D32F2F', color: '#fff', border: 'none',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 1.5,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
}

export default function ItemModal({ item, onClose, onAdd }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [qty, setQty] = useState(1)
  // ingredients: set of names that are REMOVED
  const [removed, setRemoved] = useState(new Set())
  const [extras, setExtras] = useState(new Set())

  if (!item) return null

  const overlayStyle = isDesktop ? { ...S.overlay, alignItems: 'center', padding: 24 } : S.overlay
  const sheetStyle = isDesktop
    ? { ...S.sheet, maxWidth: 820, borderRadius: 24, animation: 'scaleIn 0.25s cubic-bezier(0.32,0.72,0,1)' }
    : S.sheet
  const imgWrapStyle = isDesktop ? { ...S.imgWrap, height: 320 } : S.imgWrap

  const toggleIngredient = (name) => {
    setRemoved(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const toggleExtra = (name) => {
    setExtras(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const extrasTotal = item.extras
    .filter(e => extras.has(e.name))
    .reduce((sum, e) => sum + e.price, 0)

  const unitPrice = item.price + extrasTotal
  const total = (unitPrice * qty).toFixed(2)

  const handleAdd = () => {
    onAdd({
      ...item,
      qty,
      removedIngredients: [...removed],
      selectedExtras: item.extras.filter(e => extras.has(e.name)),
      unitPrice,
      totalPrice: parseFloat(total),
      customLabel: [
        ...[...removed].map(r => `No ${r}`),
        ...[...extras],
      ].join(', ') || 'Standard',
    })
    onClose()
  }

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={sheetStyle}>
        <div style={imgWrapStyle}>
          <img
            src={item.image}
            alt={item.name}
            style={S.img}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80' }}
          />
          {/* Close pill */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.5)', border: 'none',
              color: '#fff', width: 32, height: 32, borderRadius: 50,
              fontSize: 16, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={S.body}>
          <div style={S.name}>{item.name}</div>
          <div style={S.desc}>{item.description}</div>
          <div style={S.price}>${item.price}
            {extrasTotal > 0 && (
              <span style={{ fontSize: 14, color: '#D32F2F', marginLeft: 8 }}>
                +${extrasTotal.toFixed(2)} extras
              </span>
            )}
          </div>

          {/* Ingredients */}
          <div style={S.section}>
            <div style={S.sectionTitle}>⊘ Tap to Remove Ingredient</div>
            <div style={S.ingRow}>
              {item.ingredients.map(ing => (
                <button
                  key={ing}
                  style={S.ingChip(!removed.has(ing))}
                  onClick={() => toggleIngredient(ing)}
                >
                  {removed.has(ing) ? '✕ ' : ''}{ing}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div style={S.section}>
            <div style={S.sectionTitle}>＋ Add Extras</div>
            {item.extras.map(extra => (
              <div key={extra.name} style={S.extraRow}>
                <div>
                  <div style={S.extraName}>{extra.name}</div>
                  {extra.price > 0 && (
                    <div style={{ fontSize: 11, color: '#D32F2F', fontWeight: 700 }}>
                      +${extra.price.toFixed(2)}
                    </div>
                  )}
                </div>
                <div
                  style={S.extraToggle(extras.has(extra.name))}
                  onClick={() => toggleExtra(extra.name)}
                >
                  {extras.has(extra.name) ? '✓' : '+'}
                </div>
              </div>
            ))}
          </div>

          {/* Qty */}
          <div style={S.qtyRow}>
            <button style={S.qtyBtn(qty <= 1)} onClick={() => qty > 1 && setQty(q => q - 1)}>−</button>
            <span style={S.qtyNum}>{qty}</span>
            <button style={S.qtyBtn(false)} onClick={() => setQty(q => q + 1)}>+</button>
          </div>
        </div>

        <div style={S.footer}>
          <button style={S.addBtn} onClick={handleAdd}>
            <span>ADD TO ORDER</span>
            <span>${total}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

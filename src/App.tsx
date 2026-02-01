import { useState, useEffect } from 'react'
import './App.css'

interface Subscription {
  id: string
  name: string
  cost: number
  billingCycle: 'monthly' | 'yearly'
  category: string
  color: string
}

const CATEGORIES = ['Streaming', 'Software', 'Gaming', 'Music', 'Cloud', 'Other']
const CATEGORY_COLORS: Record<string, string> = {
  'Streaming': '#ff6b6b',
  'Software': '#4ecdc4',
  'Gaming': '#ffe66d',
  'Music': '#a855f7',
  'Cloud': '#3b82f6',
  'Other': '#6b7280'
}

const PRESET_SUBSCRIPTIONS = [
  { name: 'Netflix', category: 'Streaming', cost: 15.99 },
  { name: 'Spotify', category: 'Music', cost: 10.99 },
  { name: 'Disney+', category: 'Streaming', cost: 13.99 },
  { name: 'Adobe CC', category: 'Software', cost: 54.99 },
  { name: 'iCloud', category: 'Cloud', cost: 2.99 },
  { name: 'Xbox Game Pass', category: 'Gaming', cost: 16.99 },
]

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('subscriptions')
    return saved ? JSON.parse(saved) : []
  })
  const [showModal, setShowModal] = useState(false)
  const [newSub, setNewSub] = useState<{ name: string; cost: string; category: string; billingCycle: 'monthly' | 'yearly' }>({ name: '', cost: '', category: 'Streaming', billingCycle: 'monthly' })
  const [animatedTotal, setAnimatedTotal] = useState(0)

  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost)
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
  }, [subscriptions])

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = monthlyTotal / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= monthlyTotal) {
        setAnimatedTotal(monthlyTotal)
        clearInterval(timer)
      } else {
        setAnimatedTotal(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [monthlyTotal])

  const addSubscription = () => {
    if (!newSub.name || !newSub.cost) return
    const sub: Subscription = {
      id: Date.now().toString(),
      name: newSub.name,
      cost: parseFloat(newSub.cost),
      billingCycle: newSub.billingCycle,
      category: newSub.category,
      color: CATEGORY_COLORS[newSub.category]
    }
    setSubscriptions([...subscriptions, sub])
    setNewSub({ name: '', cost: '', category: 'Streaming', billingCycle: 'monthly' })
    setShowModal(false)
  }

  const addPreset = (preset: typeof PRESET_SUBSCRIPTIONS[0]) => {
    const sub: Subscription = {
      id: Date.now().toString(),
      name: preset.name,
      cost: preset.cost,
      billingCycle: 'monthly',
      category: preset.category,
      color: CATEGORY_COLORS[preset.category]
    }
    setSubscriptions([...subscriptions, sub])
  }

  const deleteSub = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id))
  }

  return (
    <div className="app">
      <div className="scanlines"></div>
      <div className="grid-bg"></div>

      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="logo-symbol">$</span>
          </div>
          <div>
            <h1 className="logo-text">SUBSCAN</h1>
            <p className="tagline">FREE SUBSCRIPTION TRACKER</p>
          </div>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <span className="btn-icon">+</span>
          <span className="btn-text">ADD SUB</span>
        </button>
      </header>

      <main className="main">
        <section className="stats-section">
          <div className="stat-card primary">
            <div className="stat-label">MONTHLY BURN</div>
            <div className="stat-value">
              <span className="currency">$</span>
              <span className="amount">{animatedTotal.toFixed(2)}</span>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${Math.min(monthlyTotal / 500 * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-label">YEARLY TOTAL</div>
            <div className="stat-value small">
              <span className="currency">$</span>
              <span className="amount">{yearlyTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-label">ACTIVE SUBS</div>
            <div className="stat-value small">
              <span className="amount">{subscriptions.length}</span>
            </div>
          </div>
        </section>

        {subscriptions.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon">[ ]</div>
            <h2>NO SUBSCRIPTIONS TRACKED</h2>
            <p>Add your first subscription or choose from presets below</p>

            <div className="presets">
              <h3>QUICK ADD</h3>
              <div className="preset-grid">
                {PRESET_SUBSCRIPTIONS.map((preset) => (
                  <button
                    key={preset.name}
                    className="preset-btn"
                    onClick={() => addPreset(preset)}
                    style={{ '--accent': CATEGORY_COLORS[preset.category] } as React.CSSProperties}
                  >
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-cost">${preset.cost}/mo</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="subs-section">
            <div className="section-header">
              <h2>ACTIVE SUBSCRIPTIONS</h2>
              <span className="section-count">{subscriptions.length} TRACKED</span>
            </div>

            <div className="subs-grid">
              {subscriptions.map((sub, index) => (
                <div
                  key={sub.id}
                  className="sub-card"
                  style={{
                    '--accent': sub.color,
                    '--delay': `${index * 0.1}s`
                  } as React.CSSProperties}
                >
                  <div className="sub-header">
                    <span className="sub-category">{sub.category}</span>
                    <button className="delete-btn" onClick={() => deleteSub(sub.id)}>×</button>
                  </div>
                  <div className="sub-name">{sub.name}</div>
                  <div className="sub-cost">
                    <span className="sub-amount">${sub.cost.toFixed(2)}</span>
                    <span className="sub-cycle">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="sub-glow"></div>
                </div>
              ))}
            </div>

            <div className="presets collapsed">
              <h3>QUICK ADD MORE</h3>
              <div className="preset-row">
                {PRESET_SUBSCRIPTIONS.filter(p => !subscriptions.some(s => s.name === p.name)).map((preset) => (
                  <button
                    key={preset.name}
                    className="preset-btn-small"
                    onClick={() => addPreset(preset)}
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>NEW SUBSCRIPTION</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label>SERVICE NAME</label>
                <input
                  type="text"
                  value={newSub.name}
                  onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                  placeholder="Netflix, Spotify..."
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>COST ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSub.cost}
                    onChange={e => setNewSub({ ...newSub, cost: e.target.value })}
                    placeholder="9.99"
                  />
                </div>

                <div className="input-group">
                  <label>CYCLE</label>
                  <select
                    value={newSub.billingCycle}
                    onChange={e => setNewSub({ ...newSub, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>CATEGORY</label>
                <div className="category-grid">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`category-btn ${newSub.category === cat ? 'active' : ''}`}
                      onClick={() => setNewSub({ ...newSub, category: cat })}
                      style={{ '--cat-color': CATEGORY_COLORS[cat] } as React.CSSProperties}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>CANCEL</button>
              <button className="confirm-btn" onClick={addSubscription}>ADD SUBSCRIPTION</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>Requested by @0xPaulius · Built by @clonkbot</span>
      </footer>
    </div>
  )
}

export default App
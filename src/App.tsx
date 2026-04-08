import { useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'saiyaam_budget_tracker_v1'

const SUPPLIERS = [
  'HomezInterio',
  'Lifeston',
  'MaterialDepo',
  'GardenOfJoy',
  'Lightning',
  'Furniture',
  'Decorative Items',
  'Kids Rooms Vendors',
  'Miscellanious',
  'Home Registration',
  'Home Inauguration'
] as const

type SupplierName = (typeof SUPPLIERS)[number]

const SUPPLIER_CATEGORIES: Record<SupplierName, string> = {
  HomezInterio: 'Principal Woodwork',
  Lifeston: 'Italian Marble & Stone',
  MaterialDepo: 'Raw Materials & Civils',
  GardenOfJoy: 'Landscaping & Outdoors',
  Lightning: 'Bespoke Lighting',
  Furniture: 'Custom Furniture',
  'Decorative Items': 'Decor & Accessories',
  'Kids Rooms Vendors': "Children's Spaces",
  Miscellanious: 'Miscellaneous Works',
  'Home Registration': 'Property Registration',
  'Home Inauguration': 'Inauguration Events'
}

const SUPPLIER_IMAGES: Record<SupplierName, string> = {
  HomezInterio: '/brands/HomezInterio.png',
  Lifeston: '/brands/Lifeston.png',
  MaterialDepo: '/brands/MaterialDepo.png',
  GardenOfJoy: '/brands/GardenOfJoy.png',
  Lightning: '/brands/Lightning.png',
  Furniture: '/brands/Furniture.png',
  'Decorative Items': '/brands/Decorative%20Items.png',
  'Kids Rooms Vendors': '/brands/Kids%20Rooms%20Vendors.png',
  Miscellanious: '/brands/Miscellanious.svg',
  'Home Registration': '/brands/Home%20Registration.png',
  'Home Inauguration': '/brands/Home%20Inauguration.jpg'
}

type PaymentRecord = {
  id: string
  amount: number
  date: string
  receiptFile: string
}

type Entry = {
  id: string
  supplier: SupplierName
  category: string
  status: 'active' | 'planning'
  investedTillNow: number
  quotationValue: number
  fileName: string
  paymentHistory: PaymentRecord[]
  lastUpdated: string
}

type AppState = {
  totalBudget: number
  entries: Entry[]
}

type TabKey = 'financial' | 'suppliers'

const defaultState: AppState = {
  totalBudget: 5000000,
  entries: [
    {
      id: crypto.randomUUID(),
      supplier: 'HomezInterio',
      category: 'Principal Woodwork',
      status: 'active',
      investedTillNow: 1250000,
      quotationValue: 4500000,
      fileName: 'HomezInterio_Quote.pdf',
      paymentHistory: [
        { id: crypto.randomUUID(), amount: 20000, date: '2026-03-20', receiptFile: '' },
        { id: crypto.randomUUID(), amount: 30000, date: '2026-03-30', receiptFile: '' }
      ],
      lastUpdated: '2026-03-28'
    },
    {
      id: crypto.randomUUID(),
      supplier: 'Lifeston',
      category: 'Italian Marble & Stone',
      status: 'planning',
      investedTillNow: 850000,
      quotationValue: 2000000,
      fileName: 'Quotation_Final.pdf',
      paymentHistory: [],
      lastUpdated: '2026-03-24'
    }
  ]
}

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

function formatINR(value: number): string {
  return `\u20B9 ${Math.max(0, Math.round(value)).toLocaleString('en-IN')}`
}

function twoDigitsToWords(n: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  if (n < 10) return ones[n]
  if (n < 20) return teens[n - 10]
  const t = Math.floor(n / 10)
  const o = n % 10
  return `${tens[t]}${o ? ` ${ones[o]}` : ''}`
}

function threeDigitsToWords(n: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const hundred = Math.floor(n / 100)
  const rest = n % 100
  if (!hundred) return twoDigitsToWords(rest)
  return `${ones[hundred]} Hundred${rest ? ` ${twoDigitsToWords(rest)}` : ''}`
}

function numberToWordsIndian(value: number): string {
  if (!Number.isFinite(value) || value < 0) return 'Invalid Amount'
  if (value === 0) return 'Zero Rupees'
  let n = Math.floor(value)
  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  const chunks: string[] = []
  if (crore) chunks.push(`${twoDigitsToWords(crore)} Crore`)
  if (lakh) chunks.push(`${twoDigitsToWords(lakh)} Lakh`)
  if (thousand) chunks.push(`${twoDigitsToWords(thousand)} Thousand`)
  if (n) chunks.push(threeDigitsToWords(n))
  return `${chunks.join(' ')} Rupees Only`
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaultState)
    const parsed = JSON.parse(raw) as { totalBudget?: number; entries?: Partial<Entry>[] }
    if (!Array.isArray(parsed.entries)) return structuredClone(defaultState)
    return {
      totalBudget: Number(parsed.totalBudget) || defaultState.totalBudget,
      entries: parsed.entries.map((entry) => {
        const supplier = SUPPLIERS.includes(entry.supplier as SupplierName)
          ? (entry.supplier as SupplierName)
          : SUPPLIERS[0]
        const ph: PaymentRecord[] = Array.isArray(entry.paymentHistory)
          ? entry.paymentHistory.map((r) => ({
              id: r.id || crypto.randomUUID(),
              amount: Number(r.amount) || 0,
              date: r.date || '',
              receiptFile: r.receiptFile || ''
            }))
          : []
        return {
          id: entry.id || crypto.randomUUID(),
          supplier,
          category: entry.category || SUPPLIER_CATEGORIES[supplier],
          status: entry.status === 'planning' ? 'planning' : 'active',
          investedTillNow: Number(entry.investedTillNow) || 0,
          quotationValue: Number(entry.quotationValue) || 0,
          fileName: entry.fileName || '',
          paymentHistory: ph,
          lastUpdated: entry.lastUpdated || new Date().toISOString().split('T')[0]
        }
      })
    }
  } catch {
    return structuredClone(defaultState)
  }
}

function saveState(nextState: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
}

function computePaidStatus(invested: number, quotation: number): number {
  if (!quotation || quotation <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((invested / quotation) * 100)))
}

function formatRelativeDate(isoDate: string): string {
  if (!isoDate) return 'UNKNOWN'
  const date = new Date(isoDate + 'T00:00:00')
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'TODAY'
  if (diffDays === 1) return '1D AGO'
  if (diffDays < 7) return `${diffDays}D AGO`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) return '1W AGO'
  if (diffWeeks < 4) return `${diffWeeks}W AGO`
  return `${Math.floor(diffDays / 30)}M AGO`
}

function formatPaymentDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function HomeIcon() {
  return (
    <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10.6 12 4l8 6.6v8.4a1 1 0 0 1-1 1h-4.6v-6h-4.8v6H5a1 1 0 0 1-1-1v-8.4Z" fill="currentColor" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="user-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.4 17.2c1.1-2 2.8-3 4.6-3s3.5 1 4.6 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function VerifiedIcon() {
  return (
    <svg className="verified-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="#f6cd58" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function App() {
  const [appState, setAppState] = useState<AppState>(loadState())
  const [activeTab, setActiveTab] = useState<TabKey>('financial')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({})
  const [paymentDates, setPaymentDates] = useState<Record<string, string>>({})
  const [pendingReceipts, setPendingReceipts] = useState<Record<string, File | null>>({})
  const [pendingQuotations, setPendingQuotations] = useState<Record<string, File | null>>({})

  const totals = useMemo(() => {
    const totalInvested = appState.entries.reduce((sum, entry) => sum + entry.investedTillNow, 0)
    const totalQuotation = appState.entries.reduce((sum, entry) => sum + entry.quotationValue, 0)
    const utilization = appState.totalBudget > 0
      ? Math.min(100, Math.round((totalInvested / appState.totalBudget) * 100))
      : 0
    const remaining = Math.max(0, appState.totalBudget - totalInvested)
    return { totalInvested, totalQuotation, utilization, remaining }
  }, [appState.entries, appState.totalBudget])

  const filteredEntries = useMemo(() => {
    if (!supplierFilter.trim()) return appState.entries
    const q = supplierFilter.toLowerCase()
    return appState.entries.filter(
      (e) => e.supplier.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    )
  }, [appState.entries, supplierFilter])

  const setAndPersist = (next: AppState) => {
    setAppState(next)
    saveState(next)
  }

  const updateEntry = (index: number, updater: (current: Entry) => Entry) => {
    const nextEntries = appState.entries.map((entry, i) => (i === index ? updater(entry) : entry))
    setAndPersist({ ...appState, entries: nextEntries })
  }

  const addPaymentRecord = async (entryId: string) => {
    const amount = parseCurrencyInput(paymentAmounts[entryId] || '')
    const date = paymentDates[entryId] || new Date().toISOString().split('T')[0]
    if (!amount || !date) return

    const entry = appState.entries.find((e) => e.id === entryId)
    if (!entry) return

    let receiptFile = ''
    const file = pendingReceipts[entryId]
    if (file) {
      try {
        const resp = await fetch('/api/upload-receipt', {
          method: 'POST',
          headers: {
            'x-supplier': encodeURIComponent(entry.supplier),
            'x-payment-date': date,
            'x-original-name': encodeURIComponent(file.name)
          },
          body: file
        })
        const result = await resp.json()
        if (result.ok) receiptFile = result.fileName
      } catch {
        // upload failed silently, payment still saved
      }
    }

    const nextEntries = appState.entries.map((e) => {
      if (e.id !== entryId) return e
      const newRecord: PaymentRecord = { id: crypto.randomUUID(), amount, date, receiptFile }
      const newHistory = [...e.paymentHistory, newRecord].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
      return {
        ...e,
        paymentHistory: newHistory,
        investedTillNow: newHistory.reduce((sum, r) => sum + r.amount, 0),
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    })
    setAndPersist({ ...appState, entries: nextEntries })
    setPaymentAmounts((prev) => ({ ...prev, [entryId]: '' }))
    setPaymentDates((prev) => ({ ...prev, [entryId]: new Date().toISOString().split('T')[0] }))
    setPendingReceipts((prev) => ({ ...prev, [entryId]: null }))
  }

  const uploadFinalQuotation = async (entryId: string) => {
    const file = pendingQuotations[entryId]
    if (!file) return

    const entry = appState.entries.find((e) => e.id === entryId)
    if (!entry) return

    try {
      const resp = await fetch('/api/upload-quotation', {
        method: 'POST',
        headers: {
          'x-supplier': encodeURIComponent(entry.supplier),
          'x-original-name': encodeURIComponent(file.name)
        },
        body: file
      })
      const result = await resp.json()
      if (result.ok) {
        const nextEntries = appState.entries.map((e) =>
          e.id === entryId
            ? {
                ...e,
                fileName: result.fileName,
                lastUpdated: new Date().toISOString().split('T')[0]
              }
            : e
        )
        setAndPersist({ ...appState, entries: nextEntries })
        setPendingQuotations((prev) => ({ ...prev, [entryId]: null }))
      }
    } catch {
      // upload failed silently, user can retry
    }
  }

  return (
    <div className={`app-shell${activeTab === 'suppliers' ? ' suppliers-view' : ''}`}>
      <header className="top-nav">
        <div className="brand">Saiyaam</div>
        <nav className="tabs">
          <button className={`tab ${activeTab === 'financial' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('financial')}>Financial Blueprint</button>
          <button className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('suppliers')}>Suppliers</button>
        </nav>
        {activeTab === 'suppliers' && (
          <div className="nav-search-wrap">
            <SearchIcon />
            <input
              className="nav-search-input"
              type="text"
              placeholder="Search partners..."
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            />
          </div>
        )}
        <div className="avatar"><UserIcon /></div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-head">
          <h2>Saiyaam</h2>
          <p>The Digital Atelier</p>
        </div>
        <button className={`menu-item ${activeTab === 'financial' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('financial')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="12" width="4" height="8"/><rect x="10" y="7" width="4" height="13"/><rect x="17" y="4" width="4" height="16"/></svg>
          Financial Blueprint
        </button>
        <button className={`menu-item ${activeTab === 'suppliers' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('suppliers')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Suppliers
        </button>
      </aside>

      <main className="workspace">
        {activeTab === 'financial' && (
          <section className="headline">
            <div className="headline-text">
              <p className="label">Workspace</p>
              <h1>Financial Blueprint</h1>
              <p className="subtitle">&quot;Precision is the foundation of luxury. Track every rupee as it builds your vision.&quot;</p>
            </div>
            <img src="/ganapati.jpg" alt="Ganapati Bappa" className="headline-img" />
          </section>
        )}

        {activeTab === 'financial' ? (
          <>
        <section className="budget-card card">
          <div className="section-title-row">
            <h3>Total Budget In your mind</h3>
            <span className="accent"><HomeIcon /></span>
          </div>
          <div className="budget-grid">
            <div>
              <p className="small-label">Target Amount</p>
              <div className="amount-input-wrap">
                <span className="currency">{'\u20B9'}</span>
                <input
                  value={appState.totalBudget}
                  onChange={(event) => {
                    const next = parseCurrencyInput(event.target.value)
                    setAndPersist({ ...appState, totalBudget: next })
                  }}
                  type="text"
                  inputMode="numeric"
                />
              </div>
              <div className="line" />
            </div>
            <div>
              <p className="golden words">{numberToWordsIndian(appState.totalBudget)}</p>
              <p className="tiny">Numerical word conversion verified</p>
            </div>
          </div>
        </section>

        <section className="budget-vs-quotation card">
          <div className="section-title-row">
            <h3>Budget vs Total Quotation</h3>
          </div>
          {(() => {
            const budget = appState.totalBudget
            const quotation = totals.totalQuotation
            const maxVal = Math.max(budget, quotation, 1)
            const budgetPct = (budget / maxVal) * 100
            const quotationPct = (quotation / maxVal) * 100
            const overBudget = quotation > budget
            return (
              <div className="bvq-chart">
                <div className="bvq-row">
                  <span className="bvq-label">Your Budget</span>
                  <div className="bvq-bar-track">
                    <div className="bvq-bar bvq-bar--budget" style={{ width: `${budgetPct}%` }} />
                  </div>
                  <span className="bvq-value">{formatINR(budget)}</span>
                </div>
                <div className="bvq-row">
                  <span className="bvq-label">Total Quotation</span>
                  <div className="bvq-bar-track">
                    <div
                      className={`bvq-bar bvq-bar--quotation${overBudget ? ' bvq-bar--over' : ''}`}
                      style={{ width: `${quotationPct}%` }}
                    />
                  </div>
                  <span className="bvq-value">{formatINR(quotation)}</span>
                </div>
                <div className="bvq-diff">
                  {overBudget ? (
                    <span className="bvq-diff--over">Quotations exceed budget by <strong>{formatINR(quotation - budget)}</strong></span>
                  ) : (
                    <span className="bvq-diff--under">Budget has <strong>{formatINR(budget - quotation)}</strong> headroom over quotations</span>
                  )}
                </div>
              </div>
            )
          })()}
        </section>

        <section className="entries-block">
          <div className="entries-head">
            <h3>Investment Entries</h3>
            <button
              className="add-btn"
              type="button"
              onClick={() => {
                const next = {
                  ...appState,
                  entries: [
                    ...appState.entries,
                    {
                      id: crypto.randomUUID(),
                      supplier: SUPPLIERS[0],
                      category: SUPPLIER_CATEGORIES[SUPPLIERS[0]],
                      status: 'active' as const,
                      investedTillNow: 0,
                      quotationValue: 0,
                      fileName: '',
                      paymentHistory: [],
                      lastUpdated: new Date().toISOString().split('T')[0]
                    }
                  ]
                }
                setAndPersist(next)
              }}
            >
              + Add Vendor
            </button>
          </div>
          <div className="entries-list">
            {appState.entries.map((entry, index) => {
              const paid = computePaidStatus(entry.investedTillNow, entry.quotationValue)
              const remainingContract = Math.max(0, entry.quotationValue - entry.investedTillNow)
              return (
                <article key={entry.id} className="card entry-card">
                  <div className="entry-top">
                    <div>
                      <p className="small-label">Select Supplier</p>
                      <select
                        value={entry.supplier}
                        onChange={(event) => {
                          const newSupplier = event.target.value as SupplierName
                          updateEntry(index, (current) => ({
                            ...current,
                            supplier: newSupplier,
                            category: SUPPLIER_CATEGORIES[newSupplier]
                          }))
                        }}
                      >
                        {SUPPLIERS.map((supplier) => (
                          <option key={supplier} value={supplier}>{supplier}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <p className="small-label">Payment Amount</p>
                      <div className="amount-input-wrap compact">
                        <span className="currency">{"\u20B9"}</span>
                        <input
                          className="invested-input"
                          value={paymentAmounts[entry.id] ? Number(paymentAmounts[entry.id].replace(/\D/g, '')).toLocaleString('en-IN') : ''}
                          onChange={(event) => {
                            const digits = event.target.value.replace(/\D/g, '')
                            setPaymentAmounts((prev) => ({ ...prev, [entry.id]: digits }))
                          }}
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="small-label">Date of Payment</p>
                      <input
                        className="date-input"
                        type="date"
                        value={paymentDates[entry.id] || new Date().toISOString().split('T')[0]}
                        onChange={(event) => {
                          setPaymentDates((prev) => ({ ...prev, [entry.id]: event.target.value }))
                        }}
                      />
                    </div>

                    <div className="upload-col">
                      <label className="upload-btn">
                        Upload Receipt
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          hidden
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              setPendingReceipts((prev) => ({ ...prev, [entry.id]: file }))
                            }
                          }}
                        />
                      </label>
                      <p className="tiny file-name">{pendingReceipts[entry.id]?.name || 'No receipt selected'}</p>
                    </div>

                    <div className="save-payment-col">
                      <button
                        className="save-payment-btn"
                        type="button"
                        onClick={() => addPaymentRecord(entry.id)}
                      >
                        Save Payment
                      </button>
                      <p className="tiny">Total Invested: <strong className="golden">{formatINR(entry.investedTillNow)}</strong></p>
                    </div>

                    <div className="status-col">
                      <p className="small-label">Paid Status</p>
                      <strong className="paid-status">{paid}%</strong>
                    </div>

                    <div className="delete-col">
                      <button
                        className="delete-entry-btn"
                        type="button"
                        title="Delete this entry"
                        onClick={() => {
                          if (window.confirm(`Delete ${entry.supplier} entry? This cannot be undone.`)) {
                            const next = { ...appState, entries: appState.entries.filter((_, i) => i !== index) }
                            setAndPersist(next)
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="entry-bottom">
                    <div>
                      <p className="small-label">Quotation Value</p>
                      <div className="quotation-input-row">
                        <div className="amount-input-wrap compact quotation-manual-wrap">
                          <span className="currency">{'\u20B9'}</span>
                          <input
                            className="invested-input quotation-manual-input"
                            value={entry.quotationValue ? entry.quotationValue.toLocaleString('en-IN') : ''}
                            onChange={(event) => {
                              const next = parseCurrencyInput(event.target.value)
                              updateEntry(index, (current) => ({ ...current, quotationValue: next }))
                            }}
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter quotation"
                          />
                        </div>
                        <div className="quotation-upload-actions">
                          <label className="upload-btn quotation-upload-btn">
                            {pendingQuotations[entry.id]?.name ? 'Change Final Quotation' : 'Upload Final Quotation'}
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.webp"
                              hidden
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) {
                                  setPendingQuotations((prev) => ({ ...prev, [entry.id]: file }))
                                }
                              }}
                            />
                          </label>
                          <button
                            className="save-payment-btn"
                            type="button"
                            onClick={() => uploadFinalQuotation(entry.id)}
                            disabled={!pendingQuotations[entry.id]}
                          >
                            Save Quotation
                          </button>
                        </div>
                      </div>
                      <p className="tiny file-name">{pendingQuotations[entry.id]?.name || entry.fileName || 'No final quotation uploaded'}</p>
                    </div>
                    <div>
                      <p className="small-label">Amount Paid</p>
                      <strong>{formatINR(entry.investedTillNow)}</strong>
                    </div>
                    <div className="progress-wrap">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${paid}%` }} />
                      </div>
                      <p className="tiny">{formatINR(remainingContract)} Remaining to fulfil contract</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
          </>
        ) : (
          <>
            <div className="curation-header">
              <p className="curation-label">Curation Hub</p>
              <h1 className="curation-title">Curated Partners</h1>
            </div>

            <div className="partners-toolbar">
              <div className="partners-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Filter by material, name or category..."
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="partners-grid">
              {filteredEntries.map((entry) => {
                const remainingContract = Math.max(0, entry.quotationValue - entry.investedTillNow)
                return (
                  <article key={entry.id} className="partner-card card">
                    <div className="partner-hero">
                      <img src={SUPPLIER_IMAGES[entry.supplier]} alt={entry.supplier} className="partner-hero-img" />
                      <span className={`status-badge status-${entry.status}`}>
                        {entry.status === 'active' ? 'ACTIVE PROJECT' : 'PLANNING'}
                      </span>
                    </div>
                    <div className="partner-body">
                      <div className="partner-name-row">
                        <div>
                          <h3 className="partner-name">{entry.supplier}</h3>
                          <p className="partner-category">{entry.category.toUpperCase()}</p>
                        </div>
                        <VerifiedIcon />
                      </div>

                      <div className="partner-invested-row">
                        <span className="partner-inv-label">Invested Capital</span>
                        <span className="partner-amount">{formatINR(entry.investedTillNow)}</span>
                      </div>

                      <div className="partner-remaining-row">
                        <span className="partner-inv-label">Remaining to fulfil contract</span>
                        <span className="partner-remaining-amount">{formatINR(remainingContract)}</span>
                      </div>

                      <div className="partner-quotation-row">
                        <span className="doc-icon-wrap"><DocIcon /></span>
                        <div className="partner-quot-detail">
                          <span className="partner-quot-key">Quotation Status</span>
                          {entry.quotationValue > 0 ? (
                            <span className="quot-status-paid">
                              To be Paid: <strong>{formatINR(entry.quotationValue)}</strong>
                            </span>
                          ) : (
                            <span className="quot-status-none">No Quote Yet</span>
                          )}
                        </div>
                      </div>

                      <div className="partner-footer-row">
                        {entry.fileName ? (
                          <a
                            className="view-quotation-link"
                            href={`/quotations/${encodeURIComponent(entry.fileName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <DocIcon /> View Quotation
                          </a>
                        ) : (
                          <span className="no-quote-label">
                            <DocIcon /> No Quote Uploaded
                          </span>
                        )}
                        <span className="update-ago">UPDATE {formatRelativeDate(entry.lastUpdated)}</span>
                      </div>

                      <div className="payment-history">
                        <h4 className="ph-title">Payment History</h4>
                        {entry.paymentHistory.length > 0 ? (
                          <div className="ph-list">
                            {entry.paymentHistory.map((record) => (
                              <div key={record.id} className="ph-row">
                                <span className="ph-amount">{formatINR(record.amount)}</span>
                                <span className="ph-date-label">paid on {formatPaymentDate(record.date)}</span>
                                {record.receiptFile ? (
                                  <a
                                    className="ph-receipt-link"
                                    href={`/receipts/${encodeURIComponent(record.receiptFile)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <DocIcon /> View Receipt
                                  </a>
                                ) : (
                                  <span className="ph-no-receipt">No receipt</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="ph-empty tiny">No payments recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="partners-stats-bar">
              <div className="stats-item">
                <p className="stats-label">VERIFIED PARTNERS</p>
                <strong className="stats-val">{appState.entries.length}</strong>
              </div>
              <div className="stats-item">
                <p className="stats-label">COMMITTED CAPITAL</p>
                <strong className="stats-val">{formatINR(totals.totalInvested)}</strong>
              </div>
              <div className="stats-item">
                <p className="stats-label">PENDING QUOTES</p>
                <strong className="stats-val">{appState.entries.filter((e) => !e.quotationValue).length} Proposals Awaiting</strong>
              </div>
              <button className="stats-download-btn" type="button" aria-label="Export report">
                <DownloadIcon />
              </button>
            </div>
          </>
        )}
      </main>

      <aside className="right-rail">
        <article className="card completion-card">
          <p className="tiny">Estimated Completion</p>
          <h4>November 2026</h4>
        </article>

        <article className="card utilization-card">
          <h4>Utilization Score</h4>
          <div className="ring-wrap">
            <div className="ring" style={{ ['--percent' as string]: totals.utilization }}>
              <span>{totals.utilization}%</span>
            </div>
          </div>
          <p>You have utilized <strong>{formatINR(totals.totalInvested)}</strong><br />of your total target.</p>
        </article>

        <article className="card liquidity-card">
          <p className="tiny">Remaining Liquidity</p>
          <h4>{formatINR(totals.remaining)}</h4>
          <p className="muted">"The buffer for creative spontaneity."</p>
        </article>

        <article className="card quote-vs-card">
          <h4>Quotation vs. Invested</h4>
          <ul>
            {appState.entries.slice(0, 4).map((entry) => (
              <li key={entry.id}>
                <span>{entry.supplier}</span>
                <span>{formatINR(entry.investedTillNow)} / {formatINR(entry.quotationValue)}</span>
              </li>
            ))}
          </ul>
        </article>
      </aside>
    </div>
  )
}

export default App


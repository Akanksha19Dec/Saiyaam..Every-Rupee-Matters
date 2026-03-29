# Saiyaam — Every Rupee Matters 💰

A luxury home-renovation budget tracker built with **React + TypeScript + Vite**. Track supplier payments, upload receipts, and monitor every rupee flowing into your dream project.

## Live Demo

🌐 **https://saiyaam-web.vercel.app**

## Features

- **Financial Blueprint** — Central dashboard showing total budget, per-supplier entry cards, and payment tracking.
- **Curated Partners (Suppliers)** — Visual supplier cards with brand images, invested capital, quotation status, and full payment history.
- **Payment Tracking** — Enter payment amount, date, and attach a receipt for each transaction directly from the Blueprint screen.
- **Receipt Upload** — Upload PDF/image receipts per payment; files are saved locally (localhost only) and viewable from the Supplier tab.
- **Delete Vendor Entry** — Remove any supplier entry from the Blueprint screen with a single click (with confirmation). The Supplier tab updates automatically.
- **Quotation Value** — Manually editable quotation value per supplier with automatic paid-percentage calculation.
- **LocalStorage Persistence** — All data persists across browser sessions. Your budget data is never lost.
- **Responsive Design** — Dark-themed, enterprise-grade UI with CSS Grid layout.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Custom CSS (CSS Grid, custom properties) |
| Persistence | Browser LocalStorage |
| Receipt Storage | Vite dev server plugin (localhost) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**

### Install & Run

```bash
# Clone the repository
git clone https://github.com/Akanksha19Dec/Saiyaam..Every-Rupee-Matters.git
cd Saiyaam..Every-Rupee-Matters

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173/**

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use

1. **Set Total Budget** — Click the budget card at the top and enter your total renovation budget.
2. **Add a Supplier** — In the Financial Blueprint tab, use the supplier dropdown to select a supplier from the predefined list.
3. **Make a Payment** — Enter the payment amount, pick the date, optionally upload a receipt, and click **Save Payment**.
4. **Set Quotation Value** — Expand the entry and manually type the supplier's quotation value. The paid percentage updates automatically.
5. **View Supplier Details** — Switch to the **Suppliers** tab to see all partners as visual cards with their payment history and receipt links.
6. **Upload Receipts** — When running locally, uploaded receipts are saved to a `receipt/` folder at the project root and can be viewed from the Supplier tab.
7. **Delete a Vendor** — Click the red **×** button on any entry card in the Blueprint screen to remove it. A confirmation dialog will appear. The Supplier tab updates automatically.

## Project Structure

```
saiyaam-web/
├── public/
│   ├── brands/          # Supplier brand images (PNG + SVG)
│   └── ganapati.jpg     # Header image
├── src/
│   ├── App.tsx          # Main application (all components + logic)
│   ├── App.css          # All styles
│   ├── main.tsx         # Entry point
│   └── index.css        # Global resets
├── vite-receipt-plugin.ts  # Vite dev server plugin for receipt upload
├── vite.config.ts
└── package.json
```

## Notes

- **Receipt upload** works only on localhost (Vite dev server middleware). On Vercel, receipts cannot be saved to disk.
- All budget/payment data is stored in **localStorage** under the key `saiyaam_budget_tracker_v1`.
- To reset all data, clear localStorage in your browser DevTools.

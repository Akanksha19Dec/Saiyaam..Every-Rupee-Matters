# Saiyaam — Every Rupee Matters 💰

A luxury home-renovation budget tracker built with **React + TypeScript + Vite**. Track supplier payments, upload receipts, and monitor every rupee flowing into your dream project.

## Live Demo

🌐 **https://saiyaam-web.vercel.app**

## Features

- **Financial Blueprint** — Central dashboard showing total budget, per-supplier entry cards, and payment tracking with visual budget vs. quotation comparison.
- **Budget vs Quotation Chart** — Interactive visual comparison of your total budget against the combined quotation values across all suppliers, with headroom or overage indicators.
- **Curated Partners (Suppliers)** — Visual supplier cards with brand images, invested capital, remaining contract amount, quotation status, and full payment history.
- **Payment Tracking** — Enter payment amount, date, and attach a receipt for each transaction directly from the Blueprint screen with Indian locale number formatting.
- **Final Quotation Upload** — Upload PDF/image quotation documents per supplier with view capability; files are saved to the `Qutation/` folder in the project root.
- **Receipt Upload** — Upload PDF/image receipts per payment; files are saved locally (localhost only) and viewable from the Supplier tab.
- **Remaining to Fulfil Contract** — Automatic calculation showing the difference between quotation value and invested amount per supplier, displayed prominently in both Blueprint and Suppliers tabs.
- **Delete Vendor Entry** — Remove any supplier entry from the Blueprint screen with a single click (with confirmation). The Supplier tab updates automatically.
- **Quotation Value** — Manually editable quotation value per supplier with automatic paid-percentage calculation and formatted number display.
- **LocalStorage Persistence** — All data persists across browser sessions. Your budget data is never lost.
- **Responsive Design** — Dark-themed, enterprise-grade UI with CSS Grid layout and real-time chart updates.
- **Multiple Supplier Categories** — Includes HomezInterio, Lifeston, MaterialDepo, GardenOfJoy, Lightning, Furniture, Decorative Items, Kids Rooms Vendors, Miscellaneous, Home Registration, and Home Inauguration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Custom CSS (CSS Grid, custom properties, animations) |
| Persistence | Browser LocalStorage |
| File Storage | Vite dev server plugin (localhost); `/api/upload-quotation`, `/api/upload-receipt`, `/quotations/*`, `/receipts/*` endpoints |
| Charts & Visuals | SVG bar charts (Budget vs Quotation), progress trackers, conic-gradient utilization ring |
| Deployment | Vercel (with serverless limitations for file storage) |

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
2. **View Budget vs Quotation Chart** — In the Financial Blueprint section, a visual bar chart shows your total budget against combined supplier quotations. The chart highlights budget headroom or overage.
3. **Add a Supplier** — In the Financial Blueprint tab, use the supplier dropdown to select from 11 supplier categories including HomezInterio, Lifeston, MaterialDepo, GardenOfJoy, Lightning, Furniture, Decorative Items, Kids Rooms Vendors, Miscellaneous, Home Registration, and Home Inauguration.
4. **Make a Payment** — Enter the payment amount (displayed with Indian locale formatting), pick the date, optionally upload a receipt, and click **Save Payment**.
5. **Set Quotation Value** — Expand the entry and manually type the supplier's quotation value (formatted display). The paid percentage updates automatically.
6. **Upload Final Quotation** — Click **Upload Final Quotation** button beside the quotation value field, select a PDF/image file, and click **Save Quotation** to upload the document.
7. **Track Remaining Contract** — View the **Remaining to fulfil contract** amount in the Blueprint entry card and in the Suppliers tab for each partner.
8. **View Supplier Details** — Switch to the **Suppliers** tab to see all partners as visual cards with invested capital, remaining contract amount, and payment history.
9. **View Quotation Document** — Click the **View Quotation** link on a supplier card in the Suppliers tab to open the uploaded quotation in a new tab.
10. **Upload Receipts** — When running locally, uploaded receipts are saved to a `receipt/` folder at the project root and can be viewed from the Supplier tab.
11. **Delete a Vendor** — Click the red **×** button on any entry card in the Blueprint screen to remove it. A confirmation dialog will appear. The Supplier tab updates automatically.

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
├── Qutation/            # Quotation uploads (localhost only)
├── receipt/             # Receipt uploads (localhost only)
├── vite-receipt-plugin.ts  # Vite middleware for quotation & receipt upload/serve
├── vite.config.ts
└── package.json
```

## Notes

- **Quotation upload** and **Receipt upload** work only on localhost (Vite dev server middleware). On Vercel, these files cannot be saved to disk. Uploaded quotations are saved to the `Quation/` folder at the project root (localhost only).
- All budget/payment data is stored in **localStorage** under the key `saiyaam_budget_tracker_v1`.
- Payment amounts and quotation values display with **Indian locale number formatting** (e.g., `12,50,000` for 1,250,000).
- To reset all data, clear localStorage in your browser DevTools.
- The app ships with dummy sample data to demonstrate functionality across all supplier categories and features.

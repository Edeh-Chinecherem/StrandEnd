# StrandEnd — Fashion Studio Workflow Management System

> **“End the stranded feeling.”**  
> A web-based workflow and order tracking application for fashion designers, bespoke tailors, and couture ateliers.

Built according to the **Fashion Studio Workflow Management System PRD (v1.2, November 2026)** and the **StrandEnd Brand Guide (v1.0)**.

---

## Brand Identity & Design System

- **Palette**:
  - `Ink Indigo` (`#232A5C`): Logo, structural typography, primary buttons, header
  - `Spool Coral` (`#E2573A`): The strand-end, call-to-action highlights, urgent countdowns
  - `Chalk` (`#F7F2EA`): Background cloth texture, soft warm cards
  - `Brass` (`#C9A24B`): Badges, Atelier tier markers, loyalty indicators, 3–7 day deadlines
  - `Sage` (`#3F7D5C`): Success, delivered milestone, on-track >7 day countdowns
  - `Crimson / Overdue` (`#8B1E1E`): High-alert overdue indicators
- **Typography**:
  - **Fraunces** (Google Fonts): Display headings, numbers, wordmark
  - **DM Sans** (Google Fonts): UI, measurements, tables, mobile workshop touch points
- **Logos**:
  - Main Logo: Continuous thread ending on the Spool Coral dot (*The Strand*)
  - App Icon: Tailoring running-stitch ending in a solid coral dot (*The Stitch*)

---

## Key Features & Workflows

### 1. Studio Dashboard (10-Second Manager Overview)
- **KPI Tiles (DASH-4)**: Active orders, due within 7 days, overdue alert banner, ready for delivery, and on-time delivery rate (REP-1).
- **12-Stage Visual Kanban (DASH-1)**: Complete sequential order lifecycle from Enquiry to Final Delivery.
- **Orders Directory & Countdown Table (DASH-2, DASH-3, DASH-5)**: Sortable by delivery date, order #, price, or client. *Overdue orders appear first by default*.
- **Delivery Deadlines Calendar (DASH-7)**: Monthly delivery calendar and workshop staff capacity overview.

### 2. Complete 12-Stage Order Lifecycle (Section 3)
1. **Enquiry**: Lead captured via WhatsApp, IG, or walk-in.
2. **Consultation / Quote**: Style notes, fabrics, price quoted.
3. **Deposit Received / Confirmed** *(Milestone)*: Delivery date fixed; order active.
4. **Measurements Taken**: Bespoke body measurements recorded.
5. **Fabric & Materials**: Fabric sourced or client-supplied.
6. **Pattern & Cutting**: Pattern drafted and cut.
7. **Sewing / Production** *(Milestone)*: Garment assembly on tailoring floor.
8. **First Fitting (Optional)** *(Milestone)*: Prototype fitting and adjustments.
9. **Adjustments / Finishing**: Alterations, hand beading, pressing, studio QC.
10. **Ready for Delivery** *(Milestone)*: Complete; balance payment flagged.
11. **Delivered / Collected** *(Milestone)*: Garment collected, order closed.
12. **Cancelled / On Hold**: Reachable from any stage with recorded reason.

*Guardrails*: Production floor is blocked without confirmed deposit (configurable by owner); Delivery is locked unless balance is settled (or owner overrides).

### 3. Customer & Measurement Management (Section 4.1)
- Customer profiles with phone, WhatsApp, email, source, and VIP/Bridal tags.
- Multiple dated, named measurement sets per client (*Bust, Waist, Hips, Shoulder to Nipple, Sleeve, Trouser Inseam, Agbada Wing Span, Cap Size, etc.*).
- One-tap WhatsApp chat and phone call buttons directly from client cards and orders (CUS-6).
- Lifetime spend and full order history (CUS-5).
- CSV export of client records (CUS-8).
- Quick Enquiry lead capture in <30 seconds and 1-click convert to order (LEAD-1, LEAD-2).

### 4. Workshop Cutting Ticket & Job Sheet (ORD-8)
- Print-ready cutting ticket formatted for workshop clipboards with complete client measurements, fabric specs, design notes, and workshop sign-off checkboxes.

### 5. Subscription Pricing & 12-Month Loyalty Program (Section 9 & 17.2)
- **Starter**: ₦10,000/mo (₦110,000/yr with 1 month free)
- **Studio** (Recommended): ₦25,000/mo (₦275,000/yr with 1 month free)
- **Atelier**: ₦50,000/mo (₦550,000/yr with 1 month free)
- **Founding Designer Offer**: 10% off annual plans for life for first 50 studios.
- **Loyalty Free Month (Section 17.2)**: 12 continuous paid months earns 1 free month. Stacks with annual plans giving 13 months for the price of 11 (2 free months total!). Includes progress bar and simulation button to test progression.

### 6. Agent Referral Program [v1.2] (Section 17.1 & 17.4)
- Dedicated promoter portal: unique referral links and codes (e.g. `AML-902`).
- 21-day trial incentive (14 standard + 7 bonus days).
- Commission engine: 20% Standard / 25% Senior (10 concurrent studios) for 6 paid months; 10% on annuals.
- 30-day vesting schedule, fraud prevention, and monthly Naira bank payouts with ₦20,000 minimum threshold.

### 7. Super Admin Console & Client Live Tracker (TRK-1, ADM-1, ADM-2, ADM-3)
- Multi-tenant overview, MRR metrics, tenant isolation, and agent commission liabilities.
- Public client tracker with no login, zero internal notes, and zero pricing shown.

---

## Running the Application Locally

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the local development server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

To build for production:
```bash
npm run build
npm run preview
```


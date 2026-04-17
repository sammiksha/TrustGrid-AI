# 🚀 CivicSense TrustGrid AI v3.0 — Quick Start

## ▶ Run Immediately (No Setup Needed)

```bash
npm install
npm start
```

App opens at **http://localhost:3000**

---

## 🔐 Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👤 Citizen | `ananya@civicsense.in` | `citizen123` | Map, Report, Trust Scores |
| 🏛 Gov Admin | `admin@pmc.gov.in` | `admin123` | All pages + Admin Portal |

> **Tip:** You can also click "Switch to Admin/Citizen" in the sidebar bottom to toggle roles

---

## 🗺 Map Page
- Opens with **real Google Maps** (Pune centered)
- **Colored pins**: 🟢 On Track · 🟡 Delayed · 🔴 Critical
- **! pins**: Citizen-reported issues
- Click any pin → InfoWindow with details
- Toggle to show/hide issue markers

---

## 🤖 AI Features (Report Issue page)
1. Select a project & describe the issue
2. Click **"Run AI Analysis"**
3. AI classifies severity and issue type automatically
4. Optionally upload a photo for image classification

---

## 🏛 Admin Flow
1. Login as **Gov Admin** (`admin@pmc.gov.in` / `admin123`)
2. Go to **Gov Portal** in sidebar
3. See **all citizen reports** in real-time
4. Use **Review** / **Resolve** buttons on each card
5. Check **Fund Tracking** tab for budget utilization

---

## 🔥 Activate Firebase (optional — adds persistence)
See `FIREBASE_SETUP.md` for step-by-step guide.

Without Firebase: Everything works perfectly in memory.
With Firebase: Issues persist across devices & sessions.

---

## 📊 Charts (Analytics page)
6 Chart.js visualizations:
- Issues vs Resolved trend (Line)
- Trust Score by month (Bar)  
- Project distribution (Doughnut)
- Governance radar (Radar)
- Issues by severity (Polar Area)
- Budget by category (Horizontal Bar)

---

## 🚀 Deploy to Vercel
```bash
npm run build
npx vercel --prod
```

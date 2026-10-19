# RoomSaathi Partner · Owner & PG Management OS
> कमरा साथी पार्टनर — मकान मालिक व पीजी संचालक पोर्टल

A distinctive, production-grade Property Operating System built specifically for Indian landlords, PG operators, and student hostel owners (seeded for Samastipur, Bihar).

---

## 🌟 Key Features

1. **Live Bed & Room Inventory (1-Tap Status Switch)**:
   - Floor-by-floor visual room matrix.
   - Cycle bed availability with a single tap: `Available` (Green) ↔ `Occupied` (Blue) ↔ `Reserved` (Orange) ↔ `Maintenance`.
   - Add rooms, assign sharing types (Single, 2 Sharing, 3 Sharing, 4 Sharing), and configure base rents.

2. **Lead & Inquiry Pipeline (WhatsApp-First CRM)**:
   - Real-time renter/student inquiry pipeline.
   - **1-Click WhatsApp Chat** with pre-filled bilingual messages.
   - **Direct Call** button.
   - **Physical Room Visit Scheduler** with auto-generated Google Maps directions for WhatsApp.
   - **1-Click "Make Tenant"**: Converts a lead directly into an active tenant and assigns them to an open bed!

3. **Smart Electricity Sub-Meter Calculator (बिजली मीटर कैलकुलेटर)**:
   - Input previous reading and current meter reading.
   - Computes units consumed × rate (e.g. ₹9/unit).
   - Generates exact formatted bill breakdown for WhatsApp with UPI details.
   - Eliminates disputes between tenants and landlords over utility charges.

4. **Monthly Rent Khata (रजिस्टर & लेजर)**:
   - Tracks Paid, Pending, and Overdue rents.
   - 1-Click WhatsApp payment reminders sent to all due tenants.
   - Record payments via UPI, Cash, or Bank Transfer.
   - **Printable & Shareable Digital Rent Receipts** with official branding and transaction references.

5. **Tenants Directory & Digital Diary**:
   - Stores tenant photo, parent/emergency contact, college/workplace, Aadhaar ID verification status, and check-in date.
   - Move-out / Vacate settlement modal that calculates security deposit refunds and immediately frees up beds for new inquiries.

6. **Maintenance & Complaints Desk (शिकायत निवारण)**:
   - Track WiFi, Plumbing, Electrical, and Food issues.
   - Mark In-Progress or Resolved with resolution notes.

7. **Bilingual & Mobile PWA Ready**:
   - 1-click toggle between **English** and **हिन्दी**.
   - Mobile dock navigation for easy one-thumb control on Android smartphones.
   - Installable to phone home screen.

---

## 🚀 Getting Started

### 1. Install Dependencies & Run Locally
```bash
cd "house on rent owner side"
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Production Build
```bash
npm run build
npm run preview
```

---

## 🔗 Supabase & Google OAuth Configuration (Optional)

The application works 100% offline using persistent `localStorage`. To connect it to your live Supabase database:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Enable **Google OAuth** under *Authentication → Providers* in your Supabase dashboard.

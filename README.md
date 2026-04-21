# MCA Data Hub — Project Documentation & Roadmap

This project is a professional platform to search for Indian company data and download official MCA (Ministry of Corporate Affairs) documents (V2/V3 versions).

---

## 📂 File-Level Explanation 

### 🐍 Backend (Python / FastAPI)
*   `backend/main.py`: **The Brain of the Project.** It handles the Finanvo API connection, manages the self-healing login (auto-refresh token), verifies Razorpay payments, and manages the settings JSON.
*   `backend/settings.json`: **Data Storage.** It stores all the configuration you change in the Admin Panel (like rates, GST, and contact info).
*   `backend/.env`: **Secret Keys.** Stores sensitive info like your Finanvo API credentials and Razorpay keys.

### ⚛️ Frontend (React / TanStack)
*   `src/routes/index.tsx`: **Home Page.** The first page users see, showing services, stats, and FAQs.
*   `src/routes/checkout.$cin.tsx`: **The Billing Engine.** This is where the price is calculated dynamically. It handles the "Search to Add" logic and the Razorpay "Buy Now" flow.
*   `src/routes/admin.tsx`: **Control Panel.** This allows the owner to change the look and pricing of the site without touching any code.
*   `src/routes/orders.tsx`: **User Records.** Displays the history of all purchased documents. It generates the **Tax Invoice** and shows the **Download** links.
*   `src/routes/dashboard.tsx`: **Search Hub.** The main area where users can browse companies and see details before buying.
*   `src/components/site-chrome.tsx`: **Layout.** Contains the Header and Footer that are visible on every page.
*   `src/styles.css`: **The Design System.** Defines the colors, fonts, and animations (Directly edited for premium aesthetics).

---

## 🗺️ Project Roadmap

### Phase 1: Core System Integration
*   **Finanvo API Integration**: Successfully connected API for company search, profiles, charges, and filings.
*   **Self-Healing Authentication**: Built an automated login system. If the API token expires, the backend automatically logs in again to get a fresh token.
*   **FastAPI Backend**: A high-performance Python server that manages all data requests and security.

### Phase 2: Checkout & Payment Flow
*   **Bulk Document Selection**: Users can search and add multiple companies at once.
*   **Razorpay Integration**: Fully secure payment gateway for buying document download access.
*   **Dynamic Billing Logic**: The document rate (price) and GST percentage are fetched from the Admin Panel.

### Phase 3: Admin Control & User Dashboard
*   **Admin Dashboard**: Manage Footer text, Contact info, FAQ, and document pricing instantly.
*   **Transaction Management**: Users get version-specific links (V2 or V3) and professional **Tax Invoices**.

### Phase 4: UI/UX Excellence
*   **Full-Screen Interface**: Optimized layout for a better user data viewing experience.
*   **Premium Design**: Modern colors, smooth transitions, and a clean business look.

---

## 🛠️ Technology Stack
*   **Frontend**: React.js (Vite), TanStack Router, Tailwind CSS, Lucide Icons.
*   **Backend**: Python (FastAPI).
*   **API**: Finanvo Master Data API.
*   **Payment**: Razorpay SDK.

---

## 📋 Getting Started

1.  **Run Backend**:
    ```bash
    cd backend
    pip install -r requirements.txt
    python main.py
    ```
2.  **Run Frontend**:
    ```bash
    npm install
    npm run dev
    ```

---

## 🔮 Future Goals
*   **Automated PDF Generation**: Converting raw data directly into polished PDF reports.
*   **CSV Export**: Allowing users to export search results into CSV/Excel files.

---
*Developed for MCA Data Hub.*

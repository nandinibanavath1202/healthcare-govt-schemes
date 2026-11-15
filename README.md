# Telangana Government Schemes Chatbot & Information Portal

An accessible, AI-powered citizen guidance website designed to help the people of Telangana understand state government welfare schemes, explore eligibility rules, required documents, and follow official application procedures.

> **Citizen Advisory & Independent Portal Notice:**  
> This portal is an **independent public-service information directory**. It is **not** an official government agency and does not issue sanctions or accept applications. Final eligibility, quotas, rules, and procedures are governed strictly by the respective Government of Telangana departments. Citizens should always verify changing requirements with official department sources.

---

## 🌟 Key Features

1. **Public Home Page**
   - Welcoming, accessible interface introducing state welfare guarantees.
   - Prominent **“Ask About Schemes”** call to action.
   - Quick category pills, flagship scheme showcases, and 3-step "How It Works" guide.
   - Prominent non-governmental disclaimer and privacy assurances.

2. **Grounded AI Chatbot (`/chat`)**
   - Natural language scheme discovery grounded strictly in stored government records.
   - Scannable, structured Markdown answers:
     - **What it is**
     - **Who may qualify** (*uses responsible "may be eligible" phrasing*)
     - **Key Benefits & Financial Assistance**
     - **Required Documents**
     - **How to Apply**
     - **Important Considerations & Caveats**
     - **Official Departmental Source & Link**
   - Instant suggested prompt chips (e.g., Mahalakshmi free bus, Gruha Jyothi electricity, Rythu Bharosa, Aarogyasri health cover).
   - **Honest Fallbacks:** Questions outside the database receive transparent guidance pointing users to official state portals (`telangana.gov.in`).
   - **Privacy Shield:** Actively detects and warns against entering 12-digit Aadhaar numbers or bank details.
   - Works 100% offline using the built-in deterministic retrieval engine; optionally enhances answers via backend Gemini LLM if `GEMINI_API_KEY` is provided.

3. **Scheme Discovery & Catalog (`/schemes`)**
   - Full-text search by keyword, scheme name (English & Telugu), and summary.
   - Multi-category filtering across 7 data-driven domains.
   - Beneficiary group filtering (Women, Farmers, Students, Senior Citizens, BPL Families, PwD, Entrepreneurs).
   - Sorting by Name, Most Recently Verified, or Created Date.

4. **Interactive Scheme Matcher (`/recommendations`)**
   - Guided questionnaire matching citizen profile and welfare priority to relevant schemes.
   - Explains **“Why this may be relevant to you”** for every result.
   - Visible caveat reminding citizens that official department verification is required.

5. **Comprehensive Scheme Detail View (`/schemes/[slug]`)**
   - Full policy purpose, eligibility criteria, quantified benefits, required documentation, and step-by-step application procedures.
   - Direct clickable link to official Telangana Government department portal.
   - Last Verified Date and Freshness Indicator (flags warnings if records are older than 180 days).
   - Printable guidelines view and one-click shortcut to ask the AI Chatbot about that specific scheme.

6. **Protected Administrator CMS (`/admin`)**
   - Role-based access control protecting all administrative endpoints on the server.
   - Secure session cookie authentication using `jose` JWT and `bcryptjs` password hashing.
   - Scheme management dashboard with publication status, draft toggle, and review freshness tracking.
   - Full CRUD form with validation:
     - Enforces official source URL and verification date before publishing.
     - Allows setting review warnings and caveats.
     - Allows flagging illustrative seed entries vs official verified data.

---

## 🗂️ Data-Driven Categories

The portal is seeded with the seven core welfare sectors:
- **Women Empowerment** (e.g., Mahalakshmi Free Bus Travel, ₹2,500/mo cash aid, ₹500 LPG cylinder)
- **Healthcare** (e.g., Rajiv Aarogyasri ₹10 Lakh cashless health cover, KCR Mother & Child Kit)
- **Electricity** (e.g., Gruha Jyothi up to 200 units free domestic electricity)
- **Education** (e.g., Ambedkar Overseas Vidya Nidhi foreign study grant up to ₹20 lakh)
- **Agriculture** (e.g., Rythu Bharosa ₹15,000/acre/year crop investment support)
- **Pensions** (e.g., Cheyutha / Aasara Social Security Pension of ₹4,000 / ₹6,000 monthly)
- **Social Welfare** (e.g., Indiramma Indlu ₹5 lakh housing assistance, Kalyana Lakshmi / Shaadi Mubarak ₹1,00,116 marriage aid, T-PRIDE MSME subsidies)

*Note on Sample Data:* The `Yuva Vikasam` scheme is explicitly marked as `isSampleOnly: true` (illustrative sample) to differentiate pending operational guidelines from officially notified flagship programs.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions & Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (accessible public-service aesthetic with emerald & slate tones)
- **Database:** SQLite (default for zero-friction local setup) or PostgreSQL via Prisma ORM
- **Authentication:** `jose` (JWT HTTP-only session cookies) + `bcryptjs` (salt 12 password hashing)
- **Validation:** Zod v3
- **Icons:** Lucide React
- **LLM Integration:** Optional backend Google Gemini 1.5 Flash (backend-only, strict retrieval grounding)

---

## 🚀 Quickstart Local Setup

### 1. Prerequisites
- Node.js 18.x or 20.x LTS
- npm or pnpm

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="telangana-schemes-dev-secret-key-change-in-production-min32chars"
GEMINI_API_KEY="" # Optional: Leave blank to use built-in deterministic grounding engine
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30
```

### 3. Initialize & Seed Database
Run Prisma migrations and populate the verified Telangana government schemes:
```bash
npm run db:push
npm run db:seed
```
This seeds:
- 7 core welfare categories
- 11 verified Telangana government schemes
- Default administrator account:
  - **Email:** `admin@telangana.gov.example`
  - **Password:** `AdminSecure2026!`

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 Running the Verification Test Suite

A standalone test suite is provided to verify database content, semantic intent retrieval, sensitive data protection, rate limiting, and administrator authentication:

```bash
node scripts/verify-app.js
```
Expected output:
```
====================================================
Results: 31 Passed, 0 Failed
====================================================
```

---

## 🐘 Optional PostgreSQL Setup (Docker Compose)

To run with PostgreSQL instead of SQLite:
1. Start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```
2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/telangana_schemes?schema=public"
   ```
3. Update `provider = "postgresql"` in `prisma/schema.prisma`.
4. Run `npm run db:push && npm run db:seed`.

---

## 🔒 Security & Privacy Practices

- **Zero Sensitive Data Storage:** The public chatbot does not prompt for or save Aadhaar numbers, ration card identifiers, bank accounts, or passwords.
- **Client IP Rate Limiting:** Built-in sliding-window rate limiter (30 requests/minute) protects chat and auth endpoints against automated abuse.
- **Server-Side Role Protection:** Administrative actions (`POST /api/schemes`, `PUT /api/schemes/[id]`, `DELETE /api/schemes/[id]`) strictly verify admin session tokens and reject unauthorized requests with HTTP 401/403.
- **Safe Secrets Handling:** No API keys or secrets are ever bundled into client code.
- **Grounding Guarantee:** The chatbot engine answers strictly using verified database records, preventing fabricated eligibility criteria or deadlines.

---

## 🏛️ Official Telangana Government References

- **State Portal:** [telangana.gov.in](https://telangana.gov.in)
- **Praja Palana Services:** [prajapalana.telangana.gov.in](https://prajapalana.telangana.gov.in)
- **Rajiv Aarogyasri Trust:** [aarogyasri.telangana.gov.in](https://aarogyasri.telangana.gov.in)
- **CCLA Dharani Land Records:** [ccla.telangana.gov.in](https://ccla.telangana.gov.in)
- **Telangana ePASS Scholarships:** [telanganaepass.cgg.gov.in](https://telanganaepass.cgg.gov.in)
- **TSRTC Official Portal:** [tsrtc.telangana.gov.in](https://tsrtc.telangana.gov.in)
- **TGSPDCL Electricity Distribution:** [tgspdcl.com](https://tgspdcl.com)

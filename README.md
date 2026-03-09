# 🐾 Aurelia — Pet Adoption Website

A premium pet adoption homepage built with **React + Tailwind CSS + MySQL**, designed by applying established **web design theory** principles from [techhelp.ca/web-design-theory](https://techhelp.ca/web-design-theory/).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS v3, Framer Motion, React Icons |
| **Backend** | Node.js, Express, MySQL (mysql2) |
| **Database** | MySQL with JSON columns |
| **Fonts** | Google Fonts — Playfair Display + Inter |

---

## Web Design Theories Applied

### 1. Visual Hierarchy — *Guide the Eye*

Visual hierarchy controls the order in which users perceive information by manipulating **size, color, contrast, and positioning**.

**How we applied it:**
- The hero headline uses `clamp(2.8rem, 6vw, 5rem)` — the largest element on the page — immediately telling users what matters most
- Gradient-highlighted accent text draws the eye to the emotional core of the message
- A clear content flow guides users: **Hero → Featured Pets → How It Works → Testimonials → CTA → Footer**
- Section labels use uppercase, small font, and tinted pill backgrounds as wayfinding markers

---

### 2. Gestalt Principles — *The Psychology of Perception*

Gestalt laws explain how humans perceive visual elements as **unified wholes** rather than isolated parts.

| Gestalt Principle | Where It Appears |
|---|---|
| **Proximity** | Pet card content grouped tightly; generous spacing separates cards |
| **Similarity** | All pet cards share the same `rounded-2xl`, shadow, and tag style |
| **Common Region** | Cards, testimonials, and CTA banner live inside distinct bordered containers |
| **Continuity** | "How It Works" uses a horizontal connecting line guiding left-to-right |
| **Figure–Ground** | Hero gradient background + glassmorphism floating cards create depth |
| **Symmetry & Order** | Pet grid and testimonials use balanced CSS Grid layouts |
| **Common Fate** | Framer Motion staggered animations make related items animate together |

---

### 3. Hick's Law — *Simplify the Choices*

> *The more choices you offer, the harder it is for someone to decide.*

- Navbar has only **4 links** plus one CTA — minimal decision overhead
- Each section has a **single primary call-to-action**
- Hero uses just **two buttons** — one primary, one secondary

---

### 4. Fitts's Law — *Make Interactions Easy*

> *Larger, closer targets are faster and easier to interact with.*

- All buttons use generous padding (`px-8 py-3` minimum) and `rounded-full` for large tap targets
- "Adopt Now" CTA appears in navbar (always visible) and is repeated in the CTA section
- Pet card hover overlays reveal a large centered "Meet [Name]" button

---

### 5. White Space — *Let Content Breathe*

- Sections use `py-24` (~6rem) padding, giving each area room to breathe
- Pet card grid uses `gap-8`, card bodies have `p-5` — preventing clutter
- Hero subtitle capped at `max-w-[500px]`, creating natural negative space
- Emulates the premium feel of brands like Apple and Google

---

### 6. Responsive Design — *Mobile-First*

- **Fluid typography** via `clamp()` — text scales smoothly across all viewports
- **CSS Grid with responsive columns** — cards reflow from 3-col → 1-col naturally
- Navbar collapses into a **slide-out mobile menu** at `max-md`
- Hero switches from 2-column to single-column stacked layout on smaller screens
- `min-h-dvh` ensures correct mobile viewport handling

---

### 7. Accessibility — *Inclusive by Design (WCAG 2.2 AA)*

| Requirement | Implementation |
|---|---|
| **Contrast ≥ 4.5:1** | Dark text (`#2D2219`) on cream background (`#FFFDF7`) |
| **Alt text** | Every pet image has descriptive alt text |
| **Semantic HTML** | `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>` throughout |
| **Focus-visible** | Custom gold ring outline on all interactive elements |
| **ARIA labels** | Nav toggle, social links, form inputs, decorative elements all labelled |
| **Keyboard support** | All interactive elements reachable via tab |

---

### 8. Color & Typography — *Evoke Emotion*

> *Colors evoke emotions; typography sets tone.*

**Colour palette:**
- **Warm amber/gold** (`primary-500: #FFC107`) — warmth, optimism, and care
- **Deep brown** (`accent-500: #795548`) — trust and earthiness
- **Soft cream** (`warm-bg: #FFFDF7`) — inviting, not clinical

**Typography:**
- **Playfair Display** (headings) — elegant serif conveying warmth and trust
- **Inter** (body) — modern, highly legible sans-serif optimised for screens

---

### 9. Aesthetic Appeal — *First Impressions Matter*

- **Animated hero** using Framer Motion (fade-in + scale) creates an immediate "wow"
- **Floating glassmorphism cards** in the hero add depth and visual interest
- **Micro-animations** everywhere: hover lifts, glow shadows, image zoom, link underlines, pulsing hearts
- **Gradient overlays** on pet cards reveal action buttons on hover
- Dark gradient CTA section with subtle paw watermarks for drama

---

### 10. Minimalism — *Intentional Simplicity*

> *Strip away distractions so essential elements shine.*

- Only **6 pet cards** — enough for variety without overwhelming
- No sidebar, secondary navigation, or ads — just the core adoption journey
- Footer organized into **4 clean columns** with minimal links
- Tight colour palette — two hue families (amber + brown) plus neutrals

---

### 11. Visual Balance — *Harmony Through Layout*

- Hero uses an **asymmetric layout** (text left, image right) — dynamic and modern
- Pet cards and testimonials use **symmetric grids** for stability
- CTA section is **centred** with equal padding for visual calm
- Stats use even spacing with dividers for rhythm and balance

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL running locally

### 1. Setup Database

Edit `server/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aurelia
```

Then seed the database:
```bash
cd server
npm install
npm run seed
```

### 2. Start Backend
```bash
cd server
npm start
```
API runs at `http://localhost:5000/api/pets`

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`

---

## Project Structure

```
Aurelia/
├── server/
│   ├── .env            # MySQL credentials
│   ├── db.js           # Connection pool
│   ├── index.js        # Express API
│   ├── schema.sql      # Table definitions
│   └── seed.js         # Sample data
├── client/
│   ├── public/pets/    # Pet images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── FeaturedPets.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── CallToAction.jsx
│   │   │   └── Footer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Reference

📖 [Web Design Theory: Principles Behind Stunning Websites — TechHelp.ca](https://techhelp.ca/web-design-theory/)

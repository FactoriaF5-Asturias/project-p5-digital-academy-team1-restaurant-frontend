# GitSushi Restaurant — Frontend

GitSushi is a team project developed as part of the Factoría F5 bootcamp. Its objective is to create a restaurant application using a decoupled architecture for the frontend and backend.

This repository contains the **frontend**: a Single Page Application built with **Vue 3 + Vite** that consumes the GitSushi REST API.

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/) [![Vite](https://img.shields.io/badge/build-Vite%208-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Pinia](https://img.shields.io/badge/state-Pinia-FFD859?logo=pinia&logoColor=black)](https://pinia.vuejs.org/) [![Tailwind CSS](https://img.shields.io/badge/styles-Tailwind%20CSS%204-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

## 🗂️ Project Structure

The application is divided into two separate repositories:

- **Frontend repository (this repo):** [GitSushi Restaurant Frontend](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend)
- **Backend repository:** [GitSushi Restaurant Backend](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-backend)

## 🧰 Tech Stack

| Area | Technology |
|---|---|
| Framework | **Vue 3.5** (Composition API, `<script setup>`) |
| Build tool | **Vite 8** |
| Routing | **Vue Router 5** (lazy-loaded views, role-based guards) |
| State management | **Pinia 4** |
| HTTP client | **Axios 1** (cookie-based session, XSRF protection, automatic token refresh) |
| Styling | **Tailwind CSS 4** + design tokens (`@theme`) + **BEM** for custom classes |
| Icons & fonts | Material Symbols, Inter, JetBrains Mono (Google Fonts) |
| Testing | **Vitest 5** + **Vue Test Utils** + **jsdom**, coverage with **v8** |
| CI | **GitHub Actions** (tests + coverage on every Pull Request) |
| Project management | **Jira** (Scrum, 2 sprints) |

## 🚀 Quick Start

> Full step-by-step guide (local HTTPS certificates, environment variables, troubleshooting) in the [Getting Started](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Getting-Started) wiki page.

```bash
# 1. Clone the repository
git clone https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend.git
cd project-p5-digital-academy-team1-restaurant-frontend

# 2. Install dependencies
npm install

# 3. Create your environment file from the template
cp .env.example .env
# and set: VITE_API_BASE_URL=https://localhost:8443

# 4. Start the development server
npm run dev
```

The application runs on `https://localhost:5173` (HTTPS requires local certificates created with **mkcert** — see [Getting Started](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Getting-Started)).

> ⚠️ The backend must be running before starting the frontend. See the [backend repository](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-backend) for its setup.

## ✨ Features

> 🚧 = interface built, waiting for its backend endpoint. Details in [Known Limitations & Roadmap](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Known-Limitations-&-Roadmap).

### 👥 Customers
* **Menu (Carta):** Paginated product catalog loaded from the API (60 products), with image, description, price and availability.
* **Shopping Cart:** Selected products are added to a temporary cart where users can add, remove or change the quantity of each item. The cart **persists after a page reload**.
* **Quantity Selection:** When selecting a product, the customer can add more than one unit.
* **Order Channel:** Customers choose between **dine-in** (on-site tablets) and **home delivery** (requires a registered account — guests are redirected to login).
* **Automatic Table Detection:** On-site tablets detect their assigned table automatically, with manual input as a fallback.
* **On-Site Payment:** Pay at the cashier counter or by card at the table.
* **Online Payment:** Registered customers can choose online card payment or cash on delivery.
* **Notes for the Chef:** Free-text field plus quick suggestion chips (e.g. *"Sin wasabi"*).
* **Order Confirmation:** Order summary (subtotal, discounts, VAT, total), loading and error feedback, and the resulting payment status.
* **Order Ticket:** After confirming, *Mi pedido* shows the ticket of the last order.
* **Accounts:** Registration, login and logout, with automatic session renewal.
* **Exclusive Offers:** Registered customers see their exclusive offers, which are applied automatically in the cart and marked as used when ordering.
* **Profile Details:** Profile form with `First Name`, `Last Name`, `Address`, `Postal Code`, `City` and `Email`, with field validation. 🚧 *Saving changes.*
* **Voice Input:** Profile fields can be filled by voice dictation (Web Speech API), with a live audio level indicator.
* **Order History:** Registered customers can browse their previous orders and repeat one with a single click. 🚧 *Real endpoint.*
* **Password Recovery:** Forgot / reset password forms. 🚧 *Backend connection.*

### 🍳 Kitchen
* **Kitchen Dashboard:** List of active orders and kitchen metrics.
* **Status Updates:** Kitchen staff can update the order status to:
  - [x] `In Progress`
  - [x] `Delayed`
  - [x] `Ready`

### 🛵 Delivery Drivers
* **Delivery Dashboard:** Mobile-first summary with orders ready for pickup, in transit, delivered today and average delivery time, refreshed automatically every 10 seconds.
* **Status Tracking:** Drivers can mark orders as:
  - [ ] `In Transit` 🚧
  - [ ] `Delivered` 🚧

### 💼 Administration
* **Admin Dashboard:** Home with one card per administrative section.
* **Product Management:** Create, edit, activate / deactivate (out of stock) products, with category filters and form validation.
* **Invoicing:** Searchable table of paid orders.
* **Sales Analytics:** Daily, monthly, quarterly and annual totals. 🚧
* **Sales Reports:** Download the sales summary in **PDF format**. 🚧

### 🔐 Access by Role
Every route declares the roles allowed to enter it (`GUEST`, `CUSTOMER`, `COOK`, `DELIVERY`, `ADMIN`). Guests are redirected to login, users without permission to an *Access Denied* page, and unknown URLs back to a safe view.

> **Scope note:** Due to time constraints, the team postponed real-time order tracking, live driver location, contacting the customer during delivery, the route viewer, and the ES/EN language switcher.

## 🎨 UX/UI Design

- **Prototype first:** Every view (menu, cart, checkout, login/registration, customer profile, and the kitchen, driver and admin dashboards) was designed as a mockup before development.
- **Design system:** A single source of truth for colors, typography, spacing and radius, exposed as Tailwind utilities through `@theme` (see [Design System & UI](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Design-System-&-UI)).
- **Corporate identity:** *"Developer Gastronomy"* — a sushi restaurant with programming references (`Hello Edamame`, `Ctrl Takoyaki`...), coral primary color, `Inter` + `JetBrains Mono` typography.
- **Responsive:** Mobile-first layouts, with a dedicated mobile navigation menu.
- **Accessible:** Semantic HTML, labeled and validated forms, ARIA live regions for feedback, keyboard-friendly dialogs and menus.

## 📊 Project Planning and Management

This project is developed using **Agile methodologies** to ensure efficient delivery and high code quality across our decoupled repositories.

### 🔄 Agile Implementation
* **Product Backlog:** A clear, well-defined, and strictly prioritized backlog covering all system requirements (Customers, Kitchen, Drivers, Admin, and System Automation), split into **backend (`GSB`)** and **frontend (`GSF`)** technical stories.
* **Sprint Organization:** Development is divided into two sprints:
  - **Sprint 1:** Complete dine-in order flow (menu → cart → payment → kitchen), header, footer and test coverage setup.
  - **Sprint 2:** Accounts and profile, home delivery, delivery drivers, administration and finishing.
  - **Jira** is used for sprint planning, user stories, task distribution, and progress tracking.

## 🛠️ Frontend Best Practices
- **Component-Based Architecture:** Small, reusable and self-contained Vue Single File Components.
- **Separation of Concerns:** `views` compose `components`; shared state and business rules live in **Pinia stores**; async logic in **composables**; HTTP calls isolated in **services**; formatting and validation in **utils**.
- **Centralized HTTP Client:** A single Axios instance with credentials, XSRF headers and an interceptor that **renews the session on `401`** and queues the pending requests.
- **Asynchronous Handling:** Every API call exposes loading, error and empty states to give clear feedback to the user.
- **Form Validation:** Client-side validation with accessible error messages (`aria-invalid`, focus on the first invalid field).
- **Role-Based Routing:** Route guards based on `meta.roles`, with lazy-loaded views.
- **Secure Session Handling:** Authentication through `httpOnly` cookies — no tokens stored in JavaScript.
- **No Magic Numbers:** Business values (VAT rate, roles, payment methods, categories, labels) centralized in `src/constants/`.
- **Modular Styling:** Tailwind utilities on top of shared design tokens, and **BEM** naming for custom classes (`cart-summary__line`).
- **Testing:** Unit and component tests next to each file, with a **70% coverage threshold** enforced by Vitest and GitHub Actions.

## 🌿 Gitflow & Version Control
- **Proper Git Usage:** Strict adherence to clean version control practices.
- **Fork-Based Workflow:** Each developer works on a personal fork and syncs with the team repository (`upstream`).
- **Pull Requests:** Every change reaches `dev` through a reviewed Pull Request (`fork:dev` → `upstream:dev`), automatically tested by GitHub Actions.
- **Atomic & Descriptive Commits:** One commit per task/file, following **Conventional Commits** (`feat:`, `fix:`, `test:`, `chore:`...).
- **Standardized Branches:** `feat/`, `fix/` and `chore/` prefixes with descriptive English names (e.g. `feat/cart-management`).
- **Protected Branches:** `dev` for integration, `main` for the final release.

## 📖 Project Documentation

Detailed project specifications, architectural decisions, and technical guides can be found in the Wiki:

* **[Getting Started](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Getting-Started):** Requirements, local HTTPS, installation, environment variables, dependencies and running the project locally.
* **[Agile Management & User Stories](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Project-Management-&-User-Stories):** Scrum workflow, sprints, team roles, Jira tracking, and frontend user stories.
* **[Analysis and Diagrams](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Analysis-and-Diagrams):** Roles and routes, user flows, order lifecycle and prototype screens.
* **[Architecture](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Architecture):** Layered structure (views, components, stores, composables, services) and folder organization.
* **[Design System & UI](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Design-System-&-UI):** Design tokens, typography, Tailwind configuration and naming conventions.
* **[Accessibility & Responsive](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Accessibility-&-Responsive):** Accessibility techniques and responsive breakpoints.
* **[Security & Authentication](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Security-&-Authentication):** Cookie-based session, token refresh, XSRF protection and role-based route guards.
* **[API Integration](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/API-Integration):** Endpoints consumed by each service and data mappings.
* **[Testing](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Testing):** Running tests, coverage, CI and testing conventions.
* **[Git Workflow](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend/wiki/Git-Workflow):** Step-by-step fork, branch, commit and Pull Request process.



<h2 align="center">👩‍💻 Frontend Development Team</h2>

<table align="center">
  <tr>
    <th>Developer</th>
    <th>GitHub profile</th>
  </tr>
  <tr>
    <td>Nieves Durán</td>
    <td><a href="https://github.com/duran-ni">@duran-ni</a></td>
  </tr>
  <tr>
    <td>Luisa Cortés</td>
    <td><a href="https://github.com/lcortes89">@lcortes89</a></td>
  </tr>
  <tr>
    <td>Andrea Pérez</td>
    <td><a href="https://github.com/andreaperezgon">@andreaperezgon</a></td>
  </tr>
</table>

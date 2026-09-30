# 💸 Milky Bills

> **Personal Finance, Simplified.**

Milky Bills is a modern personal finance management application designed to help people organize, understand, and take control of their financial lives.

The platform brings everyday financial management into a single experience, allowing users to manage their accounts, credit cards, income, expenses, recurring transactions, categories, and financial organization.

Milky Bills is being developed as part of a broader ecosystem of products focused on creating simple, connected, and intelligent digital experiences.

---

## ✨ Overview

Milky Bills brings together the essential tools for personal financial management:

* 💳 **Credit Cards** — Register and manage all your cards in one place.
* 💰 **Income** — Track salaries, freelance payments, and other sources of income.
* 💸 **Expenses** — Record and organize everyday spending.
* 🔄 **Recurring Transactions** — Identify expenses and income that repeat over time.
* 🏷️ **Categories** — Organize transactions using default or custom categories.
* 📊 **Financial Overview** — Understand your financial activity through a clear dashboard.
* 🔐 **Authentication** — Secure access to your personal financial environment.
* 🔗 **Open Finance** — Planned integration for automatically connected financial data.

The goal is to make financial management **clear, practical, and easy to understand**, without overwhelming the user with unnecessary complexity.

---

## 🎯 Product Vision

Milky Bills is being built around a simple idea:

> **Your financial life should be easy to understand.**

Instead of treating financial management as a collection of disconnected spreadsheets, bank applications, and manual processes, Milky Bills aims to create a centralized financial experience.

The platform is designed to evolve from manual financial organization into a more connected ecosystem through future integrations such as **Open Finance**, intelligent insights, and automated financial workflows.

---

## 🛠️ Tech Stack

### Frontend

| Technology               | Purpose                       |
| ------------------------ | ----------------------------- |
| ⚛️ **React**             | User interface development    |
| 📘 **TypeScript**        | Type-safe development         |
| ⚡ **Vite**               | Development and build tooling |
| 🎨 **Tailwind CSS**      | Utility-first styling         |
| 💅 **styled-components** | Component-based styling       |

### Backend

| Technology                  | Purpose                         |
| --------------------------- | ------------------------------- |
| 🟢 **Node.js**              | JavaScript runtime              |
| 🏗️ **NestJS**              | Backend application framework   |
| 📘 **TypeScript**           | Type-safe backend development   |
| 🌐 **REST API**             | Client-server communication     |
| 📚 **Swagger / OpenAPI**    | API documentation               |
| 🔐 **Authentication**       | Identity and access management  |
| 🧩 **Modular Architecture** | Domain and feature organization |
| ✅ **Validation**            | Request and data validation     |

### Database & Data

| Technology                 | Purpose                                |
| -------------------------- | -------------------------------------- |
| 🐘 **PostgreSQL**          | Primary relational database            |
| 🔷 **Prisma**              | Database ORM and type-safe data access |
| 📊 **Database Migrations** | Schema evolution and versioning        |

### Infrastructure & Engineering

* ☁️ Cloud-ready architecture
* 🐳 Docker
* 🔄 CI/CD
* 🧩 Modular architecture
* ♻️ Reusable components
* 📱 Responsive design
* ♿ Accessibility-oriented development
* 🔐 Security-oriented development
* 🧪 Automated testing
* 📊 Observability
* 🚀 Performance-focused development
* 📦 Maintainable and scalable codebase

---

## 🏗️ Architecture

Milky Bills is being developed as a full-stack application with a clear separation between the frontend, backend, persistence, and infrastructure layers.

```text
┌──────────────────────────────────────────────┐
│                 Milky Bills                  │
├──────────────────────────────────────────────┤
│                                              │
│  Frontend                                    │
│  React + TypeScript + Vite                   │
│                                              │
│                 ↓ HTTP / REST                │
│                                              │
│  Backend                                     │
│  NestJS + TypeScript                         │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Modules                                │  │
│  │                                        │  │
│  │ Authentication                         │  │
│  │ Users                                  │  │
│  │ Accounts                               │  │
│  │ Credit Cards                           │  │
│  │ Transactions                            │  │
│  │ Categories                              │  │
│  │ Financial Dashboard                     │  │
│  └────────────────────────────────────────┘  │
│                       ↓                      │
│  Persistence                                │
│  Prisma + PostgreSQL                        │
│                                              │
└──────────────────────────────────────────────┘
```

The backend is designed around **modularity, separation of concerns, domain boundaries, and maintainability**, allowing new financial capabilities to be introduced without unnecessarily coupling unrelated parts of the system.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* **Node.js**
* **npm**
* **Git**
* **Docker** — required for local infrastructure and database services

### Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repository>.git
```

Navigate to the project:

```bash
cd <your-repository>
```

---

## 🎨 Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the local URL provided by Vite.

---

## ⚙️ Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run start:dev
```

The API will be available at the configured backend URL.

API documentation will be available through **Swagger / OpenAPI** when enabled in the development environment.

---

## 🗄️ Database

Milky Bills uses **PostgreSQL** as its primary relational database.

The development environment can run PostgreSQL through Docker.

```bash
docker compose up -d
```

Database schema management is handled through Prisma.

Typical development commands include:

```bash
npx prisma generate
```

and:

```bash
npx prisma migrate dev
```

---

## 📜 Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
npm run start:dev
npm run build
npm run start
npm run lint
npm run test
```

---

## 💳 Core Features

### Authentication

Users can securely access their personal financial environment through authentication.

The authentication flow is designed to support the future expansion of the Milky Bills ecosystem.

### Credit Cards

Users can register the credit cards they currently use and keep their card information organized in one place.

Future versions may expand this functionality through financial institution integrations.

### Income & Expenses

Users can record:

```text
Income
  ├── Salary
  ├── Freelance
  ├── Investments
  └── Other

Expenses
  ├── Housing
  ├── Food
  ├── Transportation
  ├── Entertainment
  └── Custom Categories
```

### Recurring Transactions

Transactions can be identified as recurring, allowing the application to represent predictable financial activity over time.

### Custom Categories

Users can create their own categories to better reflect their personal financial organization.

### Financial Dashboard

The dashboard provides a centralized view of the user's financial activity, creating a foundation for future financial insights and analytics.

---

## 🔮 Roadmap

Milky Bills is designed to evolve continuously.

### Phase 1 — Foundation

* [x] Project setup
* [x] React + TypeScript + Vite
* [x] NestJS + TypeScript
* [] PostgreSQL + Prisma
* [ ] Authentication
* [ ] Sign In
* [ ] Sign Up
* [ ] Dashboard foundation
* [ ] Financial entities
* [ ] Credit card management
* [ ] Income management
* [ ] Expense management
* [ ] Categories
* [ ] Recurring transactions

### Phase 2 — Financial Intelligence

* [ ] Advanced financial dashboard
* [ ] Spending analysis
* [ ] Financial summaries
* [ ] Monthly comparisons
* [ ] Improved financial insights
* [ ] Notifications and reminders

### Phase 3 — Connected Finance

* [ ] Open Finance integration
* [ ] Automatic transaction synchronization
* [ ] Connected financial institutions
* [ ] Automatic categorization
* [ ] Financial data aggregation

### Phase 4 — Ecosystem

* [ ] Integration with other ecosystem products
* [ ] Shared identity
* [ ] Cross-product experiences
* [ ] Unified account management

The roadmap may evolve as the product and its users evolve.

---

## 🧭 Engineering Principles

Milky Bills is developed with a focus on:

> **Simplicity over unnecessary complexity.**

> **Clarity over cleverness.**

> **User experience over feature overload.**

> **Consistency over isolated solutions.**

> **Security and privacy by design.**

> **Good engineering over simply making things work.**

The goal is to build a codebase that is **predictable, maintainable, scalable, and easy to evolve**.

---

## 🔐 Privacy & Security

Financial applications require particular attention to security and privacy.

Milky Bills is being designed with these principles in mind:

* Secure authentication
* Protected user data
* Principle of least privilege
* Input validation
* Secure API communication
* Separation of concerns
* Privacy-oriented data handling
* Secure credential management
* Controlled access to financial data

Security requirements will evolve as the application introduces additional financial integrations and Open Finance capabilities.

---

## 📈 Continuous Development

Milky Bills is an evolving product.

New features, improvements, experiments, and architectural decisions will be introduced continuously as the platform grows.

```text
Understand → Build → Measure → Improve → Scale
```

---

## 🌐 Ecosystem

Milky Bills is part of a broader ecosystem designed around connected digital products.

The ecosystem aims to provide specialized experiences while maintaining a consistent foundation for:

* 🔐 Identity
* 👤 User accounts
* 🧩 Shared services
* 🔗 Integrations
* 📊 Data
* 🚀 Product experiences

Milky Bills represents the **financial management** component of this ecosystem.

---

## 📄 License

This project is currently intended for product development and experimentation.

Unless otherwise specified, the source code and original content are **© Milky Bills**.

---

<p align="center">
  Built with 🥛, TypeScript, React, NestJS and a continuous desire to build better products.
</p>

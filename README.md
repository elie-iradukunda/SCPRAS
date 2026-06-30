# SCPRAS

Smart Construction Progress, Workforce & Resource Intelligence Platform.

## Stack

- Frontend: React, Vite, Tailwind CSS v3, React Router, Recharts, Lucide icons
- Backend: Node.js, Express, Sequelize, MySQL
- Decision support: deterministic variance analysis with clearly labelled AI-assisted recommendations

## Project Structure

```text
SCPRAS/
  client/      React frontend
  server/      Express API with Sequelize/MySQL
  docs/        Product and architecture notes
```

## Run Locally

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## Ready-to-Use Demo Login

- Email: `admin@scpras.rw`
- Password: `admin123`

Additional role demonstrations use the same academic role model documented in the dissertation:

- Project Manager: `manager@scpras.rw` / `manager123` in demo mode
- Site Engineer: `engineer@scpras.rw` / `engineer123` in demo mode
- Quantity Surveyor: `qs@scpras.rw` / `qs123456`
- Store Officer: `store@scpras.rw` / `store123`
- Contractor / Foreman: `foreman@scpras.rw` / `foreman123`

On startup, the backend creates missing MySQL tables and seeds demo construction data when the database is empty. If MySQL is unavailable and `DEMO_MODE=true`, API routes fall back to in-memory demo data so the app can still be demonstrated.

## Working MVP Features

- Six-role JWT authentication and server-side authorization
- Role-specific dashboards and navigation (only assigned modules are displayed)
- Approved project baselines, phases, BOQ resources, assignments and documents
- Site progress, planned-versus-actual variance and constraint reporting
- Worker registration, QR smart cards and attendance check-in/check-out
- Material baseline, receipt, issue, usage and stock-variance control
- Explainable decision-support insights and workforce forecasts
- Role-filtered JSON/CSV report exports
- Administrator user, role, device and security management

## Verification

```bash
npm run lint --workspace client
npm run build
npm run test:rbac --workspace server
npm run test:workflows --workspace server
```

The automated checks cover 24 authorization assertions and 15 CRUD operations across seven core workflows.

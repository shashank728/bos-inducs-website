# Bos Inducs Pharmaceuticals — MERN catalogue website

A responsive React + Vite frontend and Express + MongoDB backend for a company profile, product catalogue and enquiries. The frontend includes a local fallback catalogue so the site can be previewed before MongoDB is configured.

## Requirements
- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas connection string (needed to persist enquiries and manage products)

## Run locally

1. Open a terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `server/.env` from `server/.env.example` and set `MONGODB_URI`.
4. Start both frontend and backend:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173

The API runs on http://localhost:5000. `GET /api/health` checks API/database status.

## Configure before publishing

- Set `VITE_WHATSAPP_NUMBER` in `client/.env` to the company's WhatsApp number in international format, digits only (example format: `91XXXXXXXXXX`). Without it, product enquiry links go to the contact form.
- Replace `CONTACT_EMAIL_HERE` in `client/src/App.jsx` with the verified company email. This is only used as a fallback if the API cannot save an enquiry.
- Confirm the exact legal company name, address, phone, email, leadership details and approved company description.
- Replace the abstract product artwork with approved product packshots and verify product names, descriptions, categories and any claims with the company.
- Add an admin-authenticated product management area before allowing catalogue edits in production. This starter intentionally does not expose public write access to products.
- Configure HTTPS, production CORS, database backups, spam protection/rate limiting and a privacy notice before launch.

## API
- `GET /api/products` — active catalogue products.
- `POST /api/enquiries` — stores an enquiry in MongoDB. Required JSON: `{ "name": "...", "email": "...", "phone": "...", "message": "..." }`.
- `GET /api/health` — API/database status.

## Accuracy note
This starter only includes product names and broad categories supplied for the project. It does not invent dosage, indications, ingredients, regulatory approvals, manufacturing claims, certifications or medical advice. Have the company approve all public product information before launch.

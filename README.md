# Temple Management System

A web-based Temple Management System designed to digitize and simplify temple administration, registration processes, and daily management activities.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint

### Backend
- Node.js
- Express.js
- TypeScript
- JSON Web Token (JWT)
- Bcrypt
- PostgreSQL
- `pg` - PostgreSQL client for Node.js

## Project Structure

```text
Temple-Management-System/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Prerequisites

Ensure the following software is installed:

- [Node.js](https://nodejs.org/)
- npm
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Quick-Institute/Temple-Management-System.git
```

```bash
cd Temple-Management-System
```

### 2. Set Up the Frontend

Open a terminal in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server typically runs at:

`http://localhost:5173`

### 3. Set Up the PostgreSQL Database

Start PostgreSQL and create a database named `temple_management` using pgAdmin or the PostgreSQL command line.

Example SQL:

```sql
CREATE DATABASE temple_management;
```

### 4. Set Up the Backend

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/temple_management
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
```

Generate `JWT String:`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password and configure a secure JWT secret.

**Security:** Never commit your `.env` file or expose database credentials and JWT secrets in frontend code.

### 5. Start the Backend

From the `backend` directory, run:

```bash
npm run dev
```

The backend should start at:

`http://localhost:5000`

### 6. Verify the API

Open the following endpoints in your browser:

- API root: `http://localhost:5000/`
- Health check: `http://localhost:5000/api/health`

The health-check endpoint verifies the API and PostgreSQL connection.

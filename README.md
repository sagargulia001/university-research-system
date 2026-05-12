# University Research Portal

A full-stack web application designed for academic institutions to manage, publish, and access research papers. The portal features a secure, role-based dashboard for Faculty and Admins, alongside a public directory for browsing published research.

---

## 🧪 Try It Out (Demo Access)
If you want to explore the different dashboards, you can log in using the following mock credentials (password depends on your local seed configuration):

* **Faculty:** `faculty@university.edu`
* **Head of Department (HOD):** `hod@university.edu`
* **Dean:** `dean@university.edu`
* **Vice Chancellor (VC):** `vc@university.edu`
* **Password for all:** `password`

---

## 🚀 Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, VC, Dean, HOD, and Faculty members.
* **Secure Authentication:** Custom JWT-based login system utilizing `bcryptjs` for secure password hashing.
* **Modern UI/UX:** Responsive, desktop-optimized interface featuring Glassmorphism design principles, built with Tailwind CSS.
* **Dynamic Data Management:** Full CRUD operations for research papers and user management, powered by Prisma ORM.
* **Automated Seeding:** Built-in database seeding script for instant mock data generation (users, departments, and papers).

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database:** PostgreSQL (hosted via [Supabase](https://supabase.com/))
* **ORM:** [Prisma](https://www.prisma.io/)
* **Authentication:** `jsonwebtoken` & `bcryptjs`
* **Deployment:** [Vercel](https://vercel.com/)

## 💻 Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* Git

### 2. Installation
Clone the repository and install the required dependencies:

```bash
git clone <your-repo-url>
cd university-research-system
npm install
```

### 3. Environment Variables
Create a .env file in the root directory and add the following variables.
# Database connection string (Local or Supabase)
DATABASE_URL="postgresql://user:password@host:port/database"

# Secret key for JWT token generation
JWT_SECRET="your-super-secret-key-here"

### 4. Database Setup & Seeding
Generate the Prisma Client and sync your database schema:

```Bash
npx prisma generate
npx prisma db push
Populate the database with the initial Admin account and mock research data:
```

```Bash
npx prisma db seed
```

### 5. Run the Development Server
Start the Next.js development server:

```Bash
npm run dev
```

Navigate to http://localhost:3000 in your browser to view the application.

🌍 Production Deployment (Vercel)
This project is configured for seamless deployment on Vercel.

Push your code to a GitHub repository.

Import the project into Vercel.

Add your DATABASE_URL and JWT_SECRET in the Vercel Environment Variables settings.

The custom build script (prisma generate && prisma migrate deploy && next build) will automatically handle database migrations before building the Next.js frontend.

Click Deploy.

# 🎓 University Research Portal

> A full-stack web application designed for academic institutions to manage, publish, and access research papers. The portal features a secure, role-based dashboard for Faculty and Admins, alongside a public directory for browsing published research.

---

## 🔗 Live Demo & Access

**Website:** [https://your-project-name.vercel.app](https://your-project-name.vercel.app)

To explore the different dashboards and experience the role-based access control firsthand, use the following mock credentials:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Faculty** | faculty@university.edu | password |
| **Head of Dept (HOD)** | hod@university.edu | password |
| **Dean** | dean@university.edu | password |
| **Vice Chancellor (VC)** | vc@university.edu | password |

---

## 🚀 Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, VC, Dean, HOD, and Faculty members.
* **Secure Authentication:** Custom JWT-based login system utilizing bcryptjs for secure password hashing.
* **Modern UI/UX:** Desktop-optimized interface featuring Glassmorphism design principles, built with Tailwind CSS.
* **Dynamic Data Management:** Full CRUD operations for research papers and user management, powered by Prisma ORM.
* **Automated Seeding:** Built-in database seeding script for instant mock data generation.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **Database:** PostgreSQL (hosted via Supabase)
* **ORM:** Prisma
* **Authentication:** jsonwebtoken & bcryptjs
* **Deployment:** Vercel

---

## 💻 Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* Node.js (v18 or higher recommended)
* Git

### 2. Installation
Clone the repository and install the required dependencies:

```Bash
git clone <your-repo-url>
cd university-research-system
npm install
```

### 3. Environment Variables
Create a .env file in the root directory. This file is required for the application to connect to the database and handle authentication. **Crucial:** Never commit this file to GitHub.

# Database connection string (e.g., from Supabase)
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

# Secret key for JWT token generation
```
JWT_SECRET="your-super-secret-key-here"
```

### 4. Database Setup & Seeding
Generate the Prisma Client and sync your database schema:

```
npx prisma generate
npx prisma db push
```

Populate the database with the initial Admin account and mock research data:

```
npx prisma db seed
```

### 5. Run the Development Server
Start the Next.js development server:

```
npm run dev
```

Navigate to http://localhost:3000 in your browser to view the application.

---

## 🌍 Production Deployment (Vercel)

This project is configured for seamless deployment on Vercel. 

1. **GitHub:** Push your code to a GitHub repository.
2. **Vercel Import:** Import the project into Vercel.
3. **Environment Variables:** Add your DATABASE_URL and JWT_SECRET in the Vercel **Project Settings > Environment Variables**.
4. **Automatic Build Instructions:** Vercel is configured to use the custom build script in package.json: 

```
"build": "prisma generate && prisma migrate deploy && next build"
```

This ensures that the Prisma client is generated and migrations are applied to your live database before the frontend build starts.

5. **Finalize:** Click **Deploy**.

## 📄 License

This project was built for educational and portfolio purposes.

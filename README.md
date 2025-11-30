
This is a full-stack meal planner application built with Next.js, Prisma, and Tailwind CSS. It provides an interface for employees to book meals and an admin dashboard to manage all entries.

## Features

- **Employee View**: Book weekly meals with a user-friendly form.
- **Admin View**: Manage all entries, add new entries manually, and download reports.
- **Database Persistence**: Uses Prisma and a MySQL database to store all meal entries.
- **API Routes**: Next.js API routes for all database operations.
- **Real-time UI**: SWR for efficient client-side data fetching and UI updates.
- **Excel Export**: Admins can download daily or all-time meal reports as styled XLSX files.

## Prerequisites

- Node.js (v18 or later)
- A running MySQL database instance

## Getting Started

1.  **Clone the repository and install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up your environment variables:**

    Create a file named `.env` in the root of your project and add your database connection string.

    ```env
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```

    For example:
    `DATABASE_URL="mysql://root:root@localhost:3306/user_meals"`

3.  **Run the database migration:**

    This will create the necessary tables in your database based on the Prisma schema.

    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

-   `npm run dev`: Starts the application in development mode.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Runs the linter.
-   `npx prisma migrate dev`: Creates and applies a new database migration.
-   `npx prisma generate`: Generates the Prisma Client.
-   `npx prisma studio`: Opens the Prisma Studio to view and edit your data.

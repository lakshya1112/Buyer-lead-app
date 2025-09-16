# Mini Buyer Lead Intake App

This is a full-stack web application built to capture, list, manage, and export buyer leads. The project was created as a technical assignment to demonstrate skills in modern web development practices, including Next.js, TypeScript, database management with Prisma, and secure authentication.

---

## ✨ Features

-   **🔐 Authentication**: Secure demo login system using `next-auth@4`. All pages are protected.
-   **✅ Full CRUD Functionality**: Create, Read, Update, and Delete (soft delete via 'Dropped' status) buyer leads.
-   **⚡ Server-Side Rendering**: The main leads list is server-rendered for fast initial page loads.
-   **🔍 Search & Filtering**: URL-synced, debounced search (by name, email, phone) and filtering (by city, status).
-   **📄 Pagination**: Efficient server-side pagination for handling large datasets.
-   **🔒 Ownership & Security**: Users can only edit or delete their own leads.
-   **⏱️ Concurrency Control**: Prevents users from overwriting each other's edits with a stale-data check.
-   **📜 Change History**: The last 5 changes for each lead are displayed on the edit page.
-   **🔄 Import & Export**:
    -   Export the current filtered list of leads to a CSV file.
    -   Import leads from a CSV file with per-row validation and error reporting.
-   **🛡️ Rate Limiting**: Server Actions for creating and updating leads are rate-limited to prevent abuse.
-   **🧪 Unit Testing**: Includes a unit test suite set up with Vitest.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
-   **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
-   **Validation**: [Zod](https://zod.dev/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/)
-   **Form Management**: [React Hook Form](https://react-hook-form.com/)
-   **Testing**: [Vitest](https://vitest.dev/)
-   **Rate Limiting**: [Upstash Redis](https://upstash.com/)

---

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/)
-   A free [Supabase](https://supabase.com/) account for the PostgreSQL database.
-   A free [Upstash](https://upstash.com/) account for Redis rate limiting.

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/buyer-lead-app.git](https://github.com/your-username/buyer-lead-app.git)
cd buyer-lead-app
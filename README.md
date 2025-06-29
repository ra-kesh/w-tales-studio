# W-Tales Studio

W-Tales Studio is a comprehensive, all-in-one solution for managing your studio. From bookings and clients to shoots and payments, this application provides a centralized platform to streamline your entire workflow.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Database:** [Supabase](https://supabase.io/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Supabase Auth](https://supabase.io/docs/guides/auth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Linting & Formatting:** [Biome](https://biomejs.dev/), [ESLint](https://eslint.org/)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [pnpm](https://pnpm.io/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/w-tales-studio.git
    cd w-tales-studio
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following environment variables:

    ```env
    DATABASE_URL="your-supabase-database-url"
    ```

    You can get the `DATABASE_URL` from your Supabase project settings. The `OPEN_AI_API_KEY` is required for Supabase AI features in the Studio. The `NEXT_PUBLIC_PUBLISHABLE_KEY` is a placeholder for any public keys your application might need.

## Database Setup

This project uses Supabase for the database and Drizzle ORM for interacting with it.

1.  **Start Supabase locally:**

    ```bash
    supabase start
    ```

2.  **Apply database schema:**

    Instead of running migrations directly, you can push the schema to your local Supabase instance:

    ```bash
    supabase db push
    ```

    This command will synchronize the database schema with your local Supabase database.

3.  **Making schema changes:**

    When you make changes to the database schema in `src/lib/db/schema.ts`, you'll need to generate a new migration file. To do this, run the following command:

    ```bash
    pnpm drizzle-kit generate
    ```

    This will create a new migration file in the `supabase/migrations` directory. You can then apply the migration using the `pnpm drizzle-kit migrate` command.

## Authentication

This project uses [better-auth](https://better-auth.dev/) for authentication, a flexible and powerful authentication library for modern web applications.

### Environment Variables

Make sure you have the following authentication-related environment variables in your `.env.local` file:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: These are required for Google OAuth. You can obtain them from the [Google API Console](https://console.developers.google.com/).
- `BETTER_AUTH_EMAIL`: The email address to use for sending verification and password reset emails.
- `BETTER_AUTH_URL`: The base URL of your application.

### How it Works

The authentication setup is defined in `src/lib/auth/index.ts`. It uses the Drizzle adapter to connect to the database and `resend` for sending emails. The configuration includes support for email/password authentication and Google OAuth.

- **Email/Password:** Users can sign up and sign in with their email and password. Password reset functionality is also implemented.
- **Google OAuth:** Users can sign in with their Google account.
- **Organizations:** The application supports multi-tenancy through organizations. Users can create and be invited to organizations.
- **Email Templates:** The email templates for invitations and password resets are located in `src/lib/email/`.


## Running the Application

To run the application in development mode, use the following command:

```bash
pnpm dev
```

This will start the development server at `http://localhost:3000`.

## Deployment

To deploy the application, you can use a platform like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

1.  **Push your code to a Git repository.**
2.  **Connect your repository to your chosen deployment platform.**
3.  **Configure the environment variables on your deployment platform.**
4.  **Trigger a deployment.**

The build command is `pnpm build` and the start command is `pnpm start`.
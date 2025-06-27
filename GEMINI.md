This file is for Gemini to maintain notes on the project.

## Project Overview

This appears to be a Next.js application for managing a studio. It uses Supabase for the backend and database.

### Key Technologies:

*   **Framework:** Next.js
*   **Database:** Supabase
*   **Authentication:** Supabase Auth
*   **Styling:** Tailwind CSS
*   **Linting/Formatting:** Biome, ESLint

### Core Features:

*   Bookings
*   Clients
*   Crews
*   Shoots
*   Tasks
*   Payments
*   Expenses
*   Deliverables

## Strategy for Adding New Configuration Types

Since the `config_type` enum already contains all necessary types, the strategy for adding new configuration types will focus on replicating the existing API and frontend patterns.

1.  **Create API Endpoints:**
    *   Create a new route handler in `app/api/configurations/` for the new type (e.g., `app/api/configurations/new_type/route.ts`). This will handle creation.
    *   Create a corresponding dynamic route for updates and deletions (e.g., `app/api/configurations/new_type/[id]/route.ts`).
    *   **Completed:** API for `booking_types` has been implemented.
    *   **Completed:** API for `deliverable_status` has been implemented.
    *   **Completed:** API for `task_status` has been implemented.
    *   **Completed:** API for `task_priority` has been implemented.
2.  **Update Frontend:**
    *   Add a new page in `app/(dashboard)/configurations/` to display and manage the new configuration type (e.g., `app/(dashboard)/configurations/new_type/page.tsx`).
    *   Create a new form schema in `app/(dashboard)/configurations/_components/` (e.g., `new_type-form-schema.ts`).
    *   Create new "create" and "edit" sheet components in `app/(dashboard)/configurations/_components/`.
    *   Update `hooks/use-configs.ts` to include functions for creating and updating the new configuration type.
    *   Add a link to the new configuration page in `app/(dashboard)/configurations/layout.tsx`.
    *   **Completed:** Frontend for `booking_types` has been implemented, including:
        *   `src/app/(dashboard)/configurations/_components/booking-type-form-schema.ts`
        *   `src/app/(dashboard)/configurations/_components/booking-type-form.tsx`
        *   `src/app/(dashboard)/configurations/_components/booking-type-create-sheet.tsx`
        *   `src/app/(dashboard)/configurations/_components/booking-type-edit-sheet.tsx`
        *   `src/app/(dashboard)/configurations/_components/booking-types-table.tsx`
        *   `src/app/(dashboard)/configurations/_components/booking-types-table-columns.tsx`
        *   `src/app/(dashboard)/configurations/_components/booking-types-table-toolbar.tsx`
        *   `src/app/(dashboard)/configurations/_components/booking-types-table-pagination.tsx`
        *   `src/app/(dashboard)/configurations/booking-types/page.tsx`
        *   `src/app/(dashboard)/configurations/booking-types/booking-types.tsx`
        *   `src/hooks/use-booking-types-params.ts`
        *   `src/hooks/use-configs.ts` (updated with booking type queries and mutations)
        *   `src/app/(dashboard)/global-sheet.tsx` (updated to include booking type sheets)
        *   `src/app/(dashboard)/configurations/layout.tsx` (updated with link to booking types page)
    *   **Completed:** `src/app/(dashboard)/configurations/_components/deliverable-status-form-schema.ts` has been created.
    *   **Completed:** `src/hooks/use-configs.ts` has been updated with deliverable status queries and mutations.
    *   **Completed:** `src/app/(dashboard)/configurations/_components/task-status-form-schema.ts` has been created.
    *   **Completed:** `src/hooks/use-configs.ts` has been updated with task status queries and mutations.
    *   **Completed:** `src/app/(dashboard)/configurations/_components/task-priority-form-schema.ts` has been created.
    *   **Completed:** `src/hooks/use-configs.ts` has been updated with task priority queries and mutations.
    *   **Completed:** Frontend forms and sheets for `deliverable_status` have been implemented, including:
        *   `src/app/(dashboard)/configurations/_components/deliverable-status-form.tsx`
        *   `src/app/(dashboard)/configurations/_components/deliverable-status-create-sheet.tsx`
        *   `src/app/(dashboard)/configurations/_components/deliverable-status-edit-sheet.tsx`
        *   `src/hooks/use-deliverable-status-params.ts`
        *   `src/app/(dashboard)/configurations/_components/open-deliverable-status-sheet.tsx`
    *   **Completed:** Frontend forms and sheets for `task_status` have been implemented, including:
        *   `src/app/(dashboard)/configurations/_components/task-status-form.tsx`
        *   `src/app/(dashboard)/configurations/_components/task-status-create-sheet.tsx`
        *   `src/app/(dashboard)/configurations/_components/task-status-edit-sheet.tsx`
        *   `src/hooks/use-task-status-params.ts`
        *   `src/app/(dashboard)/configurations/_components/open-task-status-sheet.tsx`
    *   **Completed:** Frontend forms and sheets for `task_priority` have been implemented, including:
        *   `src/app/(dashboard)/configurations/_components/task-priority-form.tsx`
        *   `src/app/(dashboard)/configurations/_components/task-priority-create-sheet.tsx`
        *   `src/app/(dashboard)/configurations/_components/task-priority-edit-sheet.tsx`
        *   `src/hooks/use-task-priority-params.ts`
        *   `src/app/(dashboard)/configurations/_components/open-task-priority-sheet.tsx`
    *   **Completed:** `src/app/(dashboard)/global-sheet.tsx` has been updated to include `DeliverableStatusCreateSheet`, `DeliverableStatusEditSheet`, `TaskStatusCreateSheet`, `TaskStatusEditSheet`, `TaskPriorityCreateSheet`, and `TaskPriorityEditSheet`.

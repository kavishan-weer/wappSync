# Design System

Read `AGENTS.md` before starting.

We are adding the design system and UI premitive components.

## UI Libraries

Install the required UI libraries:

- shadcn
- lucide-react

Add these shadcn components:

- Button
- Card
- Input
- Label
- Layout
- Modal
- Navbar
- Sidebar
- Tab
- Toast
- Typography
- Avatar
- Badge
- Chat
- ScrollArea

Do not modify the generated `components/ui*` files after installation

Create `lib/utils.ts` with reusable `cn()` helper for merging Tailwind classes.

Ensure all components match the exixting light theme in `app/globals.css`

### Check well done

- All the components import without errors
- `c()` works properly
- No default dark styling appears

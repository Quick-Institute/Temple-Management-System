# Authentication Pages - Simple Note

## Authentication screen files

Everything that makes up the **sign-in, sign-up, and password-reset** area of the Temple Management System frontend,
along with the shared layouts and legal pages used by these screens.

**Current status:** Frontend demo only. Authentication forms do not communicate with a backend, create accounts, or send
emails.

## Route map

| Path                    | Screen                                                  | File                                      |
|-------------------------|---------------------------------------------------------|-------------------------------------------|
| `/auth/login`           | Sign in                                                 | `src/pages/auth/auth.login.tsx`           |
| `/auth/register`        | Create account with three role tabs                     | `src/pages/auth/auth.register.tsx`        |
| `/auth/forgot-password` | Reset-link request and confirmation                     | `src/pages/auth/auth.forgot-password.tsx` |
| `/terms`                | Terms and Conditions                                    | `src/pages/legal/legal.terms.tsx`         |
| `/privacy`              | Privacy Policy                                          | `src/pages/legal/legal.privacy.tsx`       |
| `/auth/google`          | Google sign-in placeholder; redirects to `/dashboard`   | -                                         |
| `/auth/facebook`        | Facebook sign-in placeholder; redirects to `/dashboard` | -                                         |
| `/dashboard`            | Temple dashboard                                        | `src/pages/temple/temple.dashboard.tsx`   |
| `/`                     | Redirects to `/auth/login`                              | `src/routes/AppRoutes.tsx`                |
| Any other URL           | Redirects to `/dashboard`                               | `src/routes/AppRoutes.tsx`                |

> **Note:** The catch-all route currently redirects unknown URLs to the dashboard rather than a 404 page or the login
> screen. This should be reviewed when real authentication and route guards are implemented.

## Main files and their purposes

| File                                      | Purpose                                                                                                                                                                 |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `public/images/temple-bg.jpg`             | Original temple and lotus-pond background image. It is retained but is no longer used by `AuthShell`.                                                                   |
| `public/images/temple-bg-480.jpg`         | Small responsive background image.                                                                                                                                      |
| `public/images/temple-bg-768.jpg`         | Medium responsive background image.                                                                                                                                     |
| `public/images/temple-bg-1024.jpg`        | Large responsive background image.                                                                                                                                      |
| `public/images/temple-bg-1253.jpg`        | Full-size responsive background image.                                                                                                                                  |
| `src/layouts/AuthShell.tsx`               | Shared authentication layout: background image and overlay, desktop/mobile branding, headline, capability icons, and form area. Supports `login` and `signup` variants. |
| `src/pages/auth/auth.login.tsx`           | Login screen with email/password fields, password visibility toggle, Remember Me, Forgot Password, Sign In, Google, Facebook, and Create New Account controls.          |
| `src/pages/auth/auth.register.tsx`        | Registration screen with three account types, role-specific fields, custom dropdowns, validation, and terms/privacy consent.                                            |
| `src/pages/auth/auth.forgot-password.tsx` | Two-step password-reset request and confirmation screen, including masked email and resend countdown.                                                                   |
| `src/layouts/LegalShell.tsx`              | Shared layout for legal pages, including lotus header, Terms/Privacy navigation, last-updated chip, table of contents, and section list.                                |
| `src/pages/legal/legal.terms.tsx`         | Terms and Conditions content linked from the registration consent line.                                                                                                 |
| `src/pages/legal/legal.privacy.tsx`       | Privacy Policy content linked from the registration consent line.                                                                                                       |
| `src/components/AuthIcons.tsx`            | Shared `TempleMark` and gold `LotusMark` icons used across authentication and legal screens.                                                                            |
| `src/context/AuthContext.tsx`             | Stores the sign-in loading state and exposes `signIn(credentials)`. It does not yet store a user, token, or session.                                                    |
| `src/services/authService.tsx`            | Temporary authentication service. `login()` currently uses a 650 ms delay instead of making a backend request.                                                          |
| `src/routes/authRoutes.ts`                | Reusable authentication route paths, such as `/auth/login`.                                                                                                             |
| `src/routes/AppRoutes.tsx`                | Connects URLs to page components using React Router and defines redirects.                                                                                              |
| `src/App.tsx`                             | Loads the routes inside `ScreenErrorBoundary`, which shows a reload card if rendering fails.                                                                            |
| `src/main.tsx`                            | Starts React and wraps the app with `BrowserRouter` and `AuthProvider`.                                                                                                 |
| `src/index.css`                           | Tailwind CSS entry, design tokens, shared component classes, Petrona font definitions, and authentication colour palette.                                               |
| `src/assets/fonts/petrona-latin.woff2`    | Self-hosted Petrona font; avoids a font CDN request.                                                                                                                    |
| `index.html`                              | Sets the page title to `Temple Management System`.                                                                                                                      |
| `src/layouts/AppShell.tsx`                | Main in-app shell for the dashboard, including sidebar, top bar, and notifications.                                                                                     |
| `src/components/Calendar.tsx`             | `DanaCalendar` month-grid component used by the dashboard.                                                                                                              |
| `src/data/demo.ts`                        | Demo temple, user, Dana-day, donation, and notification data. The demo date is pinned to `2026-10-26`.                                                                  |

## Current screen features

### 1. Login screen - `/auth/login`

- Uses the shared `AuthShell` layout and temple background image.
- Displays the **Welcome Back** heading and gold lotus logo inside a cream login card.
- Includes Email Address and Password fields.
- Password visibility can be toggled using the eye button.
- Includes a Remember Me checkbox and Forgot Password link.
- Sign In displays `Signing In...` and is disabled while the authentication loading state is active.
- Provides Continue with Google and Continue with Facebook controls.
- On screens narrower than 450 px, social sign-in controls become compact icon-only buttons.
- Includes an OR divider and a Create New Account link to `/auth/register`.
- On submit, calls `signIn({ identifier, password, remember })` and navigates to `/dashboard`.
- Failed sign-in currently has no visible error message.

### 2. Registration screen - `/auth/register`

The registration page provides three account types:

| Account type     | Purpose                                             | Additional fields                                                 |
|------------------|-----------------------------------------------------|-------------------------------------------------------------------|
| Temple Admin     | Registers a temple and becomes its Main Admin.      | Designation                                                       |
| Committee Member | Joins a temple that has already registered.         | Temple Name, Temple Code, Committee Name, Designation             |
| Family User      | Books Dana and follows temple news with the family. | Temple Name, Temple Code, Address, Village, District, Postal Code |

All account types share First Name, Last Name, Email Address, Phone Number, Password, and Confirm Password fields.

Other registration features:

- Temple Admin designations: Chief Incumbent Monk, Authorized Religious Representative, Designated Technical
  Administrator.
- Committee options: Dayaka Sabhawa, Event or Programme Committee, Other.
- Committee designations: President, Vice-President, Secretary, Assistant Secretary, Treasurer, Committee Member, Other.
- District dropdown contains all 25 Sri Lankan districts.
- Selecting **Other** displays a field to specify another value.
- The custom dropdown supports keyboard navigation, closes on outside press or Escape, and can open upward when there is
  insufficient space below.
- Validation checks required fields, email format, password length, matching passwords, role-specific fields, and
  terms/privacy consent.
- Field errors appear below the relevant input and clear when the value changes. Changing role tabs clears existing
  errors.
- Submitting the form waits 700 ms and navigates to `/auth/login`. No account is actually created.

### 3. Forgot-password screen - `/auth/forgot-password`

- Step 1 asks for an Email Address and validates that it is present and correctly formatted.
- The input is refocused after an invalid submission.
- Send reset link displays a loading state during a 700 ms demo delay.
- Step 2 displays **Check your inbox** and a masked email address, such as `so***@temple.lk`.
- The confirmation explains that a reset link would be single-use and expire after 30 minutes.
- Includes guidance about using and protecting the reset link and contacting a Temple Admin or Co-Administrator if inbox
  access is lost.
- Send the link again uses a local 30-second countdown.
- Use a different address resets the flow and refocuses the email field.
- Includes Back to sign in and Create an account links.
- No email is sent; the confirmation is frontend-only.

### 4. Terms and Privacy pages

- The Terms and Conditions page is available at `/terms`.
- The Privacy Policy page is available at `/privacy`.
- Both use `LegalShell` and share the lotus header and legal-page navigation.
- The pages are linked from the registration form's consent line.

## Shared design and responsive behaviour

- `AuthShell` places the background photo in a **viewport-fixed layer**, so the image framing remains consistent when
  registration forms change height.
- Responsive image selection uses the 480, 768, 1024, and 1253 px background variants.
- The background includes a dark overlay and green gradient.
- `index.css` contains the main application palette and an `.auth-scope` override for the sage/gold authentication
  palette. Keep authentication and legal content within the relevant scope to preserve the intended colours.
- Main responsive breakpoints are `1023px`, `640px`, and `450px`.
- Shared CSS classes include `.card`, `.btn`, `.btn-primary`, `.btn-gold`, `.btn-outline`, `.btn-ghost`, `.btn-sm`,
  badge variants, `.tbl`, `.table-wrap`, `.side-link`, `.info-note`, `.eyebrow`, `.mono`, and `.progress-track`.

## Current limitations / work remaining

- `authService.login()` is a 650 ms timer; it does not call the backend or return a real authentication session.
- `AuthContext` tracks the sign-in loading state only. User details, token/session management, authentication status,
  and sign-out are not implemented.
- There are no route guards. The dashboard can be opened directly, and unknown URLs redirect to it.
- Registration does not create an account or send data to a server.
- Forgot password does not send an email. A page for choosing a new password has not been implemented.
- Google and Facebook controls are placeholders that redirect to `/dashboard`; social authentication is not connected.
- Login does not currently display a visible error when sign-in fails.

## Recent additions compared with the original login-only note

The original `Login-Files.md` covered only the login screen. The combined authentication-pages implementation also
includes:

- Registration with Temple Admin, Committee Member, and Family User roles.
- A custom dropdown component and client-side validation.
- A two-step forgot-password flow with masked email and resend cooldown.
- Terms and Conditions and Privacy Policy pages with a shared `LegalShell`.
- Dashboard shell, calendar component, demo data, and temple dashboard page.
- Shared `TempleMark` and `LotusMark` icons.
- Responsive, viewport-fixed authentication background images.
- Shared styling tokens and component classes, plus an application error boundary.
- Updated HTML page title and the `lucide-react` dependency.

**Build status noted in the project documentation:** `tsc -b && vite build` passes with no TypeScript errors.

<br>

<h5 style="text-align: center">
    Note By - Chamindu Gayanuka
</h5>
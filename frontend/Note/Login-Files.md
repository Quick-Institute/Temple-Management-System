# Login Files - Simple Note

## Login screen files

| File | Purpose |
| --- | --- |
| `public/images/temple-bg.jpg` | Temple and lotus-pond background image used by the login shell. |
| `src/layouts/AuthShell.tsx` | Shared login layout: responsive background, desktop/mobile branding, title, tagline, capability icons, and the form area. |
| `src/pages/auth/auth.login.tsx` | Main login page UI: email/password fields, password visibility toggle, Remember Me, Sign In, Google, Facebook, and Create Account controls. |
| `src/context/AuthContext.tsx` | Stores the sign-in loading state and exposes the `signIn` action to the login page. |
| `src/services/authService.tsx` | Temporary frontend authentication service. Replace its placeholder login logic with the real backend API request. |
| `src/routes/authRoutes.ts` | Stores reusable authentication URL paths such as `/auth/login`. |
| `src/routes/AppRoutes.tsx` | Connects URL routes to their page components using React Router. |
| `src/index.css` | Tailwind CSS setup plus shared Petrona and Arial font definitions. |
| `src/App.tsx` | Loads the application routes. |
| `src/main.tsx` | Starts React and wraps the app with `BrowserRouter` and `AuthProvider`. |

## Current login design features

- Temple background image from `public/images/temple-bg.jpg`
- Desktop title: **Temple Management** / **System**
- Mobile title is split into three lines for better small-screen readability
- Responsive login card and touch-friendly mobile fields
- Google and Facebook controls become compact icon-only buttons on small phones
- Password show/hide control and Remember Me checkbox
- Login, forgot-password, registration, dashboard, and social-auth route paths

<br>
<h5 style="text-align: center">
    Note By - Chamindu Gayanuka
</h5>
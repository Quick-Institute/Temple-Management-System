# Login credentials

Demo accounts for the Temple Management System. Every account lands on its own dashboard, and the
side menu shows only the rows that role is allowed to open.

Sign in at **`/auth/login`**.

## Accounts

| Role                     | Email                         | Password         | Lands on                 |
|--------------------------|-------------------------------|------------------|--------------------------|
| Family / Community User  | `family@temple.lk`            | `family@2026`    | `/dashboard`             |
| Temple Admin             | `templeadmin@temple.lk`       | `temple@2026`    | `/dashboard`             |
| Co-Administrator         | `coadmin@temple.lk`           | `coadmin@2026`   | `/co-admin/dashboard`    |
| Committee Representative | `committee@temple.lk`         | `committee@2026` | `/co-admin/dashboard`    |
| Religious Representative | `monk@temple.lk`              | `monk@2026`      | `/co-admin/dashboard`    |
| Super Administrator      | `superadmin@quicksolution.lk` | `super@2026`     | `/super-admin/dashboard` |

## Copy and paste

```
family@temple.lk        family@2026
templeadmin@temple.lk   temple@2026
coadmin@temple.lk       coadmin@2026
committee@temple.lk     committee@2026
monk@temple.lk          monk@2026
superadmin@quicksolution.lk   super@2026
```

## Notes

- The email is not case-sensitive, and the part before `@` also works as a sign-in name:
  `family` with `family@2026` signs in as the family user.
- Passwords are exactly as shown, including the `@` and the year.
- The sign-in card no longer lists these accounts - this file is the single reference.
- The accounts are defined in `frontend/src/data/demoUsers.ts`. Changing a password there changes
  it everywhere, because there is no backend yet.
- Sessions are remembered per browser: "Remember me" stores the user in `localStorage`, otherwise
  `sessionStorage`. Sign out clears both and returns to `/auth/login`.
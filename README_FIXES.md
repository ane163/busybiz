# BusyBiz – corrected build

This version fixes the authentication flow that was producing the `401 Invalid token` and `/api/auth/login 500` errors seen in the console.

## Important: install dependencies cleanly

Do **not** reuse an old `node_modules` folder from the previous project.

### Backend
```powershell
cd backend
npm install
npm run dev
```

### Frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. You can override it with `VITE_API_URL`.

## Authentication fixes included

- Login now validates input before sending the request.
- Email is normalized to lowercase on login and registration.
- JWT configuration is checked before issuing tokens.
- Password verification errors no longer become misleading server crashes.
- Password hashes are never returned to the browser.
- Login returns a clean `401` for incorrect credentials.
- Registration rolls back the user if creation of the trial subscription fails.
- The Axios client removes stale/invalid tokens after a protected request receives `401` and returns the user to `/login`.
- API URL can be configured with `VITE_API_URL`.
- Login page now has built-in professional black/gold styling.

## If an existing browser still has an old token

The new API interceptor clears an invalid token automatically. If necessary, log out or clear the BusyBiz site's local storage once and log in again.

# BusyBiz administrator access

## Admin panel
Open:

`http://localhost:5173/admin`

(Use your deployed frontend URL + `/admin` after deployment.)

## Initial administrator credentials

- Username / email: `admin@busybiz.co.zw`
- Password: `BusyBizAdmin@2026!`

The backend provisions this account from `backend/.env` when the server starts. The public registration endpoint cannot create an administrator account.

## Changing the credentials

1. Sign in with the administrator account.
2. Open `/admin`.
3. Select **Security**.
4. Enter the current password.
5. Change the admin email and/or password.
6. Save. BusyBiz signs you out so you can sign in again with the new credentials.

You can also change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` for first-time provisioning. Existing administrator credentials are not overwritten on every restart.

## Public vs account access

The landing page remains public at `/`. Visitors can view the BusyBiz public display without an account. Login and registration remain available, while the existing business/account pages continue to require authentication.

## Admin controls included

- Platform overview: users, businesses, products, orders, invoices, expenses and subscriptions.
- Gross sales, expenses and subscription value summaries.
- User search and account suspension/reactivation.
- User role management.
- Business/customer account overview.
- Subscription plan/status management.
- Administrator email/password management.

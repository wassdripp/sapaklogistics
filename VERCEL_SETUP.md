# Staff login on Vercel

The password check now runs in `api/admin-auth.js`, not in public JavaScript. The requested password was converted to a salted scrypt hash in the ignored `.env.local` file. The plaintext password is not in source or test files.

## Activate

1. In the Vercel project, open Settings > Environment Variables.
2. Copy `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` from the local `.env.local` file into private Vercel variables. Do not use a public/client prefix. Select Production and any Preview environments where staff login is needed. Never commit `.env.local`.
3. Deploy this commit after adding the variables. Keep the framework preset as Other; Node functions in `api/` are discovered automatically. Do not restrict deployment output to a static directory that excludes the API.
4. Visit `/portal.html#admin`, sign in, reload to verify the session persists, then sign out.

Unconfigured deployments deny staff login. Sessions last four hours, use HttpOnly, Secure cookies on Vercel, and become invalid when either private setting changes. Logout clears the browser cookie. Login throttling is per function instance; use a Vercel Firewall rate limit on POST `/api/admin-auth` for distributed protection.

## Scope

This change only moves password verification and session checks to the server. Existing Firebase shipment reads/writes are unchanged. This does not add backend authorization to shipment operations or fix the database's access rules. It must not be described as securing the whole admin system.

## Check locally

`node --test tests/admin-auth.test.js`

A plain static server cannot run the API. To run the complete site locally, use Vercel's local development server with the private environment variables loaded.

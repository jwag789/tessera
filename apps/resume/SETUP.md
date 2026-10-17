# Saving Folio to a server

Folio works without any setup: everything stays in the browser. To let people sign in and keep their
resumes and applications in an account, connect a free Supabase project. It takes about five minutes.

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (the free plan is enough).
   Pick any name and region, and save the database password somewhere, though Folio doesn't need it.
2. When the project is ready, open **SQL Editor → New query**, paste all of
   [`supabase/schema.sql`](supabase/schema.sql), and press **Run**. It creates two tables and the rules
   that keep each person's data private.

## 2. Allow sign-in links back to the app

Open **Authentication → URL Configuration**:

- **Site URL:** `https://jwag789.github.io/tessera/folio/`
- **Redirect URLs:** add both `https://jwag789.github.io/tessera/folio/**` and `http://localhost:5173/**`

## 3. Give Folio the two keys

Open **Project Settings → API** (or **Data API**) and copy:

- the **Project URL**, like `https://abcd1234.supabase.co`
- the **anon public** key (a long string starting `eyJ`)

Put them in `apps/resume/.env.production` (and `.env.local` to use them with `npm run dev:resume`):

```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Both are safe to commit: the anon key can only do what the row-level security rules allow, which is
reading and writing the signed-in user's own rows. Never commit the **service_role** key.

Push to `main` and the Pages workflow publishes the app at https://jwag789.github.io/tessera/folio/.

## Good to know

- **Free projects pause after a week with no activity.** Sign-in and saving stop until you press
  **Restore** on the project in the Supabase dashboard. Data isn't lost.
- **Sign-in emails** come from Supabase's built-in mailer, which allows a few emails per hour. For more
  people, add your own SMTP provider under **Authentication → Emails**.
- **Signed out**, Folio keeps working locally. On a first sign-in to an empty account it offers to upload
  what's in that browser.

# BenchLedger — PC Parts, Builds & Sales Tracker

A small web app for tracking PC parts you've bought, assembling them into
builds, and (soon) tracking sales. Three pages:

- **Parts** — every part you own, with type, price, where you bought it
  (eBay / Facebook Marketplace), and a link to the listing. Search box on top.
  Parts used in a build are tagged **USED** in red and are hidden from build pickers.
- **Builds** — collapsible cards, one per PC you're assembling. Click anywhere
  on a card to expand/collapse (the arrow flips). Each card shows a thumbnail,
  name, running total price, and a green/red status dot — green once CPU, GPU,
  Motherboard and PSU are all assigned. "New build" opens a build page with
  "Add CPU / Add GPU / …" buttons that only show unused parts from the Parts page.
- **Sales** — a placeholder "under construction" page for now, ready to build out later.

Nothing is set up yet. Follow the steps below in order — none of them require
coding experience, just copy/paste. Total time: ~20 minutes.

---

## What you're setting up, and why

| Piece | What it does | Cost |
|---|---|---|
| **GitHub** | Stores your code, so you (and anyone you invite) can access and update it | Free |
| **Supabase** | The database — stores every part, every build, and all uploaded photos | Free tier (500MB database + 1GB file storage — plenty for this) |
| **Vercel** | Hosts the live website, rebuilds it automatically whenever you push to GitHub | Free tier |

---

## Step 1 — Create the GitHub repo

1. Go to [github.com](https://github.com) and sign in (or create a free account).
2. Click the **+** icon top-right → **New repository**.
3. Name it `benchledger` (or anything you like). Keep it **Public** or **Private**, your choice. Do **not** tick "Add a README" (we already have one). Click **Create repository**.
4. On the next page, look for the box that says **"uploading an existing file"** (it's a link in the quick-setup text). Click it.
5. Download the project files I've attached to this conversation, unzip them on your computer, then **drag the entire contents of the unzipped folder** (not the folder itself — its contents) into the GitHub upload page.
6. Scroll down, write a commit message like "Initial commit", and click **Commit changes**.

Your code is now on GitHub. (If you're comfortable with `git` on your computer, you can instead run `git init`, `git remote add origin <your repo URL>`, `git add .`, `git commit -m "Initial commit"`, `git push -u origin main` — same result.)

---

## Step 2 — Create the Supabase project (your database)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub.
2. Click **New project**. Pick any organization, name it `benchledger`, set a database password (save it somewhere), pick the region closest to you, and click **Create new project**. Wait ~2 minutes while it provisions.
3. Once it's ready, click **SQL Editor** in the left sidebar → **New query**.
4. Open the file `supabase/schema.sql` from the project folder you downloaded, copy **everything** in it, paste it into the SQL editor, and click **Run**. This creates the `parts` and `builds` tables and the security rules that let the site read/write data.
5. Now click **Storage** in the left sidebar → **New bucket**. Name it exactly `images`, toggle **Public bucket** ON, and click **Create bucket**. (The storage security policies were already created by the SQL you just ran, since they're in the same file, below the table definitions.)
6. Click **Project Settings** (gear icon) → **API**. You'll need two values from this page in Step 4:
   - **Project URL**
   - **anon public** key (under "Project API keys")

Keep this tab open, you'll copy these in a minute.

---

## Step 3 — Deploy to Vercel (the live website)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. Click **Add New** → **Project**.
3. Find your `benchledger` repo in the list and click **Import**.
4. Before clicking Deploy, open **Environment Variables** and add two:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste the **Project URL** from Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste the **anon public** key from Supabase
5. Click **Deploy**. Wait ~1-2 minutes.
6. You'll get a live URL like `https://benchledger.vercel.app` — that's your site. Share it with anyone you want to use it.

That's it — the app is live, backed by a real database, with image uploads working.

---

## Step 4 — Using the site

- **Parts page**: click **New part**, pick a type from the dropdown (CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooler, Monitor, Peripheral, Other), fill in a name, what you paid, where you bought it, and the listing link. Optionally attach a photo. Click **Save part** — it stacks at the top of the list. Use the search box to filter by name, type, or marketplace.
- **Builds page**: click **New build** — you're taken straight into that build's page. Give it a name and (optionally) a photo. Under "Essential parts" and "Optional parts", click **Add CPU**, **Add GPU**, etc. — a picker pops up showing only parts of that type that aren't already used in another build. Pick one and it's assigned. Go back to **Builds** and your new build shows up as a card: click anywhere on the card to expand/collapse it. The dot is green once CPU + GPU + Motherboard + PSU are all filled in, red otherwise.
- Any part assigned to a build shows a red **USED** tag back on the Parts page, and won't appear as an option when building a different PC. Remove it from the build's page to free it up again.
- **Sales page**: placeholder for now — a good next feature to build when you're ready (e.g. mark a build "sold", track sale price and profit).

---

## Running it on your own computer (optional)

Only needed if you want to test changes before pushing them.

1. Install [Node.js](https://nodejs.org) (LTS version).
2. Open a terminal in the project folder and run:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in the same two Supabase values from Step 2.
4. Run:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

Any changes you push to GitHub's `main` branch will automatically redeploy on Vercel within a minute or two.

---

## Project structure, if you want to edit it later

```
app/
  layout.js            shared page frame + navigation
  parts/page.js         Parts page
  builds/page.js         Builds page (list of build cards)
  builds/[id]/page.js    Build detail/edit page (assign parts)
  sales/page.js          Sales placeholder page
components/              reusable UI pieces (cards, forms, search bar, modal)
lib/
  supabaseClient.js       connects to your Supabase project
  constants.js            part categories, marketplaces, essential parts list
  uploadImage.js          handles photo uploads to Supabase Storage
supabase/schema.sql        database tables + security policies (run once)
```

To add a new part category or change which categories are "essential" for a
build to count as complete, edit `lib/constants.js`.

---

## Notes on privacy

This app has no login screen — anyone with the live URL can view and edit the
data (that's what makes the free Supabase setup above simple to get running).
If you want to restrict who can use it, two easy options later:
- Set the Vercel project visibility/password protection (available on paid Vercel plans), or
- Add a simple shared-passcode gate — ask for this as a follow-up and it can be added on top of what's here.

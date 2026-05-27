# Deployment Guide - Marathi Music Notation Tool

Follow these steps to deploy your application for free on the internet.

## Prerequisites
1. A [GitHub](https://github.com/) account.
2. Push your code to a new GitHub repository.
3. Download a Devanagari font file (like `Nirmala.ttf` or `NotoSansDevanagari-Regular.ttf`) and place it in the `backend/fonts/` folder before pushing to GitHub.

---

## Step 1: Database Setup (Neon.tech)
Since Render's free tier has temporary storage, we use a dedicated free database provider.

1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project.
3. Copy the **Connection String** (it looks like `postgres://user:pass@host/dbname`).
4. Save this URL; you will need it for the Backend setup.

---

## Step 2: Backend Deployment (Render.com)
1. Sign up at [Render.com](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Name:** `marathi-notation-backend`
   - **Environment:** `Python`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Click **Advanced** and add **Environment Variables**:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_HwkZi4SQ7VlN@ep-quiet-glade-aocienpu.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   - `JWT_SECRET_KEY`: (Enter a random long string)
6. Click **Create Web Service**.
7. Once deployed, copy the **URL** (e.g., `https://marathi-notation-backend.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel.com)
1. Sign up at [Vercel.com](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Set the following configurations:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Create React App`
5. Expand **Environment Variables** and add:
   - `REACT_APP_API_URL`: (Paste your Render Backend URL from Step 2)
6. Click **Deploy**.

---

## Technical Notes
- **Cold Starts:** Render's free tier "sleeps" after 15 minutes of inactivity. The first time you open the app, it might take 30-60 seconds to load while the backend wakes up.
- **Fonts:** The PDF generator will look for `backend/fonts/Nirmala.ttf`. If it's missing, it will fall back to standard Helvetica (which doesn't support Marathi characters).
- **Auto-Save:** The tool will automatically save your work to the Neon database if you are logged in.

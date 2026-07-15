# StockSense — Frontend Client

React (Vite) frontend for StockSense, an AI-powered F&O options screener for Indian markets (NSE/BSE).

## Features
- Mobile-responsive single-page dashboard.
- Live market ticker simulation during NSE F&O hours.
- Automated Option Chain suggestions based on AI sentiment and budget.
- Clean white & brown trading aesthetics with subtle floating animations.

## Tech Stack
- **Framework**: React 19 + Vite 8
- **Styling**: TailwindCSS 4 (Utility fallback) + Custom CSS Design System
- **Icons**: Lucide React

## Local Development

1. **Setup**:
   ```bash
   cd stocksense-frontend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root:
   ```bash
   VITE_API_URL=http://localhost:8000
   ```

3. **Run**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment to Vercel

1. Push this folder as a standalone repository to your GitHub account (e.g., `stocksense-frontend`).
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-stocksense-backend.onrender.com` (your deployed Render API URL)
5. Click **Deploy**. Vercel will automatically build the production site and handle SPA rewrites using the included `vercel.json` config!

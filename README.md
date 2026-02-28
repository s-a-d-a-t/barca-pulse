BarçaPulse – Ultimate FC Barcelona Fan Hub
=========================================

BarçaPulse is a fan-made, single-page experience for FC Barcelona supporters.  
It combines a live news feed, an interactive 2025/26 squad viewer, a tactical 4‑3‑3 formation board, coaching staff spotlight, and a visual trophy cabinet – all wrapped in a modern, glassmorphism-inspired UI.

> This is an unofficial fan project and is **not** affiliated with, endorsed by, or connected to FC Barcelona.


## Features

- **Live Barça news feed**
  - Uses a lightweight Node.js/Express backend that proxies the [NewsAPI](https://newsapi.org/) `everything` endpoint.
  - Filters articles to only show FC Barcelona–related content and presents them in animated, responsive news cards.
  - “Refresh News” button to pull a new, randomized selection of recent stories.

- **Interactive 2025/26 squad viewer**
  - Dynamic player grid with filters by position (GK/DEF/MID/ATT).
  - Status badges (injured, captain, new signing, on loan) rendered directly on player cards.
  - Clicking a player opens a rich modal with photo, bio details, and season statistics (apps, goals, assists, ratios, etc.).

- **4‑3‑3 tactical board**
  - Custom football pitch layout with shirt icons and name labels.
  - Visualizes an 11‑man starting lineup based on the in‑code squad data.

- **Club legacy & trophies**
  - Trophy wall showing La Liga, UCL, Copa del Rey, and Supercopa counts with animated trophy frames.
  - Story-driven history section (founding, Camp Nou, La Masia) with premium imagery and scroll animations.

- **Modern design & UX**
  - Tailwind CSS via CDN plus custom `style.css` for branding and animations.
  - Responsive layout, mobile navigation, smooth scrolling, and subtle motion (pulse, shimmer, floating, glassmorphism).


## Tech Stack

- **Frontend**
  - HTML5, vanilla JavaScript (`client/index.html`, `client/script.js`)
  - Tailwind CSS (CDN) + custom styles in `client/style.css`
  - Font Awesome for icons, Google Fonts (Montserrat, Inter)

- **Backend**
  - Node.js + Express
  - Axios (HTTP client)
  - CORS
  - dotenv (for environment variables)
  - Endpoint: `GET /news` – proxies and filters NewsAPI results


## Project Structure

```text
barcapulse/
├─ client/
│  ├─ index.html        # Main single-page app
│  ├─ script.js         # Squad logic, formation, news fetching, interactions
│  └─ style.css         # Custom Barça-themed styling & animations
├─ server.js            # Express server exposing /news proxy endpoint
├─ package.json         # Node project metadata & dependencies
├─ package-lock.json
└─ .env                 # Local environment variables (not committed)
```


## Getting Started

### 1. Prerequisites

- **Node.js** (LTS recommended)
- A **NewsAPI** account and API key: sign up at `https://newsapi.org/`


### 2. Installation

```bash
git clone <your-repo-url>
cd barcapulse

# Install backend dependencies
npm install
```


### 3. Environment Configuration

Create a `.env` file in the project root (alongside `server.js`) with:

```bash
NEWS_API_KEY=your_newsapi_key_here

# optional
PORT=3000
```

- `NEWS_API_KEY` is required for the `/news` endpoint to work.
- `PORT` is optional; by default the server uses `3000`.


### 4. Running the Backend

From the project root:

```bash
node server.js
```

The server will start on:

- `http://localhost:3000` (or whatever you set in `PORT`)

It exposes:

- `GET /news` – returns filtered FC Barcelona news articles from NewsAPI.


### 5. Running the Frontend

The frontend is plain HTML/JS and can be served in several ways:

1. **Simple option (local file)**  
   - Open `client/index.html` directly in your browser.  
   - The page will use `BACKEND_URL = 'http://127.0.0.1:3000'` (see `script.js`) to fetch news from your running Node server.

2. **Recommended option (local static server)**  
   - Use any static server or IDE plugin (e.g. VS Code “Live Server”) to serve the `client` folder:

   ```bash
   # Example using npx serve (if installed globally or via npx)
   npx serve client
   ```

   - Keep the Node server running at the same time so the `/news` endpoint is available.

If you host the frontend on a different origin/port, ensure `BACKEND_URL` in `client/script.js` points to the correct backend URL.


## Customization

- **Player data & stats**  
  Update the `players` array in `client/script.js` to:
  - Add/remove players
  - Change positions, shirt numbers, stats, or status badges

- **Starting XI / formation**  
  Adjust the `startingXI` mapping in `client/script.js` to update which players appear in each tactical position.

- **Styling & animations**  
  Modify or extend `client/style.css` to tweak:
  - Color palette and gradients
  - Card effects, glassmorphism, and hover states
  - Animations (pulse, floating, shimmer, modal transitions)


## Production & Deployment Notes

- **Backend**
  - Deploy `server.js` as a standard Node/Express service (e.g. Render, Railway, Fly.io, Heroku‑style PaaS, or a VPS).
  - Configure `NEWS_API_KEY` and `PORT` using your hosting provider’s environment variable settings.

- **Frontend**
  - Host the `client` folder on any static hosting (e.g. Netlify, Vercel, GitHub Pages, S3/CloudFront).
  - Update `BACKEND_URL` in `client/script.js` to the public URL of your deployed backend (e.g. `https://api.yourdomain.com`).


## Acknowledgements

- **NewsAPI** – for providing the news data.  
- **FC Barcelona, its players, and supporters** – the inspiration behind this fan project.  
- Logos, names, and images may be trademarks or copyrights of their respective owners.


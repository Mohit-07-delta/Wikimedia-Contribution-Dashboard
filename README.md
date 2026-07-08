<h1 align="center">Wikimedia Contribution Dashboard</h1>

<p align="center">
  <strong>A modern, comprehensive dashboard to track and visualize your contributions across the Wikimedia ecosystem.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
</p>

<p align="center">
  [PLACEHOLDER FOR PROJECT SCREENSHOT]
</p>

## 🚀 Live Demo

- **Frontend**: [https://Mohit-07-delta.github.io/Wikimedia-Contribution-Dashboard](https://Mohit-07-delta.github.io/Wikimedia-Contribution-Dashboard)
- **Backend API**: [https://wikimedia-contribution-dashboard.onrender.com](https://wikimedia-contribution-dashboard.onrender.com)

---

## ✨ Features

- **Global Cross-Wiki View**: See a bird's-eye view of your edits across all Wikimedia foundation projects.
- **Per-Project Dashboard**: Deep dive into specific projects (e.g. Wikipedia, Wikidata, Wikimedia Commons).
- **GitHub-Style Contribution Heatmap**: Visualize editing frequency over time with year-by-year navigation.
- **Namespace Breakdown Chart**: Understand where your edits happen (Articles, Talk pages, Categories, etc.) via beautiful interactive charts.
- **Recent Edits List**: Scroll through your 50 most recent edits, complete with direct external diff links.
- **Milestone Badges**: Celebrate your progress and editing milestones over the years.

---

## 🛠️ Tech Stack

**Frontend:**
- [React](https://reactjs.org/) (Vite)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) (for interactive data visualization)
- Deployed on **GitHub Pages**

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- Integrated with **XTools API** and the **MediaWiki Action API**
- Deployed on **Render**

---

## 🤔 Why I Built This

I built this dashboard to have a clean, consolidated place to track my personal and community contributions across the vast Wikimedia universe. Inspired by analytics tools like CapX and GitHub's iconic contribution graphs, I wanted to create a highly visual tool that celebrates editing milestones while exploring the robust open-source Wikimedia developer ecosystem.

---

## 🏗️ How It Works

The architecture is split into a decoupled frontend and backend:
- **Backend Proxy**: The Node/Express server acts as a caching proxy layer in front of the official XTools and MediaWiki APIs. This allows us to safely format data, respect strict rate limits, and provide a compliant `User-Agent` header as required by Wikimedia policy.
- **Frontend App**: The React application consumes these normalized REST endpoints, rendering fast and responsive UI components.

---

## 💻 Local Setup

Want to run this project locally? Follow these steps:

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Mohit-07-delta/Wikimedia-Contribution-Dashboard.git
cd Wikimedia-Contribution-Dashboard
```

### 2. Backend Setup
```bash
cd server
npm install

# Create a .env file and set up your local port (optional)
echo "PORT=5000" > .env
echo "CLIENT_URL=http://localhost:5173" >> .env

# Run the development server
npm run dev
```
*The backend should now be running on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install

# Create a local environment file pointing to your local backend
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.development

# Run the React development server
npm run dev
```
*The frontend should now be running on `http://localhost:5173`.*

---

## 🔌 API Endpoints

The backend exposes the following REST endpoints under `/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/user/global/:username` | Fetches a global summary of edit counts across all Wikimedia projects. |
| `GET`  | `/user/:project/:username/summary` | Retrieves a top-level summary (total edits, registration date, groups) for a specific project. |
| `GET`  | `/user/:project/:username/namespaces` | Returns a breakdown of edit counts categorized by MediaWiki namespace. |
| `GET`  | `/user/:project/:username/recent-edits` | Fetches the user's 50 most recent edits with diff links and timestamps. |
| `GET`  | `/user/:project/:username/heatmap/:year` | Computes daily edit counts formatted for a GitHub-style heatmap. |

---

## 🌍 Deployment

- **Frontend**: The React application is built via Vite and pushed to the `gh-pages` branch. It is hosted statically using GitHub Pages.
- **Backend**: The Node.js Express server is continuously deployed on Render.

---

## 🔮 Future Improvements

- [ ] **Saved Dashboards**: Implement user login to bookmark favorite contributors and save default project views.
- [ ] **User Comparisons**: Add a view to side-by-side compare the edit metrics of two different users.
- [ ] **Data Export**: Add the ability to export the beautiful charts and heatmaps to PDF or PNG images.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact

**[Mohit]** 
- GitHub: [@Mohit-07-delta](https://github.com/Mohit-07-delta)
- LinkedIn: [Your LinkedIn Profile]([PLACEHOLDER])
- Email: [Your Email]([PLACEHOLDER])

Feel free to open an issue or submit a pull request if you have any suggestions or improvements!

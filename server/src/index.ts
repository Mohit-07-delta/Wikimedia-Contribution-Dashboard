import express from "express";
import cors from "cors";
import userRoutes from "./routes/user";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Set to your frontend URL in production
  })
);
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/user", userRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

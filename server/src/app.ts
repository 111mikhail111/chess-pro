import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import { loginUser, registerUser } from "./controllers/authController";
import { completeLevel, getLevelById, getLevels, getCompletedLevels, getLevelRewards } from "./controllers/levelsController";
import { getPieceLevels, getUserPiecesCollection, upgradeUserPiece } from "./controllers/piecesController";
import { getUserInventory } from "./controllers/InventoryController";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // URL вашего React-приложения
    credentials: true,
  })
);
app.use(bodyParser.json());

// Routes
app.post("/api/auth/register", registerUser);
app.post("/api/auth/login", loginUser)
app.post("/api/levels/all", getLevels);
app.post("/api/levels/byid", getLevelById);
app.post('/api/levels/complete', (req, res, next) => {
  Promise.resolve(completeLevel(req, res)).catch(next);
});
app.get('/completed/:userId', getCompletedLevels);
app.get("/api/say_hello", (req, res) => {
  res.json({ message: "Привет, мир!" });
});
app.get("/api/pieces/collection", getUserPiecesCollection);
app.get("/api/pieces/:pieceId/levels", getPieceLevels);
app.post("/api/pieces/:pieceId/upgrade", upgradeUserPiece);
app.get("/api/inventory", getUserInventory);
app.get("/api/level-rewards/:levelId/user/:userId", getLevelRewards);

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

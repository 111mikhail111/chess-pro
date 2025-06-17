import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import { loginUser, registerUser } from "./controllers/authController";

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
app.get("/api/say_hello", (req, res) => {
  res.json({ message: "Привет, мир!" });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./Header"; // Убедитесь, что Header.jsx переименован в Header.tsx

// Импортируйте вашу новую страницу
import AboutPage from "./AboutPage"; // Предполагается, что вы создали этот файл
import GamePage from "./GamePage"; // Создадим этот компонент для вашей игры Phaser
import ProfilePage from "./ProfilePage";
import LevelsPage from "./LevelsPage";
import { UserProvider } from "../contexts/UserContext";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <div>
          {/* Навигация по сайту */}
          <Header /> {/* Если Header нужен на всех страницах */}
          {/* Определение маршрутов */}
          <Routes>
            <Route path="/" element={<GamePage />} />{" "}
            {/* Основная страница игры */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/levels" element={<LevelsPage />} />
            {/* Добавьте другие маршруты */}
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;

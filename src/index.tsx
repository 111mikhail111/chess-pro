import React from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";

import App from "./components/App";

// Реакт приложение
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Элемент с id="root" не найден в документе.');
}

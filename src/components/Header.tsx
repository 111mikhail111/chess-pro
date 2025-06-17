import React from "react";
import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img 
          src="/vite.svg" 
          alt="Chess Pro Logo" 
          className={styles.logo}
        />
        <h1 className={styles.title}>Chess Pro</h1>
      </div>
      
      <nav className={styles.navigation}>
        <a href="/" className={styles.navLink}>Game</a>
        <a href="/about" className={styles.navLink}>About</a>
        <a href="/profile" className={styles.navLink}>Профиль</a>
      </nav>
      
      <div className={styles.themeToggle}>
        <button className={styles.toggleButton}>🌓</button>
      </div>
    </header>
  );
}

export default Header;
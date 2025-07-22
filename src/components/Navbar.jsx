import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Geo<span>Check</span></div>

      <div className={styles.hamburger} onClick={toggleMenu}>
        ☰
      </div>

      <div className={`${styles.navLinks} ${menuOpen ? styles.show : ''}`}>
        <Link to="/about" className={styles.link} onClick={() => setMenuOpen(false)}>About Us</Link>
        <Link to="/contact" className={styles.link} onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link to="/terms" className={styles.link} onClick={() => setMenuOpen(false)}>Terms</Link>
      </div>
    </nav>
  );
}

export default Navbar;

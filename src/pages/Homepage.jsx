import { useState } from 'react'; 
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './Homepage.module.css';
import RoleSelectorModal from '../components/RoleSelectorModal';
import studentImage from '../assets/studentImage.png'; 

function Homepage() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        {/* LEFT SIDE */}
        <div className={styles.leftSide}>
          <h1 className={styles.heading}>Welcome!</h1>
          <p className={styles.text}>
            Mark your attendance with ease, track your progress over time, and stay connected to your academic schedule.
          </p>
          <div className={styles.buttons}>
          <button 
  onClick={() => setShowSignupModal(true)} 
  className={`${styles.btn} ${styles.signupBtn}`}>
  Sign Up
</button>

<button 
  onClick={() => setShowLoginModal(true)} 
  className={`${styles.btn} ${styles.signinBtn}`}>
  Sign In
</button>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.rightSide}>
          <div className={styles.imageWrapper}>
            <div className={`${styles.circle} ${styles.circle1}`}></div>
            <div className={`${styles.circle} ${styles.circle2}`}>
              <img src={studentImage} alt="Students" className={styles.heroImage} />
            </div>
            <div className={`${styles.circle} ${styles.circle3}`}></div>
          </div>
        </div>
      </main>

      <Footer />

      {showSignupModal && (
        <RoleSelectorModal
          onClose={() => setShowSignupModal(false)}
          routeType="signup"
        />
      )}

      {showLoginModal && (
        <RoleSelectorModal
          onClose={() => setShowLoginModal(false)}
          routeType="login"
        />
      )}
    </div>
  );
}

export default Homepage;

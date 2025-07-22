import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StudentLogin.module.css';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  // State for loading indicator on sign-in
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  // State for loading indicator on password reset
  const [loadingPasswordReset, setLoadingPasswordReset] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoadingSignIn(true); // Start loading

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation happens after successful sign-in.
      // The loadingSignIn state will be set to false in the finally block,
      // which executes immediately after navigation is initiated.
      navigate('/dashboard'); 
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      // This ensures loadingSignIn is always set to false,
      // whether navigation happens or an error occurs.
      setLoadingSignIn(false); 
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setError('');
    setMessage('');
    setLoadingPasswordReset(true); // Start loading for password reset

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. ✅"); 
    } catch (err) {
      setError("Failed to send reset email. Try again. ❌"); 
      console.error("Password reset error:", err);
    } finally {
      setLoadingPasswordReset(false); // End loading for password reset
    }
  };

  return (
    <div className={styles.fullPage}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Geo<span>Check</span></h1>
        <h2 className={styles.heading}>Student Sign In</h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loadingSignIn || loadingPasswordReset} 
          />
          <input
            type="password"
            placeholder="Password (Your Reference Number) *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loadingSignIn || loadingPasswordReset} 
          />

          <button
            type="submit"
            className={styles.btn}
            disabled={loadingSignIn || loadingPasswordReset} 
            style={{
              backgroundColor: (loadingSignIn || loadingPasswordReset) ? '#999' : '#0077B6',
              cursor: (loadingSignIn || loadingPasswordReset) ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loadingSignIn ? (
              <>
                Signing In...
                <div className={styles.spinner}></div> 
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <p
            style={{
              color: '#0077B6',
              marginTop: '0.75rem',
              cursor: (loadingSignIn || loadingPasswordReset) ? 'not-allowed' : 'pointer', 
              fontSize: '0.9rem',
              textDecoration: 'underline',
              opacity: (loadingSignIn || loadingPasswordReset) ? 0.6 : 1, 
            }}
            onClick={!loadingSignIn && !loadingPasswordReset ? handleForgotPassword : null} 
          >
            {loadingPasswordReset ? (
              <>
                Sending...
                <div className={styles.miniSpinner}></div> 
              </>
            ) : (
              'Forgot Password?'
            )}
          </p>
        </form>
      </div>
      <style>{`
        .${styles.spinner} {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        .${styles.miniSpinner} {
          border: 2px solid rgba(0, 119, 182, 0.3); 
          border-top: 2px solid #0077B6; 
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 1s linear infinite;
          display: inline-block; 
          vertical-align: middle; 
          margin-left: 5px; 
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StudentLogin;
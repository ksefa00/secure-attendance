import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './AdminLogin.module.css';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

function AdminLogin() {
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, adminEmail, password);
      navigate('/admin-dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.fullPage}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Geo<span>Check</span></h1>
        <h2 className={styles.heading}>Admin Login</h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Admin Email *"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", margin: 5 }}>
         <p>Do not have an account? </p>
         <Link to="/signup/admin">Register here</Link>
        </div>

          <button type="submit" className={styles.btn}>
            {loading ? (
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.6s linear infinite'
                }}
              ></span>
            ) : (
              'Login'
            )}
          </button>

       <div style={{ display: "flex", flexDirection: "row", justifyContent:"center", margin: 10 }}>
  <Link to="/forgot-password">Forgot password?</Link>
</div>
        </form>
      </div>

      {/* 🔁 Keyframe animation for loading spinner */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default AdminLogin;

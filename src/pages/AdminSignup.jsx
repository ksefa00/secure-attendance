import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminSignup.module.css';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function AdminSignup() {
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // ✅ Create admin in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
      const user = userCredential.user;

      // ✅ Store admin details in Firestore "admins" collection
      await setDoc(doc(db, 'admins', user.uid), {
        email: adminEmail,
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      // ✅ Redirect to homepage after successful signup
      navigate('/admin/add-course');

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className={styles.fullPage}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Geo<span>Check</span></h1>
        <h2 className={styles.heading}>Admin Sign Up</h2>

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
          <input
            type="password"
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.btn}>Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default AdminSignup;

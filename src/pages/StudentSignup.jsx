import { useState } from 'react';
import { useNavigate , Link} from 'react-router-dom';
import styles from './StudentSignup.module.css';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function StudentSignup() {
  const [fullName, setFullName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!referenceNumber || referenceNumber.length < 5) {
      setError("Reference number must be at least 5 characters.");
      return;
    }

    const autoPassword = referenceNumber; // ✅ Use reference number directly as password

    try {
      // ✅ Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, autoPassword);
      const user = userCredential.user;

      // ✅ Store student info in Firestore
      await setDoc(doc(db, 'students', user.uid), {
        fullName,
        email,
        indexNumber,
        referenceNumber,
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard'); // ✅ Redirect on success
} catch (err) {
  console.error(err);
  if (err.code === 'auth/email-already-in-use') {
    setError('This email is already registered. Please sign in or reset your password.');
  } else {
    setError('An error occurred. Please try again.');
  }
}

  };

  return (
    <div className={styles.fullPage}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Geo<span>Check</span></h1>
        <h2 className={styles.heading}>Student Sign Up</h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Index Number *"
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Reference Number *"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />


          <button type="submit" className={styles.btn}>Create Account</button>

          
             <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", margin: 5 }}>
               <p>Already have an account? </p>
               <Link to="/login/student">Login here</Link>
              </div>
        </form>
      </div>
    </div>
  );
}

export default StudentSignup;

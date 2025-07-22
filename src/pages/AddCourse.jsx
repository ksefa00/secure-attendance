import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import auth
import { useNavigate } from 'react-router-dom';
import styles from './AddCourse.module.css';

function AddCourse() {
  const [adminName, setAdminName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!courseCode || !courseName) {
      setError('Please fill in all fields.');
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    try {
      await addDoc(collection(db, 'courses'), {
        adminname: adminName.trim(),
        code: courseCode.trim(),
        coursename: courseName.trim(),
        open: false,
        createdAt: serverTimestamp(),
        adminUID: currentUser.uid, // Store UID of the current user
      });

      setSuccessMessage('Course added successfully!');
       navigate('/admin-dashboard');
      setCourseCode('');
      setCourseName('');
    } catch (err) {
      console.error(err);
      setError('Failed to add course. Please try again.');
    }
  };

  return (
    <div className={styles.fullPage}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Geo<span>Check</span></h1>
        <h2 className={styles.heading}>Add New Course</h2>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
           <input
            type="text"
            placeholder="Enter your name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Course Code (e.g., CSM 352)"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Course Name (e.g., Computer Architecture)"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <button type="submit" className={styles.btn}>Add Course</button>
        </form>
      </div>
    </div>
  );
}

export default AddCourse;

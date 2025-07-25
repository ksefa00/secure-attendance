import React, { useState } from 'react';
import styles from './StudentRegister.module.css';
import { Link, useNavigate } from 'react-router-dom';

function StudentRegister() {
  const [fullName, setFullName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [programme, setProgramme] = useState('');
  const [level, setLevel] = useState('');

  const handleRegister = () => {
    console.log('Registering:', fullName, indexNumber, programme, level);
  };

  return (
    <div className={styles.container}>
      <h2>Register as Student</h2>

      <div className={styles.formGroup}>
        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Index Number</label>
        <input
          type="text"
          value={indexNumber}
          onChange={(e) => setIndexNumber(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Programme</label>
        <input
          type="text"
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Select Level</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
        </select>
      </div>


      <button onClick={handleRegister}>Register</button>

      
    </div>
  );
}

export default StudentRegister;

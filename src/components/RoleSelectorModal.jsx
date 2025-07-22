import styles from './RoleSelectorModal.module.css';
import { Link } from 'react-router-dom';

function RoleSelectorModal({ onClose, routeType = 'signup' }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Select Your Role</h2>
        <div className={styles.buttons}>
          <Link to={`/${routeType}/admin`} className={styles.btn}>
            Lecturer / Admin
          </Link>
          <Link to={`/${routeType}/student`} className={styles.btnSecondary}>
            Student
          </Link>
        </div>
        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}

export default RoleSelectorModal;

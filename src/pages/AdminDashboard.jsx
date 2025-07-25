import { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { auth } from '../firebase/config';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  updateDoc,
  query,
  where,
  arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './AdminDashboard.module.css';

function AdminDashboard() {
  const [portalOpen, setPortalOpen] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [checkins, setCheckins] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [selectedCheckinModal, setSelectedCheckinModal] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckinsModal, setShowCheckinsModal] = useState(false);
  const [checkinsData, setCheckinsData] = useState([]);
  // NEW STATE: For loading indicator
  const [loadingRegistration, setLoadingRegistration] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const q = query(collection(db, 'courses'), where('adminUID', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const courseDoc = querySnapshot.docs[0];
          const data = courseDoc.data();
          setCourse({ id: courseDoc.id, ...data });
          console.log(course)

          setPortalOpen(data.open || false);
          setDate(data.date || '');
          setStartTime(data.startTime || '');
          setEndTime(data.endTime || '');

         

          await loadCheckins(data.code);
        }

        const checkinDoc = await getDoc(doc(db, 'checkins', currentUser.uid));
        if (checkinDoc.exists()) {
          const data = checkinDoc.data();
          const entries = Object.entries(data || {}).map(([key, value]) => ({
            dateTime: key,
            data: value
          }));
          setCheckins(entries);
        }
      }
        setLoading(false);
    });

   

    return () => unsubscribe();
  }, []);


   const getInitials = (fullName) => {
  if (!fullName) return 'U';
  const names = fullName.trim().split(' ');
  const initials = names.map((n) => n[0].toUpperCase()).slice(0, 2).join('');
  return initials;
};

  const loadCheckins = async (adminUID) => {
    try {
      const checkinsRef = doc(db, 'checkins', adminUID);
      const checkinsSnap = await getDoc(checkinsRef);

      if (checkinsSnap.exists()) {
        const data = checkinsSnap.data();

        const formatted = Object.entries(data || {}).map(([dateTime, entry]) => ({
          dateTime,
          startTime: entry.startTime,
          endTime: entry.endTime,
          count: entry.checkins?.length || 0,
          checkins: entry.checkins || [],
          latitude: entry.latitude || null, // Include latitude
          longitude: entry.longitude || null, // Include longitude
        }));

        setCheckinsData(formatted);
      } else {
        setCheckinsData([]);
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  };

  const handleCheckinClick = (session) => {
    setSelectedCheckin(session);
    setSelectedCheckinModal(true);
  };

  const closeSelectedCheckinModal = () => {
    setSelectedCheckinModal(false);
    setSelectedCheckin(null);
  };

  const handleTogglePortal = async () => {
    if (course) {
      const courseRef = doc(db, 'courses', course.id);
      await updateDoc(courseRef, { open: !portalOpen });
      setPortalOpen(prev => !prev);
    }
  };

  const handleEditRegistration = async () => {
    // Show loading indicator
    setLoadingRegistration(true);

    try {
      if (course && user) {
        const courseRef = doc(db, 'courses', course.id);
        await updateDoc(courseRef, { date, startTime, endTime });

        // Get current location coordinates
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;

              const checkinsRef = doc(db, 'checkins', user.uid);
              const checkinTimeKey = `${date} ${startTime}`;

              const checkinDoc = await getDoc(checkinsRef);
              let existing = {};

              if (checkinDoc.exists()) {
                existing = checkinDoc.data();
              }

              // Store latitude and longitude with the check-in session
              existing[checkinTimeKey] = {
                date,
                sessionCode,
                startTime,
                endTime,
                latitude,
                longitude,
                checkins: existing[checkinTimeKey]?.checkins || []
              };

              await setDoc(checkinsRef, existing);

              const updatedCheckins = Object.entries(existing).map(([key, value]) => ({ dateTime: key, data: value }));
              setCheckins(updatedCheckins);

              alert('Registration updated with location! ✅'); // Added emoji for success
            },
            (error) => {
              console.error("Error getting location:", error);
              alert("Could not get your location. Registration updated without location. ⚠️"); // Added emoji for warning
              // Proceed with registration update even if location fails
              updateRegistrationWithoutLocation();
            }
          );
        } else {
          alert("Geolocation is not supported by this browser. Registration updated without location. 🌐"); // Added emoji
          updateRegistrationWithoutLocation();
        }
      }
    } catch (error) {
      console.error("Error saving registration:", error);
      alert("Failed to save registration. Please try again. ❌"); // Added emoji for error
    } finally {
      // Hide loading indicator regardless of success or failure
      setLoadingRegistration(false);
    }
  };

  // Helper function to update registration without location in case of geolocation failure
  const updateRegistrationWithoutLocation = async () => {
    if (course && user) {
      const checkinsRef = doc(db, 'checkins', user.uid);
      const checkinTimeKey = `${date} ${startTime}`;

      const checkinDoc = await getDoc(checkinsRef);
      let existing = {};

      if (checkinDoc.exists()) {
        existing = checkinDoc.data();
      }

      existing[checkinTimeKey] = existing[checkinTimeKey] || { date, sessionCode, startTime, endTime, checkins: [] };

      await setDoc(checkinsRef, existing);

      const updatedCheckins = Object.entries(existing).map(([key, value]) => ({ dateTime: key, data: value }));
      setCheckins(updatedCheckins);
    }
  };



  const handleAddStudent = async () => {
    if (!studentName || !indexNumber || !course) {
      alert('Please fill both fields');
      return;
    }

    const courseRef = doc(db, 'courses', course.id);
    const newStudent = { name: studentName, indexNumber };

    try {
      await updateDoc(courseRef, { students: arrayUnion(newStudent) });
      setCourse(prev => ({
        ...prev,
        students: [...(prev.students || []), newStudent]
      }));
      setShowModal(false);
      setStudentName('');
      setIndexNumber('');
    } catch (error) {
      console.error("Error adding student:", error);
      alert('Failed to add student');
    }
  };

  const handleShowCheckins = () => setShowCheckinModal(true);
  const handleCloseCheckins = () => setShowCheckinModal(false);

 if (loading)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      color: '#4CAF50',
      fontSize: '1.2em'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #e0f2e0',
        borderTop: '6px solid #4CAF50',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
        boxShadow: '0 0 10px rgba(76, 175, 80, 0.2)'
      }} />
      <p>Loading dashboard... ⏳</p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );


  return (
    <div className={styles.container}>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <h1 className={styles.logo}>Geo<span>Check</span></h1>
 <div
  style={{
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#eaf6ff', // light green background
    color: '#155724', // dark green text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    border: '3px solid #3498db',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    userSelect: 'none',
  }}
>
  {getInitials(course?.adminname)}
</div>
        </header>

        {course && (
          <h2 className={styles.welcome}>
            Welcome {course.adminname || user?.displayName || 'Admin'} to {course.name} ({course.code})
          </h2>
        )}

        <div className={styles.stats}>
          <div className={styles.card}>Total Students<br /><strong>{course?.students?.length || 0}</strong></div>
          <div
            className={styles.card}
            onClick={handleShowCheckins}
            style={{ cursor: 'pointer', background: '#396291ff' }}
          >
            Check-ins<br />
            <strong>
              {checkins.reduce(
                (acc, session) => acc + (session.data.checkins?.length || 0),
                0
              )}
            </strong>
          </div>
        </div>

        <div className={styles.portalControl}>
          <label>Open Portal</label>
          <label className={styles.switch}>
            <input type="checkbox" checked={portalOpen} onChange={handleTogglePortal} />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '2px solid #ccc' }}
          />

          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '2px solid #ccc' }}
          />

          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '2px solid #ccc' }}
          />

          <label>4-Digit Code</label>
          <input
            type="text"
            value={sessionCode}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{0,4}$/.test(val)) setSessionCode(val);   // Only allow up to 4 digits
            }}
            placeholder="Enter 4-digit code"
            maxLength={4}
            style={{ padding: '8px', borderRadius: '5px', border: '2px solid #ccc' }}
          />
        </div>

        <button
          className={styles.editBtn}
          onClick={handleEditRegistration}
          // Disable button while loading
          disabled={loadingRegistration}
          style={{
            marginTop: '20px',
            padding: '10px 15px',
            backgroundColor: loadingRegistration ? '#999' : '#145f9cff', // Gray out when loading
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loadingRegistration ? 'not-allowed' : 'pointer', // Change cursor
            display: 'flex', // To center content if you add text + spinner
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px' // Space between text and spinner
          }}
        >
          {loadingRegistration ? (
            <>
              Saving...
              <div className={styles.spinner}></div> {/* Spinner element */}
            </>
          ) : (
            'Save Registration'
          )}
        </button>

        <button onClick={() => setShowModal(true)} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#145f9cff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Register Student</button>

        {showModal && (
          <div style={{ position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
              <h3>Register Student</h3>
              <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <input type="text" placeholder="Index Number" value={indexNumber} onChange={(e) => setIndexNumber(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={handleAddStudent} style={{ padding: '8px 12px', backgroundColor: '#396291ff', color: 'white', border: 'none', borderRadius: '4px' }}>Add</button>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showCheckinModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999
            }}
            onClick={handleCloseCheckins}
          >
            <div
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80%',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Check-in Sessions</h3>
              {checkins.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No check-ins yet.</p>
              ) : (
                checkins.map((session, index) => (
                  <div
                    key={index}
                    onClick={() => handleCheckinClick(session)}
                    style={{
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: '#eef5ff',
                      cursor: 'pointer'
                    }}
                  >
                    <span><strong>{session.dateTime}</strong></span>
                    <span><strong>Students:</strong> {session.data.checkins?.length || 0}</span>
                  </div>
                ))
              )}
              <button
                onClick={handleCloseCheckins}
                style={{
                  marginTop: '10px',
                  display: 'block',
                  marginLeft: 'auto',
                  backgroundColor: '#396291ff',
                  color: '#fff',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {selectedCheckinModal && selectedCheckin && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
            onClick={closeSelectedCheckinModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 0 12px rgba(0,0,0,0.3)'
              }}
            >
              <h3 style={{ marginBottom: '10px' }}>Check-in: {selectedCheckin.dateTime}</h3>
            

              {selectedCheckin.data.checkins?.length > 0 ? (
                selectedCheckin.data.checkins.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #ccc',
                      marginBottom: '6px'
                    }}
                  >
                    <strong>Name:</strong> {entry.name}<br />
                    <strong>Index No:</strong> {entry.indexNumber}<br />
                    <strong>Time:</strong> {new Date(entry.timestamp).toLocaleString()}
                  </div>
                ))
              ) : (
                <p>No students checked in.</p>
              )}

              <button
                onClick={closeSelectedCheckinModal}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
      {/* Add a global style for the spinner using CSS Modules or inline style */}
      <style>{`
        .${styles.spinner} {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
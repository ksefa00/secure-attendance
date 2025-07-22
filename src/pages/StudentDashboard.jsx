import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  collection,
  query,
  where
} from 'firebase/firestore';

// Haversine formula to calculate distance between two lat/lon points in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d; // Returns distance in meters
}

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [availableCheckins, setAvailableCheckins] = useState([]);
  const [codeInput, setCodeInput] = useState('');
  const [modalCourse, setModalCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/student-login');
        return;
      }

      // Get student info
      const studentRef = doc(db, 'students', user.uid);
      const snap = await getDoc(studentRef);

      if (!snap.exists()) {
        navigate('/student-register');
        return;
      }

      const studentData = { ...snap.data(), email: user.email };
      setStudent(studentData);

      // Get all courses with student
      const courseQuery = query(collection(db, 'courses'));
      const courseSnapshot = await getDocs(courseQuery);

      const studentCourses = [];
      const openCourses = [];

      courseSnapshot.forEach((docSnap) => {
        const courseData = docSnap.data();
        const isInCourse = courseData.students?.some(
          (s) => s.indexNumber === studentData.indexNumber
        );

        if (isInCourse) {
          studentCourses.push({ id: docSnap.id, ...courseData });

          if (courseData.open) {
            openCourses.push({ id: docSnap.id, ...courseData });
          }
        }
      });

      setCourses(studentCourses);
      setAvailableCheckins(openCourses);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);


  const getInitials = (fullName) => {
  if (!fullName) return 'U';
  const names = fullName.trim().split(' ');
  const initials = names.map((n) => n[0].toUpperCase()).slice(0, 2).join('');
  return initials;
};


  const handleOpenModal = (course) => {
    setModalCourse(course);
    setShowModal(true);
  };

  const handleCheckin = async () => {
    if (!modalCourse || !student) return;

    const { adminUID, date, startTime } = modalCourse; // Removed endTime as it's not used here
    const checkinRef = doc(db, 'checkins', adminUID);
    const checkinDoc = await getDoc(checkinRef);
    const key = `${date} ${startTime}`;

    let existing = {};
    if (checkinDoc.exists()) {
      existing = checkinDoc.data();
    }

    const sessionData = existing[key];

    if (!sessionData) {
      alert('This session is not available.');
      return;
    }

    if (sessionData.sessionCode !== codeInput) {
      alert('Incorrect code. Please try again.');
      return;
    }

    // --- Geolocation Check ---
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const studentLat = position.coords.latitude;
          const studentLon = position.coords.longitude;

          console.log(studentLat)
            console.log(studentLon)

          const adminLat = sessionData.latitude;
          const adminLon = sessionData.longitude;

          // Check if admin location is available for this session
          if (adminLat === undefined || adminLon === undefined || adminLat === null || adminLon === null) {
            alert('Admin has not set a location for this check-in session. Check-in cannot proceed.');
            return;
          }

          const distance = calculateDistance(studentLat, studentLon, adminLat, adminLon); // Distance in meters
          const distanceThreshold = 75; // 75 meters

          if (distance > distanceThreshold) {
            alert(`You are too far from the check-in location (${distance.toFixed(2)} meters). You must be within ${distanceThreshold} meters.`);
            return;
          }

          // If distance is within range, proceed with check-in
          sessionData.checkins.push({
            name: student.fullName,
            indexNumber: student.indexNumber,
            timestamp: Date.now(),
            latitude: studentLat, // Store student's check-in location
            longitude: studentLon, // Store student's check-in location
          });

          await setDoc(checkinRef, existing);
          alert('Check-in successful! 🎉'); // Added emoji for success
          setShowModal(false);
        },
        (error) => {
          console.error("Error getting student location:", error);
          let errorMessage = "Could not get your location for check-in. Please ensure location services are enabled and try again.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location access denied. Please allow location access in your browser settings to check-in.";
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true, // Request more accurate position
          timeout: 10000, // 10 seconds timeout
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Cannot check-in.");
    }
  };

  if (loading || !student)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      color: '#4CAF50',
      fontSize: '1.2em'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '6px solid #d4eed4',
        borderTop: '6px solid #4CAF50',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <p>Loading dashboard... ⏳</p>

      {/* Keyframe animation (add it in a CSS file or global style if you're using CSS Modules) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );


  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: '#cbe3f9', // Light gray background
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '800px',
        width: '100%',
        margin: '20px auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '20px',
          borderBottom: '1px solid #eee',
          marginBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '32px',
            color: '#2c3e50', // Darker primary color
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center'
          }}>
            Geo<span style={{ color: '#3498db' }}>Check</span> 
          </h1>
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
  {getInitials(student.fullName)}
</div>

        </div>

        <h2 style={{
          marginTop: '25px',
          color: '#2c3e50',
          fontSize: '26px',
          marginBottom: '10px'
        }}>
          Hello, {student.fullName}! 👋
        </h2>
        <p style={{
          fontStyle: 'italic',
          marginBottom: '25px',
          color: '#666',
          fontSize: '1.1em',
          lineHeight: '1.5'
        }}>
          Welcome to your <b>GeoCheck</b> dashboard! Here you'll find all your enrolled courses and active check-in sessions. Get ready to mark your attendance.
        </p>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#eaf6ff', // Lighter blue
          borderRadius: '10px',
          borderLeft: '5px solid #3498db', // Accent border
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: '8px 0', fontWeight: '600', color: '#333', fontSize: '1.1em' }}>
            Index Number: <span style={{ color: '#555', fontWeight: 'normal' }}>{student.indexNumber}</span>
          </p>
          <p style={{ margin: '8px 0', fontWeight: '600', color: '#333', fontSize: '1.1em' }}>
            Reference Number: <span style={{ color: '#555', fontWeight: 'normal' }}>{student.referenceNumber}</span>
          </p>
        </div>

        <h3 style={{
          color: '#2c3e50',
          marginTop: '30px',
          marginBottom: '15px',
          fontSize: '22px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>Your Enrolled Courses: 📚</h3>
        <div style={{ marginBottom: '30px' }}>
          {courses.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>You are not currently enrolled in any courses.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#fefefe',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'default' // Not clickable unless it's a checkin
              }}>
                <strong style={{ color: '#333', fontSize: '1.1em' }}>{course.coursename}</strong> - <span style={{ color: '#777' }}>{course.code}</span>
              </div>
            ))
          )}
        </div>

        <h3 style={{
          marginTop: '30px',
          color: '#2c3e50',
          fontSize: '22px',
          marginBottom: '15px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>Available Check-ins: ✅</h3>
        {availableCheckins.length === 0 ? (
          <p style={{ color: '#777', fontStyle: 'italic' }}>No open check-in sessions at the moment. Please check back later! 🙏</p>
        ) : (
          availableCheckins.map((course) => (
            <div
              key={course.id}
              onClick={() => handleOpenModal(course)}
              style={{
                border: '1px solid #dcdcdc',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#e8f5e9', // Light green for available
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.07)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.07)'; }}
            >
              <span style={{
                backgroundColor: '#4CAF50', // Green dot
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                position: 'absolute',
                top: '15px',
                right: '15px',
                border: '2px solid #fff'
              }} title="Available"></span>
              <strong style={{ color: '#333', fontSize: '1.2em', marginBottom: '5px' }}>{course.coursename}</strong>
              <p style={{ margin: '0', color: '#555', fontSize: '1em' }}>
                Course Code: {course.code}
              </p>
              <p style={{ margin: '5px 0 0', color: '#666', fontSize: '0.95em' }}>
                Date: {course.date} | Time: {course.startTime} - {course.endTime}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '30px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '450px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              transform: showModal ? 'scale(1)' : 'scale(0.9)',
              transition: 'transform 0.3s ease-out',
              animation: 'slideIn 0.3s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              marginBottom: '15px',
              color: '#2c3e50',
              fontSize: '24px',
              textAlign: 'center'
            }}>Enter Check-in Code 🔑</h3>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter session code here"
              style={{
                width: 'calc(100% - 24px)', // Account for padding
                padding: '14px 12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1.1em',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                onClick={handleCheckin}
                style={{
                  backgroundColor: '#396291ff', // Green for confirm
                  color: 'white',
                  padding: '12px 22px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1.1em',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Confirm Check-in
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#dc3545', // Red for cancel
                  color: 'white',
                  padding: '12px 22px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1.1em',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Keyframe styles for modal animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;
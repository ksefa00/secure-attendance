import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminSignup from './pages/AdminSignup';
import AdminLogin from './pages/AdminLogin'; 
import StudentSignup from './pages/StudentSignup';
import StudentLogin from './pages/StudentLogin';
import AddCourse from './pages/AddCourse';
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard';
import StudentRegister from './pages/StudentRegister';
import TermsAndConditions from './pages/Terms';

 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/signup/admin" element={<AdminSignup />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/signup/student" element={<StudentSignup />} /> 
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/admin/add-course" element={<AddCourse />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-register" element={<StudentRegister />} />
      </Routes>
    </Router>
  );
}

export default App;

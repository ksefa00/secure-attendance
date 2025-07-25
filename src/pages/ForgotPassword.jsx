import React, { useState } from 'react';
// Assuming your Firebase configuration and initialization is done elsewhere
// and you have an 'auth' instance available.
//import { auth } from '../firebase/config';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Import specific functions

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // IMPORTANT: Initialize Firebase Auth here or ensure it's imported from your config
  // For demonstration, let's assume getAuth() works directly if firebase app is initialized
  const auth = getAuth(); // Get the auth instance

  const handlePasswordReset = async (e) => {
    e.preventDefault(); // Prevent default form submission

    setLoading(true); // Start loading
    setMessage('');     // Clear previous messages
    setError('');       // Clear previous errors

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox (and spam folder).');
      setEmail(''); // Clear the email input after successful send
    } catch (err) {
      console.error("Error sending password reset email:", err);
      // Firebase error codes for user-friendly messages
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-not-found':
          setError('No user found with that email address.');
          break;
        case 'auth/missing-email':
            setError('Please enter an email address.');
            break;
        default:
          setError('Failed to send password reset email. Please try again.');
          break;
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh', // Adjust as needed
     // backgroundColor: '#f0f2f5',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#333',
          marginBottom: '25px',
          fontSize: '24px'
        }}>Reset Your Password</h2>

        {message && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #c3e6cb'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '12px',
              marginBottom: '20px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px',
              width: 'calc(100% - 24px)', // Account for padding
              boxSizing: 'border-box'
            }}
            disabled={loading} // Disable input while loading
          />

          <button
            type="submit"
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#6c757d' : '#0077B6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  marginRight: '8px',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span> {/* Simple spinner */}
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Keyframe for spinner animation (can be in a CSS file or injected) */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default ForgotPassword;
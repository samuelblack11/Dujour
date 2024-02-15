import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App'; // Adjust the import path as necessary
import './AllPages.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isSigningUp, setIsSigningUp] = useState(false); // To toggle between login and signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role; adjust based on your requirements

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { token, role } = await loginUser(email, password);
      localStorage.setItem('token', token); // Store token for session management
      login({ email, role }); // Update context
    } catch (error) {
      alert(error.message);
    }
  };

const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // If you need to send `role` to your API, just remove it from the destructuring assignment here
      const { token, role: returnedRole } = await registerUser(email, password, role);
      localStorage.setItem('token', token);
      // Use the role from the API's response if it's different from the one sent
      login({ email, role: returnedRole });
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
};

async function loginUser(email, password) {
  try {
    const response = await axios.post('/api/users/login', {
      email,
      password
    });
    // Assuming your server responds with the user object and token upon successful authentication
    return response.data; // This will return the response data directly
  } catch (error) {
    // Error handling: Axios errors contain a response object
    // Customize the error handling as needed
    throw new Error(error.response && error.response.data ? error.response.data.message : 'Login failed');
  }
}

async function registerUser(email, password, role) {
  try {
    console.log(email)
    const response = await axios.post('/api/users/signup', {
      email,
      password,
      role
    });
    // Assuming your server responds with status 201 and a success message upon user creation
    return response.data; // This will contain any data sent back from the server, such as a success message or the user object itself
  } catch (error) {
    // Handle errors with Axios
    // Customize the error handling as needed, based on the structure of your error response
    const errorMessage = error.response && error.response.data && error.response.data.message
                         ? error.response.data.message
                         : 'Signup failed due to an unexpected error';
    throw new Error(errorMessage);
  }
}

  return (
    <div className="login-container">
      <h2>{isSigningUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={isSigningUp ? handleSignup : handleLogin}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {isSigningUp && (
          <div>
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
        <button className="add-button" type="submit">{isSigningUp ? 'Sign Up' : 'Login'}</button>
      </form>
      <button className="add-button" onClick={() => setIsSigningUp(!isSigningUp)}>
        {isSigningUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}

export default Login;

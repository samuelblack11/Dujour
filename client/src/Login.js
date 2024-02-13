import React, { useState, useContext } from 'react';
import { AuthContext } from './App'; // Adjust the import path as necessary

function Login() {
  const { login } = useContext(AuthContext);
  const [isSigningUp, setIsSigningUp] = useState(false); // To toggle between login and signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role; adjust based on your requirements

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual login API call
      const { user } = await loginUser(email, password);
      login(user); // Update the authentication state
    } catch (error) {
      alert('Failed to log in: ' + error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual signup API call
      const { user } = await registerUser(email, password, role);
      login(user); // Automatically log in the user after successful signup
    } catch (error) {
      alert('Failed to sign up: ' + error.message);
    }
  };

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
        <button type="submit">{isSigningUp ? 'Sign Up' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSigningUp(!isSigningUp)}>
        {isSigningUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}

export default Login;

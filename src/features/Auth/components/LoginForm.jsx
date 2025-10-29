import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { loginUser } from '../services/authService';

/**
 * LoginForm Component
 * ------------------------------------------------------------
 * Handles user login with validation, loading states, 
 * and success/error feedback.
 * 
 * Props:
 *  - onLoginSuccess: Callback triggered when login succeeds 
 *    (used by parent component to show animation or loader)
 * ------------------------------------------------------------
 */
const LoginForm = ({ onLoginSuccess }) => {
  // ---------- State Variables ----------
  const [email, setEmail] = useState('');            // stores user email
  const [password, setPassword] = useState('');      // stores user password
  const [isLoading, setIsLoading] = useState(false); // indicates API in progress
  const [error, setError] = useState(null);          // stores error message

  // Minimum loader animation time (e.g., 2 seconds)
  const MIN_LOADER_TIME = 2000;

  // ---------- Form Submit Handler ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // 2️⃣ Start API call phase
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      // 3️⃣ Attempt login using the provided service
      await loginUser(email, password);

      // 4️⃣ Notify parent to show loader animation (if provided)
      if (onLoginSuccess) onLoginSuccess();

      // 5️⃣ Ensure loader animation runs for at least MIN_LOADER_TIME
      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(0, MIN_LOADER_TIME - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log('Login successful! Redirecting...');
      
      // 6️⃣ Redirect after successful login
      window.location.href = '/feed';
    } catch (err) {
      // 7️⃣ Display readable error message
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      // 8️⃣ Stop loader only if login failed (success triggers redirect)
      if (error) setIsLoading(false);
    }
  };

  // ---------- UI Rendering ----------
  return (
    <div className="p-8 space-y-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center text-[rgb(180,30,30)]">
        Log In to Auto Connect
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <p className="text-sm font-medium text-red-500 bg-red-100 p-2 rounded">
            {error}
          </p>
        )}

        {/* Email field */}
        <div>
          <Label htmlFor="email" className="text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john.doe@example.com"
            className="border-gray-300 focus:ring-2 focus:ring-[rgb(180,30,30)]"
          />
        </div>

        {/* Password field */}
        <div>
          <Label htmlFor="password" className="text-gray-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="border-gray-300 focus:ring-2 focus:ring-[rgb(180,30,30)]"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-[rgb(180,30,30)] hover:bg-[rgb(150,25,25)] text-white font-semibold py-2 rounded-md transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Login'}
        </Button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-gray-500">
        Don’t have an account?{' '}
        <a
          href="/register"
          className="text-[rgb(180,30,30)] font-medium hover:underline"
        >
          Register here
        </a>
      </p>
    </div>
  );
};

export default LoginForm;

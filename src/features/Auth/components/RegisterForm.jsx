import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { registerUser, updateProfile } from '../services/authService';
import { ArrowLeft } from 'lucide-react';

const initialFormData = {
  name: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  whatsappNumber: '',
  dlNumber: '',
  fatherName: '',
  dateOfBirth: '',
  badgeNumber: '',
  address: '',
  bloodGroup: '',
  nomineeName: '',
  nomineeRelationship: '',
  nomineeContactNumber: '',
};

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(null);
  };

  const handleBasicRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.mobileNumber) {
      setError('Please fill in all basic required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const basicPayload = {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
      };

      const response = await registerUser(basicPayload);
      setUserId(response.id);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileCompletion = async (e, skip = false) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const profilePayload = {
        whatsappNumber: formData.whatsappNumber,
        dlNumber: formData.dlNumber,
        fatherName: formData.fatherName,
        dateOfBirth: formData.dateOfBirth,
        badgeNumber: formData.badgeNumber,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        nomineeName: formData.nomineeName,
        nomineeRelationship: formData.nomineeRelationship,
        nomineeContactNumber: formData.nomineeContactNumber,
      };

      if (skip) {
        setSuccess('Basic registration successful. You can log in while awaiting admin approval.');
      } else {
        await updateProfile(userId, profilePayload);
        setSuccess('Registration and profile submission successful! Awaiting admin approval.');
      }

      setStep(3);
    } catch (err) {
      setError(err.message || 'Profile update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleBasicRegister} className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              Step 1: Account Setup
            </h2>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john.doe@example.com"
                className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
              />
            </div>

            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="9876543210"
                className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#b41e1e] hover:bg-[#8c1616] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleProfileCompletion} className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              Step 2: Profile Details (Optional)
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Fill out these details now, or{' '}
              <span className="font-semibold text-[#b41e1e]">Skip for Now</span> to finish registration.
            </p>

            {/* Personal Info */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-medium text-[#b41e1e]">Personal Information</h3>
              {[
                'whatsappNumber',
                'dlNumber',
                'fatherName',
                'dateOfBirth',
                'address',
                'bloodGroup',
                'badgeNumber',
              ].map((field, idx) => (
                <div key={idx}>
                  <Label htmlFor={field}>
                    {field
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase())}
                  </Label>
                  <Input
                    id={field}
                    type={field === 'dateOfBirth' ? 'date' : 'text'}
                    value={formData[field]}
                    onChange={handleChange}
                    className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
                  />
                </div>
              ))}
            </div>

            {/* Nominee Info */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-medium text-[#b41e1e]">Nominee Information</h3>
              {[
                'nomineeName',
                'nomineeRelationship',
                'nomineeContactNumber',
              ].map((field, idx) => (
                <div key={idx}>
                  <Label htmlFor={field}>
                    {field
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase())}
                  </Label>
                  <Input
                    id={field}
                    type="text"
                    value={formData[field]}
                    onChange={handleChange}
                    className="border-gray-300 focus:ring-2 focus:ring-[#b41e1e]"
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#b41e1e] hover:bg-[#8c1616] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Submit Profile & Finish'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleProfileCompletion(e, true)}
              className="w-full border-[#b41e1e] text-[#b41e1e] hover:bg-[#b41e1e]/10"
              disabled={isLoading}
            >
              Skip for Now
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(1)}
              className="w-full text-sm text-[#b41e1e] hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back to Basic Info
            </Button>
          </form>
        );

      case 3:
        return (
          <div className="text-center p-6 space-y-4">
            <h2 className="text-2xl font-bold text-green-600">Success!</h2>
            <p className="text-lg">{success}</p>
            <p className="text-gray-600">You can now log in.</p>
            <Button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-[#b41e1e] hover:bg-[#8c1616] text-white font-semibold"
            >
              Go to Login
            </Button>
          </div>
        );

      default:
        return <div>Registration Flow Error</div>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Register for Auto Community
      </h1>
      <p className="text-center text-sm font-medium text-[#b41e1e]">
        Step {step} of 2
      </p>

      {error && (
        <p className="text-sm font-medium text-red-500 bg-red-100 p-2 rounded text-center">
          {error}
        </p>
      )}

      {renderStep()}

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-[#b41e1e] font-medium hover:underline">
          Login here
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;

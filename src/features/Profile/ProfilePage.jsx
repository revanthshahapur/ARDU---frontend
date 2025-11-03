// src/features/Profile/ProfilePage.jsx (Final Combined File)

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

// 🛑 UPDATED: Import all admin service functions
import { 
    getUserById, 
    uploadUserImage, 
    updateUser, 
    getAdminById,      // NEW
    updateAdmin,       // NEW
    uploadAdminImage   // NEW
} from "./services/profileService"; 
import { useAuth } from '../Auth/useAuth'; 

// =================================================================
// --- HELPERS & SHARED COMPONENTS ---
// =================================================================

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : 'N/A';

const DetailItem = ({ label, value }) => (
  <p className="border-b border-gray-100 py-2 last:border-b-0">
    <strong className="text-gray-600 w-1/3 inline-block font-medium">{label}:</strong>
    <span className="text-gray-800">{value}</span>
  </p>
);

const InputField = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      name={name}
      type={type}
      placeholder={type === 'date' && !value ? 'MM/DD/YYYY' : undefined}
      value={value || ''} 
      onChange={onChange}
      className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
    />
  </div>
);

// =================================================================
// --- NESTED EDIT FORM COMPONENT ---
// =================================================================

// 🛑 UPDATED: Now accepts userRole prop
const EditProfileForm = ({ profile, setProfile, setEditMode, userRole }) => {
  const [formData, setFormData] = useState({
    name: profile.username || profile.name || "",
    dlNumber: profile.dlNumber || "",
    fatherName: profile.fatherName || "",
    dateOfBirth: profile.dateOfBirth || "",
    badgeNumber: profile.badgeNumber || "",
    address: profile.address || "",
    bloodGroup: profile.bloodGroup || "",
    whatsappNumber: profile.whatsappNumber || "",
    password: "", 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = Object.keys(formData).reduce((acc, key) => {
        if (key === 'password' && formData.password.trim() === '') {
            return acc;
        }
        acc[key] = formData[key] === '' ? null : formData[key];
        return acc;
      }, {});
      
      // 🛑 CORE FIX: Select the correct update function based on role
      const isAdmin = userRole === 'ADMIN' || userRole === 'MAIN_ADMIN';
      const updateFunction = isAdmin ? updateAdmin : updateUser;

      const res = await updateFunction(profile.id, dataToSend); // Use the selected function
      setProfile(res);
      setEditMode(false); 
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile. Check console for details.");
    }
  };
  
  // Helper to check if the current user is an Admin
  const isCurrentUserAdmin = userRole === 'ADMIN' || userRole === 'MAIN_ADMIN';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg">
      <h3 className="text-xl font-semibold border-b pb-2 text-gray-800">Edit Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Name (Username)" name="name" value={formData.name} onChange={handleChange} />
        <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
        <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        <InputField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
        <InputField label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
        <InputField label="DL Number" name="dlNumber" value={formData.dlNumber} onChange={handleChange} />
        <InputField label="Badge Number" name="badgeNumber" value={formData.badgeNumber} onChange={handleChange} />
        <div></div> 
        
        <div className="md:col-span-2">
            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
        </div>
      </div>

      <h3 className="text-xl font-semibold border-b pb-2 text-gray-800 pt-4">Change Password</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField 
          label="New Password" 
          name="password" 
          type="password" 
          value={formData.password} 
          onChange={handleChange} 
        />
        <div className="self-end text-sm text-gray-500 p-2">
            (Leave blank if you don't want to change the password)
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition duration-150 shadow-lg"
      >
        Save All Changes
      </button>
    </form>
  );
};

// =================================================================
// --- MAIN PROFILE COMPONENT ---
// =================================================================

const ProfilePage = () => {
  const navigate = useNavigate(); 
  
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Helper to determine if the current user is an admin
  const isCurrentUserAdmin = user?.role === 'ADMIN' || user?.role === 'MAIN_ADMIN';

  // Function to handle navigation
  const handleBackToDashboard = () => {
    navigate('/dashboard'); 
  };

  // Fetch profile data
  useEffect(() => {
    if (user?.id) {
      // Try fetching admin profile for admins, but fall back to user endpoint if admin endpoint returns 404
      const fetchProfile = async () => {
        try {
          let data;
          if (isCurrentUserAdmin) {
            try {
              data = await getAdminById(user.id);
            } catch (err) {
              // If admin endpoint doesn't have this ID, try the users endpoint as a fallback
              if (err?.response?.status === 404) {
                console.warn(`Admin profile not found for id=${user.id}, falling back to users endpoint.`);
                data = await getUserById(user.id);
              } else {
                throw err;
              }
            }
          } else {
            data = await getUserById(user.id);
          }

          setProfile(data);
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };

      fetchProfile();
    }
  }, [user, isCurrentUserAdmin]); // Added isCurrentUserAdmin to dependency array

  // Handle image upload logic
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    
    // 🛑 CORE FIX 2: Conditional upload based on role
    const uploadFunction = isCurrentUserAdmin ? uploadAdminImage : uploadUserImage;
    
    try {
      const res = await uploadFunction(user.id, file); // Use the correct upload function
      setProfile((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };
  
  if (!profile) return <div className="text-center mt-10 text-xl font-semibold">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 sm:p-8 bg-white shadow-2xl rounded-2xl">
      
      {/* ⬅️ BACK TO DASHBOARD BUTTON */}z
      <button
        onClick={handleBackToDashboard}
        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-150 mb-6 px-3 py-1 rounded-lg border border-transparent hover:border-blue-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Your Profile</h1>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center border-b pb-6 mb-6">
        <img
          src={profile.imageUrl || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
        />
        <label className="mt-3 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-150">
          {uploading ? "Uploading..." : "Change Photo"}
          <input
            type="file"
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </label>
        <h2 className="text-3xl font-bold mt-4 text-gray-800">{profile.name}</h2>
        <p className="text-lg text-gray-600">{profile.email}</p>
        <p className="text-sm text-gray-400 mt-1">
          Role: <span className="font-semibold">{profile.role}</span> 
          {/* Only show approval status for non-admins (users) */}
          {!isCurrentUserAdmin && (
            <span> | Status: <span className={`font-semibold ${profile.approvalStatus === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>{profile.approvalStatus}</span></span>
          )}
        </p>
        
        <button
          onClick={() => setEditMode(!editMode)}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded-full transition duration-150 shadow-md"
        >
          {editMode ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      {editMode ? (
        // EDIT FORM MODE
        // 🛑 Pass the user role to the form for conditional update logic
        <EditProfileForm 
            profile={profile} 
            setProfile={setProfile} 
            setEditMode={setEditMode} 
            userRole={user.role} // Pass the role
        />
      ) : (
        // VIEW MODE (Detailed Information)
        <div className="grid grid-cols-1 gap-8 text-gray-700">
          
          {/* PERSONAL DETAILS */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
              <DetailItem label="Mobile Number" value={profile.mobileNumber} />
              <DetailItem label="WhatsApp Number" value={profile.whatsappNumber || 'N/A'} />
              <DetailItem label="Father's Name" value={profile.fatherName || 'N/A'} />
              <DetailItem label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
              <DetailItem label="Blood Group" value={profile.bloodGroup || 'N/A'} />
              <DetailItem label="DL Number" value={profile.dlNumber || 'N/A'} />
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-gray-600 font-medium">Address:</p>
              <p className="text-gray-800 ml-2">{profile.address || 'N/A'}</p>
            </div>
          </div>
          
          {/* ASSOCIATION DETAILS (Only display for regular users, not Admins) */}
          {!isCurrentUserAdmin && (
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">Association Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                <DetailItem label="Badge Number" value={profile.badgeNumber || 'N/A'} />
                <DetailItem label="Active Status" value={profile.active ? 'Active' : 'Inactive'} />
                <DetailItem label="Date of Joining" value={formatDate(profile.dateOfJoiningOrRenewal)} />
                <DetailItem label="Expiry Date" value={formatDate(profile.expiryDate)} />
              </div>
            </div>
          )}
          
          {/* NOMINEE DETAILS (Only display for regular users, not Admins) */}
          {!isCurrentUserAdmin && (
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">Nominee Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                <DetailItem label="Nominee Name" value={profile.nomineeName || 'N/A'} />
                <DetailItem label="Relationship" value={profile.nomineeRelationship || 'N/A'} />
                <DetailItem label="Nominee Contact" value={profile.nomineeContactNumber || 'N/A'} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
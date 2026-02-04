import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import apiUrl from '../config/api';
import { Edit } from 'lucide-react';

const Profile = ({ user, updateUser }) => {
  const { theme } = useTheme();
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProfileImageUrl(user.profileImageUrl);
  }, [user.profileImageUrl]);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const endpoint = user.role === 'patient'
        ? `/api/patients/${user.id}/upload-photo`
        : `/api/employees/${user.id}/upload-photo`;

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setProfileImageUrl(data.profileImageUrl);
        updateUser({ profileImageUrl: data.profileImageUrl }); // Update global user state
        alert('Profile picture updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile picture.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to connect to the server or upload picture.');
    }
  };

  return (
    <div className={`p-8 font-sans min-h-full transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Profile</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 group mb-4">
            <img
              src={profileImageUrl ? `${apiUrl('')}${profileImageUrl}` : `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1c1c1e&color=a0a0a0&bold=true`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="w-8 h-8 text-white" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
          <p className="text-lg text-muted-foreground">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            {user.role === 'patient' ? (
              <>
                <p><strong>MRN:</strong> {user.mrn || 'N/A'}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </>
            ) : (
              <>
                <p><strong>Employee ID:</strong> {user.employeeId}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Department:</strong> {user.departmentName || 'N/A'}</p>
                <p><strong>Hire Date:</strong> {user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A'}</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

import React, { useState } from 'react';
import PatientLogin from '../components/auth/PatientLogin';
import PatientRegister from '../components/auth/PatientRegister';
import ForgotPassword from '../components/auth/ForgotPassword';

const PatientAuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot_password'

  const renderAuthComponent = () => {
    switch (authMode) {
      case 'login':
        return <PatientLogin onLogin={onLogin} setAuthMode={setAuthMode} />;
      case 'register':
        return <PatientRegister setAuthMode={setAuthMode} />;
      case 'forgot_password':
        return <ForgotPassword setAuthMode={setAuthMode} userType="patient" />;
      default:
        return <PatientLogin onLogin={onLogin} setAuthMode={setAuthMode} />;
    }
  };

  return (
    <div>
      {renderAuthComponent()}
    </div>
  );
};

export default PatientAuthPage;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// استيراد المكونات
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Translate from './components/Translate';
import TextTools from './components/TextTools';
import History from './components/History';
import Account from './components/Account';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/tools" element={<TextTools />} />
        <Route path="/history" element={<History />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
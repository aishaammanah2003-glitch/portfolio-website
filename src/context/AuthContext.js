// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            // تحميل المستخدم من localStorage بطريقة آمنة
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            
            // التحقق من أن القيم موجودة وليست undefined
            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            }
            
            if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
                setToken(storedToken);
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
            // تنظيف localStorage في حالة وجود بيانات فاسدة
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData, authToken) => {
        try {
            setUser(userData);
            setToken(authToken);
            
            // حفظ في localStorage
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
            if (authToken) {
                localStorage.setItem('token', authToken);
            }
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        token,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const Account = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // جلب البريد الإلكتروني من localStorage
    useEffect(() => {
        try {
            // محاولة جلب المستخدم من localStorage
            const userData = localStorage.getItem('user');
            if (userData && userData !== 'undefined') {
                const user = JSON.parse(userData);
                if (user.email) {
                    setEmail(user.email);
                    console.log('Email loaded:', user.email);
                }
            }
            
            // إذا لم يجد، جرب من token
            if (!email) {
                const token = localStorage.getItem('token');
                if (token) {
                    // جلب معلومات المستخدم من API
                    fetchUserData(token);
                }
            }
        } catch (error) {
            console.error('Error loading email:', error);
        }
    }, []);

    // دالة لجلب بيانات المستخدم
    const fetchUserData = async (token) => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.email) {
                setEmail(response.data.email);
                // حفظ في localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
        setPassword('');
        setErrors({});
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPassword('');
        setErrors({});
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        
        setErrors({});
        
        if (!email) {
            setErrors({ auth: 'البريد الإلكتروني مطلوب' });
            return;
        }
        
        if (!password || password.length < 6) {
            setErrors({ password: 'كلمة المرور مطلوبة (6 أحرف على الأقل)' });
            return;
        }

        setLoading(true);

        try {
            // تسجيل الدخول للتحقق
            const loginResponse = await axios.post('http://127.0.0.1:8000/api/login', {
                email: email.trim(),
                password: password
            });

            console.log('Login response:', loginResponse.data);

            if (loginResponse.data.token && loginResponse.data.user) {
                const userId = loginResponse.data.user.id;
                
                console.log('Deleting user ID:', userId);
                
                // حذف المستخدم
                const deleteResponse = await axios.delete(
                    `http://127.0.0.1:8000/api/user/delete/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${loginResponse.data.token}`
                        }
                    }
                );

                console.log('Delete response:', deleteResponse);

                if (deleteResponse.status === 200 || deleteResponse.status === 204) {
                    alert('تم حذف الحساب بنجاح!');
                    // تنظيف localStorage
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    navigate('/');
                } else {
                    setErrors({ auth: 'فشل حذف الحساب' });
                }
            }
        } catch (err) {
            console.error('Error:', err);
            if (err.response?.status === 401) {
                setErrors({ auth: 'كلمة المرور غير صحيحة' });
            } else if (err.response?.status === 404) {
                setErrors({ auth: 'المستخدم غير موجود' });
            } else {
                setErrors({ auth: 'حدث خطأ. تأكد من البريد وكلمة المرور' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            
            <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '20px' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: '#667eea',
                        padding: '30px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h1 style={{ margin: 0 }}>إعدادات الحساب</h1>
                    </div>

                    <div style={{ padding: '30px' }}>
                        <div style={{
                            background: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '5px',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>معلومات الحساب</h3>
                            <p style={{ margin: 0, fontSize: '16px' }}>
                                <strong>البريد الإلكتروني:</strong> {email || 'جاري التحميل...'}
                            </p>
                        </div>

                        <div style={{
                            border: '2px solid #ff4444',
                            borderRadius: '5px',
                            background: '#fff5f5'
                        }}>
                            <div style={{
                                background: '#ff4444',
                                color: 'white',
                                padding: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '20px' }}>⚠️</span>
                                <h2 style={{ margin: 0, fontSize: '18px' }}>منطقة الخطر</h2>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ color: '#ff4444', fontWeight: 'bold' }}>
                                    ⚠️ تحذير: هذا الإجراء دائم ولا يمكن التراجع عنه!
                                </p>
                                <p style={{ color: '#666', marginBottom: '20px' }}>
                                    سيؤدي حذف حسابك إلى إزالة جميع بياناتك
                                </p>
                                <button 
                                    onClick={openDeleteModal}
                                    style={{
                                        background: '#ff4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    🗑️ حذف الحساب
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal التأكيد */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={closeDeleteModal}>
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            background: '#667eea',
                            padding: '20px',
                            color: 'white',
                            borderRadius: '10px 10px 0 0'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>تأكيد حذف الحساب</h2>
                        </div>
                        
                        <form onSubmit={handleDeleteAccount} style={{ padding: '20px' }}>
                            <p style={{ 
                                textAlign: 'center', 
                                marginBottom: '20px',
                                color: '#666',
                                background: '#f8f9fa',
                                padding: '10px',
                                borderRadius: '5px'
                            }}>
                                أدخل كلمة المرور لتأكيد حذف الحساب
                            </p>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    📧 البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        background: '#f5f5f5',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    🔒 كلمة المرور
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({});
                                        }}
                                        placeholder="أدخل كلمة المرور"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: `1px solid ${errors.password ? '#ff4444' : '#ddd'}`,
                                            borderRadius: '5px',
                                            fontSize: '14px',
                                            paddingRight: '35px'
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px' }}>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {errors.auth && (
                                <div style={{
                                    background: '#fff5f5',
                                    padding: '10px',
                                    marginBottom: '20px',
                                    borderRadius: '5px',
                                    color: '#ff4444',
                                    borderRight: '3px solid #ff4444'
                                }}>
                                    ⚠️ {errors.auth}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#f0f0f0',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
                                    onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: loading ? '#cc0000' : '#ff4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'جاري الحذف...' : '🗑️ حذف الحساب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;
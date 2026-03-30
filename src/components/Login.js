import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('API Error:', error.response.data);
            return Promise.reject(error);
        } else if (error.request) {
            console.error('No response from server');
            return Promise.reject(new Error('Server is not responding'));
        } else {
            console.error('Request error:', error.message);
            return Promise.reject(error);
        }
    }
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState('en');
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const texts = {
        en: {
            title: "Welcome Back",
            subtitle: "Continue your translation journey",
            email: "Email Address",
            emailPlaceholder: "Enter your email",
            password: "Password",
            passwordPlaceholder: "Enter your password",
            login: "Sign In",
            logging: "Signing in...",
            signup: "Don't have an account?",
            signupLink: "Create Account",
            forgot: "Forgot password?",
            emailError: "Valid email is required",
            passwordError: "Password is required (minimum 6 characters)",
            authError: "Invalid credentials. Please try again.",
            success: "Login successful! Redirecting...",
            serverError: "Server error. Please try again later.",
            networkError: "Network error. Please check your connection."
        },
        ar: {
            title: "مرحباً بعودتك",
            subtitle: "واصل رحلة الترجمة الخاصة بك",
            email: "البريد الإلكتروني",
            emailPlaceholder: "أدخل بريدك الإلكتروني",
            password: "كلمة المرور",
            passwordPlaceholder: "أدخل كلمة المرور",
            login: "تسجيل الدخول",
            logging: "جاري تسجيل الدخول...",
            signup: "ليس لديك حساب؟",
            signupLink: "إنشاء حساب",
            forgot: "نسيت كلمة المرور؟",
            emailError: "يرجى إدخال بريد إلكتروني صالح",
            passwordError: "كلمة المرور مطلوبة (6 أحرف على الأقل)",
            authError: "بيانات الدخول غير صحيحة. يرجى المحاولة مجدداً.",
            success: "✅ تم تسجيل الدخول بنجاح! جاري التوجيه...",
            serverError: "خطأ في الخادم. يرجى المحاولة لاحقاً.",
            networkError: "خطأ في الشبكة. يرجى التحقق من الاتصال."
        }
    };

    const t = texts[lang];
    const isRTL = lang === 'ar';

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        document.body.dir = isRTL ? 'rtl' : 'ltr';
        localStorage.setItem('lang', lang);
    }, [lang, isRTL]);

    useEffect(() => {
        const savedLang = localStorage.getItem('lang');
        if (savedLang === 'ar' || savedLang === 'en') {
            setLang(savedLang);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = t.emailError;
        }
        if (!password || password.length < 6) {
            newErrors.password = t.passwordError;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/login', {
                email: email.trim(),
                password: password
            });

            console.log('Login response:', response.data);

            const { user, token, message } = response.data;

            // استخدام دالة login من Context
            login(user, token);

            alert(message || t.success);
            navigate('/home');
            
        } catch (err) {
            console.error('Login error details:', err);
            
            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                
                if (status === 401) {
                    setErrors({ auth: t.authError });
                } else if (status === 422) {
                    if (errorData.errors) {
                        const validationErrors = {};
                        if (errorData.errors.email) validationErrors.email = errorData.errors.email[0];
                        if (errorData.errors.password) validationErrors.password = errorData.errors.password[0];
                        setErrors(validationErrors);
                    } else {
                        setErrors({ auth: errorData.message || t.authError });
                    }
                } else if (status === 429) {
                    setErrors({ auth: lang === 'ar' ? 'محاولات كثيرة. يرجى المحاولة لاحقاً' : 'Too many attempts. Please try later' });
                } else {
                    setErrors({ auth: errorData.message || t.serverError });
                }
            } else if (err.request) {
                setErrors({ auth: t.networkError });
            } else {
                setErrors({ auth: t.serverError });
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleLang = () => {
        setLang(prev => prev === 'en' ? 'ar' : 'en');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="login-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
            
            <div className="animated-bg">
                <div className="particles">
                    {[...Array(20)].map((_, i) => (
                        <span 
                            key={i} 
                            className="particle" 
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`,
                                width: `${2 + Math.random() * 4}px`,
                                height: `${2 + Math.random() * 4}px`,
                            }} 
                        />
                    ))}
                </div>
                <div className="gradient-overlay" />
                <div className="stars" />
            </div>

            <button 
                className="lang-toggle floating-btn" 
                onClick={toggleLang}
                title={lang === 'en' ? 'Switch to Arabic' : 'التبديل للإنجليزية'}
                aria-label="Toggle Language"
            >
                <i className={`fas fa-${lang === 'en' ? 'language' : 'globe'}`} />
                <span className="lang-label">{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <div className="login-container">
                <div className="login-card glass-effect">
                    
                    <Link to="/" className="logo-link">
                        <div className="logo-section">
                            <div className="logo-icon pulse">
                                <i className="fas fa-language" />
                                <span className="logo-glow" />
                            </div>
                            <h1 className="logo-text shimmer-text">
                                Lingua<span className="highlight">Pro</span>
                            </h1>
                        </div>
                    </Link>
                    
                    <h2 className="login-title shimmer-text">{t.title}</h2>
                    <p className="login-subtitle fade-in">{t.subtitle}</p>
                    
                    <form onSubmit={handleSubmit} className="login-form" noValidate>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                <i className="fas fa-envelope" /> {t.email}
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    id="email"
                                    className={`form-input ${errors.email ? 'error shake' : ''}`}
                                    placeholder={t.emailPlaceholder}
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value && !/^\S+@\S+\.\S+$/.test(e.target.value)) {
                                            setErrors(prev => ({ ...prev, email: t.emailError }));
                                        }
                                    }}
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <i className="fas fa-exclamation-circle input-error-icon" />
                                )}
                            </div>
                            {errors.email && (
                                <p className="error-msg fade-in">
                                    <i className="fas fa-circle-exclamation" /> {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                <i className="fas fa-lock" /> {t.password}
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    id="password"
                                    className={`form-input ${errors.password ? 'error shake' : ''}`}
                                    placeholder={t.passwordPlaceholder}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                    }}
                                    autoComplete="current-password"
                                    required
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    disabled={loading}
                                >
                                    <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} />
                                </button>
                            </div>
                            {errors.password && (
                                <p className="error-msg fade-in">
                                    <i className="fas fa-circle-exclamation" /> {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="forgot-wrapper">
                            <a href="#forgot" className="forgot-link" onClick={(e) => {
                                e.preventDefault();
                                alert(lang === 'ar' ? 'سيتم إرسال رابط الاستعادة لبريدك' : 'Reset link will be sent to your email');
                            }}>
                                <i className="fas fa-key" /> {t.forgot}
                            </a>
                        </div>

                        {errors.auth && (
                            <div className="error-banner shimmer-bg fade-in">
                                <i className="fas fa-triangle-exclamation" /> 
                                <span>{errors.auth}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={`submit-btn shimmer-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader-spinner" />
                                    <span className="btn-text">{t.logging}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-right-to-bracket" /> 
                                    <span className="btn-text">{t.login}</span>
                                    <i className="fas fa-arrow-right arrow-icon" />
                                </>
                            )}
                            <span className="btn-glow" />
                        </button>

                        <div className="form-footer">
                            <p className="login-prompt">
                                {t.signup}{' '}
                                <button 
                                    type="button" 
                                    className="login-link nav-link"
                                    onClick={() => navigate('/signup')}
                                    disabled={loading}
                                >
                                    {t.signupLink}
                                </button>
                            </p>
                        </div>
                    </form>

                    <div className="social-login">
                        <p className="divider-text">
                            <span>{lang === 'ar' ? 'أو سجل الدخول عبر' : 'Or sign in with'}</span>
                        </p>
                        <div className="social-buttons">
                            <button type="button" className="social-btn google" aria-label="Sign in with Google">
                                <i className="fab fa-google" />
                            </button>
                            <button type="button" className="social-btn github" aria-label="Sign in with GitHub">
                                <i className="fab fa-github" />
                            </button>
                            <button type="button" className="social-btn apple" aria-label="Sign in with Apple">
                                <i className="fab fa-apple" />
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <div className="glow-effect glow-1" />
            <div className="glow-effect glow-2" />
        </div>
    );
};

export default Login;
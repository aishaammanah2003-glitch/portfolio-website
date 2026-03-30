import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordR, setPasswordR] = useState('');
    const [accept, setAccept] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [lang, setLang] = useState('en');
    
    const navigate = useNavigate();
    const { login } = useAuth(); // إضافة useAuth

    // نصوص متعددة اللغات
    const texts = {
        en: {
            title: "Join LinguaPro",
            subtitle: "Translate the world, one word at a time",
            name: "Full Name",
            namePlaceholder: "Enter your full name",
            email: "Email Address",
            emailPlaceholder: "Enter your email",
            password: "Password",
            passwordPlaceholder: "Create a strong password",
            confirm: "Confirm Password",
            confirmPlaceholder: "Repeat your password",
            register: "Create Account",
            registering: "Creating Account...",
            login: "Already have an account?",
            loginLink: "Sign In",
            terms: "By registering, you agree to our",
            termsLink: "Terms & Privacy Policy",
            nameError: "Full name is required",
            emailError: "Valid email is required",
            emailTaken: "This email is already registered",
            passwordError: "Password must be at least 8 characters",
            matchError: "Passwords do not match",
            serverError: "Registration failed. Please try again."
        },
        ar: {
            title: "انضم إلى لينجوا برو",
            subtitle: "ترجم العالم، كلمة بكلمة",
            name: "الاسم الكامل",
            namePlaceholder: "أدخل اسمك الكامل",
            email: "البريد الإلكتروني",
            emailPlaceholder: "أدخل بريدك الإلكتروني",
            password: "كلمة المرور",
            passwordPlaceholder: "أنشئ كلمة مرور قوية",
            confirm: "تأكيد كلمة المرور",
            confirmPlaceholder: "أعد إدخال كلمة المرور",
            register: "إنشاء حساب",
            registering: "جاري إنشاء الحساب...",
            login: "لديك حساب بالفعل؟",
            loginLink: "تسجيل الدخول",
            terms: "بالتسجيل، أنت توافق على",
            termsLink: "الشروط وسياسة الخصوصية",
            nameError: "الاسم الكامل مطلوب",
            emailError: "يرجى إدخال بريد إلكتروني صالح",
            emailTaken: "هذا البريد الإلكتروني مسجل مسبقاً",
            passwordError: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
            matchError: "كلمتا المرور غير متطابقتين",
            serverError: "فشل التسجيل. يرجى المحاولة لاحقاً."
        }
    };

    const t = texts[lang];
    const isRTL = lang === 'ar';

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang, isRTL]);

    async function submit(e) {
        e.preventDefault();
        setAccept(true);
        setErrors({});
        setEmailError("");

        // التحقق المحلي
        const newErrors = {};
        if (name.trim() === "") newErrors.name = t.nameError;
        if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = t.emailError;
        if (password.length < 8) newErrors.password = t.passwordError;
        if (passwordR !== password) newErrors.passwordR = t.matchError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // إرسال البيانات إلى Laravel API
            const response = await axios.post("http://127.0.0.1:8000/api/register", {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordR
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log("✅ Success:", response.data);
            
            // استخراج بيانات المستخدم والتوكن من الاستجابة
            const { user, token, message } = response.data;
            
            // استخدام دالة login من Context لتسجيل الدخول تلقائياً بعد التسجيل
            if (user && token) {
                login(user, token);
            } else {
                // إذا لم يكن هناك توكن، نقوم بحفظ بيانات المستخدم فقط
                login(user);
            }
            
            // عرض رسالة نجاح
            alert(message || (lang === 'ar' ? "✅ تم التسجيل بنجاح!" : "✅ Registration successful!"));
            
            // التوجيه إلى الصفحة الرئيسية مباشرة
            navigate('/home');
            
        } catch (err) {
            console.error("❌ Error:", err);
            
            if (err.response) {
                if (err.response.status === 422) {
                    const validationErrors = err.response.data.errors;
                    if (validationErrors.email) {
                        setEmailError(t.emailTaken);
                    }
                    if (validationErrors.name) {
                        setErrors({ ...errors, name: validationErrors.name[0] });
                    }
                    if (validationErrors.password) {
                        setErrors({ ...errors, password: validationErrors.password[0] });
                    }
                } else if (err.response.status === 500) {
                    setErrors({ server: "Server error. Please try again later." });
                } else {
                    setErrors({ server: t.serverError });
                }
            } else if (err.request) {
                setErrors({ server: "Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000" });
            } else {
                setErrors({ server: t.serverError });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signup-wrapper">
            {/* خلفية متحركة */}
            <div className="animated-bg">
                <div className="particles">
                    {[...Array(20)].map((_, i) => (
                        <span key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }} />
                    ))}
                </div>
                <div className="gradient-overlay" />
            </div>

            {/* أيقونات عائمة */}
            <div className="floating-icons">
                <i className="fas fa-language float-icon icon-1" />
                <i className="fas fa-globe-americas float-icon icon-2" />
                <i className="fas fa-comments float-icon icon-3" />
                <i className="fas fa-translate float-icon icon-4" />
            </div>

            {/* زر تبديل اللغة */}
            <button 
                className="lang-toggle" 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                aria-label="Toggle language"
            >
                <i className={`fas fa-${lang === 'en' ? 'language' : 'globe'}`} />
                {lang === 'en' ? 'العربية' : 'English'}
            </button>

            <div className="signup-container">
                <div className="signup-card glass-effect">
                    
                    {/* شعار الموقع */}
                    <div className="logo-section">
                        <div className="logo-icon">
                            <i className="fas fa-language" />
                        </div>
                        <h1 className="logo-text">Lingua<span className="highlight">Pro</span></h1>
                    </div>
                    
                    <h2 className="signup-title shimmer-text">{t.title}</h2>
                    <p className="signup-subtitle">{t.subtitle}</p>
                    
                    <form onSubmit={submit} className="signup-form">
                        
                        {/* حقل الاسم */}
                        <div className="form-group">
                            <label htmlFor='name' className="form-label">
                                <i className="fas fa-user" /> {t.name}
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    id='name'
                                    className={`form-input ${errors.name && accept ? 'error' : ''}`}
                                    placeholder={t.namePlaceholder}
                                    type='text'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <i className="fas fa-check check-icon" />
                            </div>
                            {errors.name && accept && <p className="error-msg shake">{errors.name}</p>}
                        </div>

                        {/* حقل الإيميل */}
                        <div className="form-group">
                            <label htmlFor='email' className="form-label">
                                <i className="fas fa-envelope" /> {t.email}
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    id='email' 
                                    className={`form-input ${errors.email || emailError ? 'error' : ''}`}
                                    placeholder={t.emailPlaceholder} 
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <i className="fas fa-check check-icon" />
                            </div>
                            {emailError && <p className="error-msg shake">{emailError}</p>}
                            {errors.email && <p className="error-msg shake">{errors.email}</p>}
                        </div>

                        {/* حقل كلمة المرور */}
                        <div className="form-group">
                            <label htmlFor='password' className="form-label">
                                <i className="fas fa-lock" /> {t.password}
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    id='password' 
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder={t.passwordPlaceholder} 
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <i className="fas fa-eye toggle-pass" 
                                   onClick={(e) => {
                                       const input = e.target.previousSibling;
                                       input.type = input.type === 'password' ? 'text' : 'password';
                                       e.target.classList.toggle('fa-eye-slash');
                                   }} 
                                />
                            </div>
                            {errors.password && <p className="error-msg shake">{errors.password}</p>}
                        </div>

                        {/* حقل تأكيد كلمة المرور */}
                        <div className="form-group">
                            <label htmlFor='passwordR' className="form-label">
                                <i className="fas fa-lock" /> {t.confirm}
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    id='passwordR'
                                    className={`form-input ${errors.passwordR ? 'error' : ''}`}
                                    placeholder={t.confirmPlaceholder} 
                                    type='password'
                                    value={passwordR}
                                    onChange={(e) => setPasswordR(e.target.value)}
                                />
                                {passwordR && (
                                    <i className={`fas ${passwordR === password ? 'fa-check-circle valid' : 'fa-times-circle invalid'}`} />
                                )}
                            </div>
                            {errors.passwordR && <p className="error-msg shake">{errors.passwordR}</p>}
                        </div>

                        {/* عرض أخطاء السيرفر */}
                        {errors.server && (
                            <p className="error-msg server-error shimmer-bg">
                                <i className="fas fa-exclamation-triangle" /> {errors.server}
                            </p>
                        )}

                        {/* زر التسجيل مع أنيميشن */}
                        <button 
                            type='submit' 
                            className={`submit-btn shimmer-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader" />
                                    {t.registering}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sparkles" /> {t.register}
                                    <i className="fas fa-arrow-right arrow-icon" />
                                </>
                            )}
                        </button>

                        {/* روابط إضافية */}
                        <div className="form-footer">
                            <p className="terms-text">
                                {t.terms} <a href="#terms" className="terms-link">{t.termsLink}</a>
                            </p>
                            <p className="login-prompt">
                                {t.login}{' '}
                                <button 
                                    type="button" 
                                    className="login-link nav-link"
                                    onClick={() => navigate('/login')}
                                >
                                    {t.loginLink}
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* مؤشرات الثقة */}
                    <div className="trust-badges">
                        <span><i className="fas fa-shield-alt" /> SSL Secure</span>
                        <span><i className="fas fa-users" /> 50K+ Users</span>
                        <span><i className="fas fa-star" /> 4.9 Rating</span>
                    </div>
                </div>
            </div>

            {/* تأثيرات إضافية */}
            <div className="glow-effect" />
        </div>
    );
};

export default Signup;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [activeItem, setActiveItem] = useState('home');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [lang, setLang] = useState('en');
    const [scrolled, setScrolled] = useState(false);
    
    const { user, logout } = useAuth();
    const location = useLocation();
    const userMenuRef = useRef(null);

    // تحميل اللغة عند البدء
    useEffect(() => {
        const savedLang = localStorage.getItem('lang');
        if (savedLang === 'ar' || savedLang === 'en') {
            setLang(savedLang);
            applyLanguage(savedLang);
        }
    }, []);

    useEffect(() => { 
        applyLanguage(lang); 
    }, [lang]);

    const applyLanguage = (language) => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.body.lang = language;
        localStorage.setItem('lang', language);
    };

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('translate')) setActiveItem('translate');
        else if (path.includes('tools')) setActiveItem('tools');
        else if (path.includes('history')) setActiveItem('history');
        else if (path.includes('account')) setActiveItem('account');
        else setActiveItem('home');
    }, [location]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getLabels = (language) => {
        if (language === 'ar') {
            return {
                home: 'الرئيسية', 
                translate: 'ترجمة', 
                tools: 'أدوات النصوص', 
                history: 'السجل', 
                account: 'حسابي',
                profile: 'ملفي الشخصي', 
                settings: 'الإعدادات', 
                billing: 'الفواتير', 
                logout: 'تسجيل الخروج',
                langToggle: 'En', 
                langTitle: 'English', 
                guest: 'زائر'
            };
        }
        return {
            home: 'Home', 
            translate: 'Translate', 
            tools: 'Text Tools', 
            history: 'History', 
            account: 'Account',
            profile: 'My Profile', 
            settings: 'Settings', 
            billing: 'Billing', 
            logout: 'Sign Out',
            langToggle: 'عربي', 
            langTitle: 'العربية', 
            guest: 'Guest'
        };
    };

    const labels = getLabels(lang);

    const navItems = [
        { id: 'home', icon: 'fa-house', label: labels.home, path: '/home' },
        { id: 'translate', icon: 'fa-language', label: labels.translate, path: '/translate' },
        { id: 'tools', icon: 'fa-wand-magic-sparkles', label: labels.tools, path: '/tools' },
        { id: 'history', icon: 'fa-clock-rotate-left', label: labels.history, path: '/history' },
        { id: 'account', icon: 'fa-user', label: labels.account, path: '/account' },
    ];

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        window.location.href = '/login';
    };

    const closeUserMenu = () => setShowUserMenu(false);
    const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                
                {/* الشعار */}
                <Link to="/home" className="navbar-brand" onClick={closeUserMenu}>
                    <div className="logo-wrapper">
                        <div className="logo-glow-ring" />
                        <div className="logo-icon">
                            <i className="fas fa-language" />
                        </div>
                        <span className="logo-text">
                            Lingua<span className="logo-accent">Pro</span>
                        </span>
                    </div>
                </Link>

                {/* قائمة التنقل */}
                <div className="navbar-menu">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`nav-link ${activeItem === item.id ? 'active' : ''}`}
                            onClick={closeUserMenu}
                        >
                            <span className="nav-icon-wrapper">
                                <i className={`fas ${item.icon} nav-icon`} />
                                <span className="nav-icon-glow" />
                            </span>
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-indicator" />
                        </Link>
                    ))}
                </div>

                {/* أدوات الجانب الأيمن */}
                <div className="navbar-actions">
                    
                    {/* زر اللغة */}
                    <button 
                        className="lang-toggle-btn"
                        onClick={toggleLang}
                        title={labels.langTitle}
                        type="button"
                        aria-label="Toggle Language"
                    >
                        <span className="lang-icon">
                            <i className={`fas fa-${lang === 'en' ? 'language' : 'globe'}`} />
                        </span>
                        <span className="lang-label">{labels.langToggle}</span>
                        <span className="lang-glow" />
                    </button>

                    {/* قائمة المستخدم - تظهر فقط للمسجلين */}
                    {user && (
                        <div className="user-section" ref={userMenuRef}>
                            <button 
                                className="user-trigger"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                type="button"
                                aria-expanded={showUserMenu}
                            >
                                <div className="user-avatar-wrapper">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="user-avatar" />
                                    ) : (
                                        <div className="user-avatar-placeholder">
                                            <i className="fas fa-user" />
                                        </div>
                                    )}
                                    <span className="user-status" />
                                </div>
                                <span className="user-name">{user.name?.split(' ')[0] || labels.guest}</span>
                                <i className={`fas fa-chevron-down user-arrow ${showUserMenu ? 'rotated' : ''}`} />
                            </button>

                            {/* القائمة المنسدلة */}
                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="avatar" />
                                            ) : (
                                                <i className="fas fa-user" />
                                            )}
                                        </div>
                                        <div className="dropdown-info">
                                            <p className="dropdown-name">{user.name || labels.guest}</p>
                                            <p className="dropdown-email">{user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="dropdown-divider" />
                                    
                                    <Link to="/account" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                        <i className="fas fa-user-circle" />
                                        <span>{labels.profile}</span>
                                    </Link>
                                    
                                    <Link to="/account/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                        <i className="fas fa-cog" />
                                        <span>{labels.settings}</span>
                                    </Link>
                                    
                                    <div className="dropdown-divider" />
                                    
                                    <button className="dropdown-item logout" onClick={handleLogout} type="button">
                                        <i className="fas fa-sign-out-alt" />
                                        <span>{labels.logout}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
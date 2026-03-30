import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('ar');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ النصوص للكتابة التلقائية
  const typingPhrases = {
    ar: ['ترجمة فورية', 'تصحيح ذكي', 'خصوصية كاملة', 'بدون تسجيل'],
    en: ['Instant Translation', 'Smart Correction', 'Full Privacy', 'No Sign-up'],
  };

  // ✅ تحميل اللغة
  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'ar' || savedLang === 'en') {
      setLang(savedLang);
    }
    // إخفاء شاشة التحميل
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // ✅ تتبع الماوس
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // تأثير البارالاكس
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.02;
        const x = (e.clientX - window.innerWidth / 2) * speed;
        const y = (e.clientY - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ✅ تأثير الكتابة التلقائية
  useEffect(() => {
    const phrases = typingPhrases[lang];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    const type = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        setTypedText(currentPhrase.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedText(currentPhrase.substring(0, charIndex + 1));
        charIndex++;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        timeout = setTimeout(() => { isDeleting = true; type(); }, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeout = setTimeout(type, 500);
      } else {
        timeout = setTimeout(type, isDeleting ? 30 : 70);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [lang]);

  // ✅ تتبع التمرير
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollProgress((scrolled / maxScroll) * 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ تدوير الميزات تلقائيًا
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ✅ المحتوى حسب اللغة
  const content = {
    ar: {
      brand: 'LinguaPro',
      heroTitle: 'الذكاء الاصطناعي',
      heroSubtitle: 'لترجمة وتصحيح نصوصك',
      ctaTranslate: 'ابدأ الترجمة',
      ctaTools: 'صحّح نصوصك',
      features: [
        { 
          icon: 'fa-bolt', 
          title: 'سرعة فائقة', 
          desc: 'ترجمة فورية في أجزاء من الثانية باستخدام أحدث تقنيات الذكاء الاصطناعي',
          color: '#8b5cf6'
        },
        { 
          icon: 'fa-shield-check', 
          title: 'خصوصية مطلقة', 
          desc: 'نصوصك تُعالج محليًا ولا تُرسل لأي خادم خارجي - أمان كامل لبياناتك',
          color: '#22c55e'
        },
        { 
          icon: 'fa-wand-magic', 
          title: 'دقة احترافية', 
          desc: 'تصحيح تلقائي للأخطاء الإملائية والنحوية مع اقتراحات ذكية للتحسين',
          color: '#ec4899'
        },
      ],
      stats: [
        { value: '99.7%', label: 'دقة الترجمة', icon: 'fa-check-circle' },
        { value: '<0.3s', label: 'وقت الاستجابة', icon: 'fa-stopwatch' },
        { value: '100%', label: 'تشفير البيانات', icon: 'fa-lock' },
        { value: '∞', label: 'استخدام مجاني', icon: 'fa-gift' },
      ],
      testimonials: [
        { name: 'أحمد م.', role: 'مطور ويب', text: 'أفضل أداة ترجمة استخدمتها على الإطلاق!' },
        { name: 'سارة ك.', role: 'كاتبة محتوى', text: 'التصحيح التلقائي وفر عليّ ساعات من المراجعة' },
        { name: 'محمد ر.', role: 'طالب دراسات', text: 'ساعدني في أبحاثي الدولية بشكل مذهل' },
      ],
      footer: 'صُنع بـ ❤️ في سوريا للمجتمع العالمي',
    },
    en: {
      brand: 'LinguaPro',
      heroTitle: 'AI-Powered',
      heroSubtitle: 'Translation & Text Correction',
      ctaTranslate: 'Start Translating',
      ctaTools: 'Fix Your Text',
      features: [
        { 
          icon: 'fa-bolt', 
          title: 'Lightning Fast', 
          desc: 'Instant translations in milliseconds using cutting-edge AI technology',
          color: '#8b5cf6'
        },
        { 
          icon: 'fa-shield-check', 
          title: 'Total Privacy', 
          desc: 'Your texts are processed locally, never sent to external servers',
          color: '#22c55e'
        },
        { 
          icon: 'fa-wand-magic', 
          title: 'Professional Accuracy', 
          desc: 'Auto-correct spelling & grammar with intelligent improvement suggestions',
          color: '#ec4899'
        },
      ],
      stats: [
        { value: '99.7%', label: 'Translation Accuracy', icon: 'fa-check-circle' },
        { value: '<0.3s', label: 'Response Time', icon: 'fa-stopwatch' },
        { value: '100%', label: 'Data Encryption', icon: 'fa-lock' },
        { value: '∞', label: 'Free Usage', icon: 'fa-gift' },
      ],
      testimonials: [
        { name: 'Ahmed M.', role: 'Web Developer', text: 'The best translation tool I\'ve ever used!' },
        { name: 'Sarah K.', role: 'Content Writer', text: 'Auto-correction saved me hours of proofreading' },
        { name: 'Mohammed R.', role: 'Research Student', text: 'Helped me with my international research amazingly' },
      ],
      footer: 'Made with ❤️ in Syria for the global community',
    },
  };

  const t = content[lang];
  const isRTL = lang === 'ar';

  // ✅ التنقل للصفحات
  const handleTranslate = () => navigate('/translate');
  const handleTools = () => navigate('/tools');

  // ✅ تأثير المغناطيس للأزرار
  const handleButtonHover = (e, isEnter) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isEnter) {
      btn.style.setProperty('--mouse-x', `${x}px`);
      btn.style.setProperty('--mouse-y', `${y}px`);
      btn.classList.add('magnetic-active');
    } else {
      btn.classList.remove('magnetic-active');
    }
  };

  if (isLoading) {
    return (
      <div className="page-loader active">
        <div className="loader-content">
          <div className="loader-logo">
            <i className="fas fa-language" />
          </div>
          <div className="loader-bar">
            <div className="loader-progress" />
          </div>
          <p className="loader-text">{t.brand}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      {/* 🎯 شريط التقدم العلوي */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* 🌌 الخلفية المتحركة */}
      <div className="home-background">
        <div className="gradient-mesh">
          <div className="mesh-orb orb-1" data-parallax="0.02" />
          <div className="mesh-orb orb-2" data-parallax="-0.015" />
          <div className="mesh-orb orb-3" data-parallax="0.01" />
        </div>
        
        <div className="interactive-particles">
          {[...Array(50)].map((_, i) => (
            <span 
              key={i} 
              className="particle"
              style={{
                '--delay': `${i * 0.05}s`,
                '--size': `${Math.random() * 4 + 2}px`,
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        
        <div className="noise-overlay" />
        <div className="grid-lines" />
      </div>

      <main className="home-container">
        
        {/* 🔹 قسم الهيرو */}
        <section className="hero-section">
          
          <div 
            className="hero-glow" 
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          />

          <div className="hero-content">
            
            {/* شارة البث المباشر */}
            <div className="hero-badge live-badge">
              <span className="live-dot" />
              <span>{lang === 'ar' ? 'مباشر: تحسينات الذكاء الاصطناعي' : 'Live: AI Enhancements'}</span>
            </div>

            {/* العنوان الرئيسي */}
            <h1 className="hero-title">
              <span className="title-pre">{t.heroTitle}</span>
              <span className="title-main">
                {t.brand}
                <span className="title-liquid" />
              </span>
              <span className="title-post">{t.heroSubtitle}</span>
            </h1>

            {/* النص المكتوب تلقائيًا - ✅ لون بنفسجي */}
            <div className="typing-container">
              <span className="typing-label">✓</span>
              <span className="typing-text">{typedText}</span>
              <span className="typing-cursor" />
            </div>

            {/* أزرار الإجراءات - ✅ النص بنفسجي */}
            <div className="hero-actions">
              <button 
                className="btn-primary magnetic-btn"
                onClick={handleTranslate}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
                type="button"
              >
                <span className="btn-bg" />
                <span className="btn-content">
                  <span className="btn-icon-wrap">
                    <i className="fas fa-language" />
                    <i className="fas fa-language btn-icon-duplicate" />
                  </span>
                  <span className="btn-text">{t.ctaTranslate}</span>
                  <span className="btn-sparkles">
                    {[...Array(3)].map((_, i) => (
                      <i key={i} className="fas fa-sparkle" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </span>
                </span>
              </button>

              <button 
                className="btn-secondary magnetic-btn"
                onClick={handleTools}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
                type="button"
              >
                <span className="btn-bg" />
                <span className="btn-content">
                  <span className="btn-icon-wrap">
                    <i className="fas fa-wand-magic-sparkles" />
                    <i className="fas fa-wand-magic-sparkles btn-icon-duplicate" />
                  </span>
                  <span className="btn-text">{t.ctaTools}</span>
                </span>
              </button>
            </div>

            {/* الإحصائيات */}
            <div className="hero-stats">
              {t.stats.map((stat, i) => (
                <div 
                  key={i} 
                  className="stat-card glass-card"
                  style={{ 
                    animationDelay: `${i * 0.15}s`,
                    '--stat-color': stat.value === '99.7%' ? '#8b5cf6' : 
                                   stat.value === '<0.3s' ? '#22c55e' :
                                   stat.value === '100%' ? '#3b82f6' : '#ec4899'
                  }}
                >
                  <i className={`fas ${stat.icon}`} />
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-glow" />
                </div>
              ))}
            </div>
          </div>

          {/* العرض البصري ثلاثي الأبعاد */}
          <div className="hero-visual-3d">
            <div className="visual-container" data-parallax="0.03">
              
              <div className="floating-card card-1 glass-card">
                <div className="card-header">
                  <span className="card-lang">EN → AR</span>
                  <span className="card-status success">
                    <i className="fas fa-check" />
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-original">"I have a dream"</p>
                  <i className="fas fa-arrow-down arrow-icon" />
                  <p className="card-translated">"لدي حلم"</p>
                </div>
              </div>

              <div className="floating-card card-2 glass-card">
                <div className="card-header">
                  <span className="card-lang">Grammar Fix</span>
                  <span className="card-status warning">
                    <i className="fas fa-wand-magic" />
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-original"><del>"i has dream"</del></p>
                  <i className="fas fa-arrow-down arrow-icon" />
                  <p className="card-translated corrected">"I have a dream"</p>
                </div>
              </div>

              <div className="floating-card card-3 glass-card">
                <div className="processing-ring">
                  <div className="ring-segment" />
                  <div className="ring-segment" style={{ animationDelay: '-0.5s' }} />
                  <div className="ring-segment" style={{ animationDelay: '-1s' }} />
                </div>
                <span className="processing-text">AI Processing</span>
              </div>

            </div>
          </div>
        </section>

        {/* 🔹 قسم الميزات */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-number">01</span>
              {lang === 'ar' ? 'قوة الذكاء الاصطناعي' : 'AI-Powered Features'}
            </h2>
            <p className="section-subtitle">
              {lang === 'ar' 
                ? 'تقنيات متقدمة مصممة لتقديم أفضل تجربة ترجمة وتصحيح' 
                : 'Advanced technologies designed for the best translation & correction experience'}
            </p>
          </div>

          <div className="features-showcase">
            {t.features.map((feature, i) => (
              <div 
                key={i}
                className={`feature-showcase-card glass-card ${activeFeature === i ? 'active' : ''}`}
                onClick={() => setActiveFeature(i)}
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-showcase-content">
                  <div className="feature-icon-3d">
                    <i className={`fas ${feature.icon}`} />
                    <div className="icon-orbit">
                      {[...Array(6)].map((_, j) => (
                        <span key={j} className="orbit-dot" style={{ 
                          '--index': j,
                          '--color': feature.color
                        }} />
                      ))}
                    </div>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <div className="feature-cta">
                    <span>{lang === 'ar' ? 'اكتشف المزيد' : 'Learn More'}</span>
                    <i className="fas fa-arrow-right" />
                  </div>
                </div>
                <div className="feature-glow" style={{ '--glow-color': feature.color }} />
              </div>
            ))}
          </div>
        </section>

        {/* 🔹 قسم الآراء */}
        <section className="testimonials-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-number">02</span>
              {lang === 'ar' ? 'ماذا يقول مستخدمونا' : 'What Our Users Say'}
            </h2>
          </div>
          
          <div className="testimonials-carousel">
            {t.testimonials.map((testimonial, i) => (
              <div key={i} className="testimonial-card glass-card">
                <div className="testimonial-avatar">
                  <span className="avatar-initial">{testimonial.name.charAt(0)}</span>
                  <span className="avatar-glow" />
                </div>
                <div className="testimonial-content">
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <i key={j} className="fas fa-star" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔹 قسم الدعوة النهائي */}
        <section className="cta-final-section">
          <div className="cta-final-card">
            <div className="cta-final-glow" />
            <div className="cta-final-content">
              <h3>{lang === 'ar' ? 'مستعد لتجربة المستقبل؟' : 'Ready to Experience the Future?'}</h3>
              <p>{lang === 'ar' ? 'انضم إلى آلاف المستخدمين الذين يثقون بـ LinguaPro' : 'Join thousands of users who trust LinguaPro'}</p>
              
              <div className="cta-final-actions">
                <button className="btn-cta-primary" onClick={handleTranslate} type="button">
                  <span className="btn-cta-text">{t.ctaTranslate}</span>
                  <span className="btn-cta-arrow">
                    <i className="fas fa-arrow-right" />
                    <i className="fas fa-arrow-right" />
                  </span>
                </button>
              </div>
              
              <div className="cta-final-trust">
                <span className="trust-item">
                  <i className="fas fa-shield-alt" />
                  {lang === 'ar' ? 'آمن 100%' : '100% Secure'}
                </span>
                <span className="trust-item">
                  <i className="fas fa-bolt" />
                  {lang === 'ar' ? 'فوري' : 'Instant'}
                </span>
                <span className="trust-item">
                  <i className="fas fa-heart" />
                  {lang === 'ar' ? 'مجاني' : 'Free'}
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 🔹 الفوتر - ✅ روابط حقيقية */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-logo">
              <i className="fas fa-language" />
              <span>LinguaPro</span>
            </div>
            <p className="brand-tagline">
              {lang === 'ar' ? 'الذكاء الاصطناعي للغة' : 'AI for Language'}
            </p>
          </div>
          
          {/* ✅ روابط الفوتر الحقيقية */}
          <div className="footer-links">
            <a href="/translate">{lang === 'ar' ? 'الترجمة' : 'Translate'}</a>
            <a href="/tools">{lang === 'ar' ? 'أدوات النصوص' : 'Text Tools'}</a>
            <a href="/history">{lang === 'ar' ? 'السجل' : 'History'}</a>
            <a href="/account">{lang === 'ar' ? 'الحساب' : 'Account'}</a>
          </div>
          
          <p className="footer-text">{t.footer}</p>
          
          <div className="footer-social">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-github" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-twitter" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-linkedin" />
            </a>
          </div>
        </div>
      </footer>

      {/* ✅ شاشة التحميل */}
      <div className={`page-loader ${isLoading ? 'active' : ''}`}>
        <div className="loader-content">
          <div className="loader-logo">
            <i className="fas fa-language" />
          </div>
          <div className="loader-bar">
            <div className="loader-progress" />
          </div>
          <p className="loader-text">{t.brand}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
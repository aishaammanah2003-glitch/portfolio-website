import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Translate.css';

const Translate = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  // ✅ لغات مدعومة (عربي وإنجليزي فقط)
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
  ];

  // ✅ تحديث اتجاه النص عند تغيير اللغة
  useEffect(() => {
    const sourceArea = document.getElementById('source-text');
    const targetArea = document.getElementById('target-text');
    if (sourceArea) sourceArea.dir = sourceLang === 'ar' ? 'rtl' : 'ltr';
    if (targetArea) targetArea.dir = targetLang === 'ar' ? 'rtl' : 'ltr';
  }, [sourceLang, targetLang]);

  // ✅ تحميل ترجمة محفوظة مسبقًا (من صفحة السجل)
  useEffect(() => {
    const reused = localStorage.getItem('reuseTranslation');
    if (reused) {
      try {
        const item = JSON.parse(reused);
        setSourceText(item.sourceText);
        setTranslatedText(item.translatedText);
        setSourceLang(item.sourceLang);
        setTargetLang(item.targetLang);
        localStorage.removeItem('reuseTranslation');
      } catch (err) {
        console.error('Failed to reuse translation:', err);
      }
    }
  }, []);

  // ✅ دالة حفظ الترجمة في السجل
  const saveToHistory = (source, translated, from, to) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      sourceText: source.trim(),
      translatedText: translated.trim(),
      sourceLang: from,
      targetLang: to,
    };

    try {
      const existingHistory = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      // تجنب التكرار
      const exists = existingHistory.some(
        (item) => item.sourceText === source.trim() && item.translatedText === translated.trim()
      );
      if (!exists) {
        const updatedHistory = [historyItem, ...existingHistory].slice(0, 100);
        localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  // ✅ دالة الترجمة باستخدام MyMemory API
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('⚠️ يرجى إدخال نص للترجمة');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ إزالة المسافات الزائدة من الرابط
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`
      );

      const data = await response.json();

      if (data.responseStatus === 200) {
        const result = data.responseData.translatedText;
        setTranslatedText(result);
        
        // ✅ حفظ في السجل تلقائيًا عند النجاح
        if (result && sourceText.trim()) {
          saveToHistory(sourceText, result, sourceLang, targetLang);
        }
      } else {
        setError(`❌ خطأ: ${data.responseDetails || 'فشل في الترجمة'}`);
      }
    } catch (err) {
      setError('❌ خطأ في الاتصال بالخادم');
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ زر عكس اللغة (تبديل المصدر والهدف)
  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // ✅ نسخ النص
  const handleCopy = async (text, type) => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // ✅ نطق النص (Text-to-Speech)
  const handleSpeak = (text, lang) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // ✅ دعم زر Enter للترجمة
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  // ✅ مسح النصوص
  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setError(null);
  };

  return (
    <div className="translate-page">
      <Navbar />
      
      <main className="translate-container">
        {/* 🔹 الهيدر */}
        <header className="translate-header">
          <div className="header-glow" />
          <h1>
            <i className="fas fa-language" /> 
            مترجم <span className="accent">LinguaPro</span>
          </h1>
          <p>ترجمة فورية ودقيقة بين الإنجليزية والعربية</p>
        </header>

        {/* 🔹 أدوات التحكم في اللغة */}
        <div className="language-controls">
          <div className="language-select glass-card">
            <label>من:</label>
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)}
              className="lang-dropdown"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
          </div>

          {/* 🔄 زر عكس اللغة */}
          <button 
            className="swap-btn glass-btn" 
            onClick={handleSwapLanguages}
            title="عكس اتجاه الترجمة"
            type="button"
          >
            <i className="fas fa-exchange-alt" />
            <span className="btn-glow" />
          </button>

          <div className="language-select glass-card">
            <label>إلى:</label>
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)}
              className="lang-dropdown"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔹 منطقة النص */}
        <div className="translate-boxes">
          {/* ✅ صندوق النص المصدر */}
          <div className="text-box glass-card">
            <div className="box-header">
              <span className="box-title">
                <i className="fas fa-pen" /> النص الأصلي
              </span>
              <div className="box-actions">
                <button 
                  className="icon-btn" 
                  onClick={() => handleSpeak(sourceText, sourceLang)}
                  title="استمع للنص"
                  disabled={!sourceText}
                  type="button"
                >
                  <i className="fas fa-volume-up" />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={() => handleCopy(sourceText, 'source')}
                  title="نسخ النص"
                  disabled={!sourceText}
                  type="button"
                >
                  <i className={`fas ${copied === 'source' ? 'fa-check' : 'fa-copy'}`} />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={handleClear}
                  title="مسح"
                  disabled={!sourceText && !translatedText}
                  type="button"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
            <textarea
              id="source-text"
              className="text-input"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="اكتب أو الصق النص هنا للترجمة..."
              maxLength={500}
            />
            <div className="box-footer">
              <span className="char-count">{sourceText.length}/500 حرف</span>
            </div>
          </div>

          {/* ✅ صندوق النص المترجم */}
          <div className="text-box glass-card">
            <div className="box-header">
              <span className="box-title">
                <i className="fas fa-sparkles" /> الترجمة
              </span>
              <div className="box-actions">
                <button 
                  className="icon-btn" 
                  onClick={() => handleSpeak(translatedText, targetLang)}
                  title="استمع للترجمة"
                  disabled={!translatedText}
                  type="button"
                >
                  <i className="fas fa-volume-up" />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={() => handleCopy(translatedText, 'target')}
                  title="نسخ الترجمة"
                  disabled={!translatedText}
                  type="button"
                >
                  <i className={`fas ${copied === 'target' ? 'fa-check' : 'fa-copy'}`} />
                </button>
              </div>
            </div>
            <div id="target-text" className="text-output">
              {loading ? (
                <div className="loading-state">
                  <div className="loader" />
                  <span>جاري الترجمة...</span>
                </div>
              ) : error ? (
                <div className="error-state">
                  <i className="fas fa-exclamation-triangle" />
                  <span>{error}</span>
                </div>
              ) : translatedText ? (
                <p className="translated-content">{translatedText}</p>
              ) : (
                <span className="placeholder">ستظهر الترجمة هنا...</span>
              )}
            </div>
            <div className="box-footer">
              <span className="target-lang-badge">
                <i className={`fas fa-globe-${targetLang === 'ar' ? 'asia' : 'americas'}`} />
                {targetLang === 'ar' ? 'العربية' : 'English'}
              </span>
            </div>
          </div>
        </div>

        {/* 🔹 زر الترجمة الرئيسي */}
        <div className="translate-actions">
          <button 
            className="translate-btn primary-glow" 
            onClick={handleTranslate}
            disabled={loading || !sourceText.trim()}
            type="button"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" /> جاري المعالجة...
              </>
            ) : (
              <>
                <i className="fas fa-magic" /> ترجمة النص الآن
              </>
            )}
            <span className="btn-glow" />
          </button>
        </div>

        {/* 🔹 ميزات إضافية */}
        <div className="features-grid">
          <div className="feature-card glass-card">
            <i className="fas fa-bolt" />
            <h4>ترجمة فورية</h4>
            <p>بين الإنجليزية والعربية بدقة عالية</p>
          </div>
          <div className="feature-card glass-card">
            <i className="fas fa-volume-up" />
            <h4>نطق صوتي</h4>
            <p>استمع للنص الأصلي والمترجم</p>
          </div>
          <div className="feature-card glass-card">
            <i className="fas fa-clock-rotate-left" />
            <h4>سجل محفوظ</h4>
            <p>جميع ترجماتك محفوظة محليًا تلقائيًا</p>
          </div>
        </div>

        {/* 🔹 الفوتر */}
        <footer className="translate-footer">
          <small>
            <i className="fas fa-info-circle" /> 
            الترجمة مقدمة عبر <strong>MyMemory API</strong> المجاني.
          </small>
        </footer>
      </main>
    </div>
  );
};

export default Translate;
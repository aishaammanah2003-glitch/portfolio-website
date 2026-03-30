import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './TextTools.css';

const TextTools = () => {
  const [inputText, setInputText] = useState('');
  const [rawTranslation, setRawTranslation] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [activeTool, setActiveTool] = useState('translate_correct');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [copied, setCopied] = useState(null);
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 });
  const [errors, setErrors] = useState([]);
  const [detectedLang, setDetectedLang] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // ✅ الأدوات المتاحة
  const tools = [
    { 
      id: 'translate_correct', 
      name: 'ترجمة + تصحيح', 
      icon: 'fa-language', 
      desc: 'تصحيح النص ثم ترجمته بدقة' 
    },
    { 
      id: 'grammar_only', 
      name: 'تصحيح قواعد', 
      icon: 'fa-check-double', 
      desc: 'فحص وتصحيح النص الأصلي فقط' 
    },
    { 
      id: 'translate_only', 
      name: 'ترجمة فقط', 
      icon: 'fa-exchange-alt', 
      desc: 'ترجمة النص دون أي تصحيح' 
    },
  ];

  // ✅ تحديث الإحصائيات
  useEffect(() => {
    setStats({
      chars: inputText.length,
      words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
      lines: inputText.split('\n').filter(line => line.trim()).length,
    });
  }, [inputText]);

  // ✅ تحميل نص محفوظ مسبقًا
  useEffect(() => {
    const reused = localStorage.getItem('reuseTextTool');
    if (reused) {
      try {
        const item = JSON.parse(reused);
        setInputText(item.sourceText || '');
        setCorrectedText(item.translatedText || '');
        setRawTranslation(item.rawTranslation || item.translatedText || '');
        setActiveTool(item.toolType || 'translate_correct');
        localStorage.removeItem('reuseTextTool');
      } catch (err) {
        console.error('Failed to reuse text:', err);
      }
    }
  }, []);

  // ✅ حفظ في السجل
  const saveToHistory = (source, result, raw, tool, corrections = []) => {
    const sourceLang = detectLanguage(source);
    const targetLang = sourceLang === 'ar' ? 'en' : 'ar';
    
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      sourceText: source?.trim() || '',
      translatedText: result?.trim() || '',
      rawTranslation: raw?.trim() || '',
      toolType: tool,
      isTextTool: true,
      corrections: corrections,
      sourceLang: tool === 'grammar_only' ? sourceLang : sourceLang,
      targetLang: tool === 'grammar_only' ? sourceLang : targetLang,
    };

    try {
      const existingHistory = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      const exists = existingHistory.some(
        (item) => item.sourceText === historyItem.sourceText && item.translatedText === historyItem.translatedText
      );
      if (!exists) {
        const updatedHistory = [historyItem, ...existingHistory].slice(0, 100);
        localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  // ✅ كشف اللغة تلقائيًا
  const detectLanguage = (text) => {
    if (!text) return 'en';
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicPattern.test(text) ? 'ar' : 'en';
  };

  // ✅ ترجمة النص (MyMemory API)
  const translateText = async (text, from, to) => {
    try {
      const encodedText = encodeURIComponent(text.trim());
      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${from}|${to}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      throw new Error(data.responseDetails || 'Translation failed');
    } catch (err) {
      console.error('Translation error:', err);
      return text;
    }
  };

  // ✅ تصحيح القواعد (LanguageTool API)
  const checkGrammar = async (text, language) => {
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          text: text,
          language: language === 'ar' ? 'auto' : 'en-US',
          enabledOnly: 'false',
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const foundErrors = data.matches || [];
      
      // تطبيق التصحيحات (للإنجليزية فقط - الدعم أفضل)
      let corrected = text;
      if (language === 'en' && foundErrors.length > 0) {
        const sortedErrors = [...foundErrors].sort((a, b) => b.offset - a.offset);
        sortedErrors.forEach((error) => {
          if (error.replacements?.[0]?.value && error.length > 0) {
            try {
              const before = corrected.substring(0, error.offset);
              const after = corrected.substring(error.offset + error.length);
              corrected = before + error.replacements[0].value + after;
            } catch (e) {
              console.warn('Correction failed:', e);
            }
          }
        });
      }

      return { corrected, errors: foundErrors };
    } catch (err) {
      console.error('Grammar error:', err);
      return { corrected: text, errors: [] };
    }
  };

  // ✅ المعالجة الرئيسية - مُصححة بالكامل
  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setStatusMessage('⚠️ أدخل نصًا أولاً');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setLoading(true);
    setErrors([]);
    setRawTranslation('');
    setCorrectedText('');
    
    try {
      const sourceLang = detectLanguage(inputText);
      setDetectedLang(sourceLang);
      let result = '', raw = '', grammarErrors = [];

      // 🔹 أداة: ترجمة + تصحيح
      if (activeTool === 'translate_correct') {
        const targetLang = sourceLang === 'ar' ? 'en' : 'ar';
        
        // ✅ السيناريو 1: المصدر إنجليزي → نصححه أولاً ثم نترجم
        if (sourceLang === 'en') {
          setLoadingStep('✏️ جاري تصحيح النص الإنجليزي...');
          
          // 1️⃣ تصحيح القواعد في النص الإنجليزي الأصلي
          const grammarResult = await checkGrammar(inputText, 'en');
          const correctedSource = grammarResult.corrected;
          grammarErrors = grammarResult.errors;
          setErrors(grammarErrors);
          
          // 2️⃣ ترجمة النص المصحح
          setLoadingStep('🌐 جاري ترجمة النص المصحح...');
          raw = await translateText(correctedSource, 'en', targetLang);
          result = raw;
          
        } 
        // ✅ السيناريو 2: المصدر عربي → نترجم أولاً ثم نصحح الإنجليزي
        else {
          setLoadingStep('🌐 جاري الترجمة...');
          
          // 1️⃣ ترجمة من عربي لإنجليزي
          raw = await translateText(inputText, 'ar', 'en');
          
          // 2️⃣ تصحيح الترجمة الإنجليزية
          setLoadingStep('✏️ جاري تصحيح الترجمة الإنجليزية...');
          const grammarResult = await checkGrammar(raw, 'en');
          result = grammarResult.corrected;
          grammarErrors = grammarResult.errors;
          setErrors(grammarErrors);
        }
        
        setRawTranslation(raw);
        setCorrectedText(result);

      } 
      // 🔹 أداة: تصحيح قواعد فقط
      else if (activeTool === 'grammar_only') {
        setLoadingStep('✏️ جاري الفحص...');
        
        // التصحيح يعمل بشكل أفضل مع الإنجليزية
        if (sourceLang === 'en') {
          const grammarResult = await checkGrammar(inputText, 'en');
          result = grammarResult.corrected;
          grammarErrors = grammarResult.errors;
          setErrors(grammarErrors);
        } else {
          // للعربية: نرجع النص كما هو مع تنبيه
          result = inputText;
          setStatusMessage('⚠️ تصحيح العربية غير مدعوم بالكامل');
        }
        setCorrectedText(result);

      } 
      // 🔹 أداة: ترجمة فقط
      else if (activeTool === 'translate_only') {
        setLoadingStep('🌐 جاري الترجمة...');
        const targetLang = sourceLang === 'ar' ? 'en' : 'ar';
        raw = await translateText(inputText, sourceLang, targetLang);
        result = raw;
        setRawTranslation(raw);
        setCorrectedText(result);
      }

      setStatusMessage('✅ تمت بنجاح!');
      
      // ✅ الحفظ في السجل
      if (result && inputText.trim()) {
        saveToHistory(inputText, result, raw, activeTool, grammarErrors);
      }

    } catch (err) {
      console.error('Error:', err);
      setStatusMessage(`❌ ${err.message || 'فشل في المعالجة'}`);
      setCorrectedText(`خطأ: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingStep('');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  // ✅ النسخ
  const handleCopy = async (text, type) => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setStatusMessage('📋 تم النسخ!');
        setTimeout(() => { setCopied(null); setStatusMessage(''); }, 2000);
      } catch (err) {
        setStatusMessage('❌ فشل النسخ');
      }
    }
  };

  // ✅ النطق
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const isArabic = /[\u0600-\u06FF]/.test(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ✅ المسح
  const handleClear = () => {
    setInputText('');
    setRawTranslation('');
    setCorrectedText('');
    setErrors([]);
    setStatusMessage('🗑️ تم المسح');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  // ✅ إعادة الاستخدام
  const handleReuse = () => {
    localStorage.setItem('reuseTextTool', JSON.stringify({
      sourceText: inputText,
      translatedText: correctedText,
      rawTranslation: rawTranslation,
      toolType: activeTool,
    }));
    setStatusMessage('💾 جاهز');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  // ✅ Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleProcessText();
    }
  };

  const getCurrentToolName = () => tools.find(t => t.id === activeTool)?.name || 'أداة';
  const getCurrentToolIcon = () => tools.find(t => t.id === activeTool)?.icon || 'fa-wand-magic-sparkles';

  return (
    <div className="texttools-page">
      <Navbar />
      <main className="texttools-container">
        
        {/* 🔹 الهيدر */}
        <header className="texttools-header">
          <div className="header-glow" />
          <h1>
            <i className="fas fa-wand-magic-sparkles" /> 
            أدوات <span className="accent">النصوص</span>
          </h1>
          <p>تصحيح النص ثم ترجمته بدقة عالية</p>
        </header>

        {/* 🔹 شريط الحالة */}
        {statusMessage && (
          <div className={`status-bar ${statusMessage.includes('❌') ? 'error' : statusMessage.includes('✅') ? 'success' : 'info'}`}>
            <i className={`fas ${statusMessage.includes('❌') ? 'fa-exclamation-circle' : statusMessage.includes('✅') ? 'fa-check-circle' : 'fa-spinner fa-spin'}`} />
            {statusMessage}
          </div>
        )}
        {loadingStep && <div className="loading-step"><i className="fas fa-circle-notch fa-spin" /> {loadingStep}</div>}

        {/* 🔹 اختيار الأداة */}
        <div className="tools-grid">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-card glass-card ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              type="button"
            >
              <div className="tool-icon"><i className={`fas ${tool.icon}`} /></div>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
              {activeTool === tool.id && <div className="tool-indicator" />}
            </button>
          ))}
        </div>

        {/* 🔹 منطقة النص */}
        <div className="texttools-boxes">
          
          {/* ✅ الإدخال */}
          <div className="text-box glass-card">
            <div className="box-header">
              <span className="box-title"><i className="fas fa-pen" /> النص الأصلي</span>
              <div className="box-actions">
                <button className="icon-btn" onClick={() => handleSpeak(inputText)} disabled={!inputText} title="استماع"><i className="fas fa-volume-up" /></button>
                <button className="icon-btn" onClick={() => handleCopy(inputText, 'input')} disabled={!inputText} title="نسخ"><i className={`fas ${copied === 'input' ? 'fa-check' : 'fa-copy'}`} /></button>
                <button className="icon-btn" onClick={handleClear} title="مسح"><i className="fas fa-trash" /></button>
              </div>
            </div>
            <textarea
              id="input-text" className="text-input" value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب نصًا عربيًا أو إنجليزيًا..."
              maxLength={1000} dir="auto"
            />
            <div className="box-footer">
              <div className="stats-bar">
                <span className="stat-item"><i className="fas fa-font" /> {stats.chars} حرف</span>
                <span className="stat-item"><i className="fas fa-align-left" /> {stats.words} كلمة</span>
              </div>
              <span className="char-count">{inputText.length}/1000</span>
            </div>
          </div>

          {/* ✅ الإخراج - متعدد المراحل */}
          <div className="text-box glass-card output-box">
            <div className="box-header">
              <span className="box-title"><i className="fas fa-sparkles" /> {getCurrentToolName()}</span>
              <div className="box-actions">
                <button className="icon-btn" onClick={() => handleSpeak(correctedText)} disabled={!correctedText} title="استماع"><i className="fas fa-volume-up" /></button>
                <button className="icon-btn" onClick={() => handleCopy(correctedText, 'output')} disabled={!correctedText} title="نسخ"><i className={`fas ${copied === 'output' ? 'fa-check' : 'fa-copy'}`} /></button>
                <button className="icon-btn" onClick={handleReuse} disabled={!correctedText} title="إعادة استخدام"><i className="fas fa-redo" /></button>
              </div>
            </div>
            
            <div className="output-stages">
              {/* المرحلة 1: التصحيحات إن وجدت */}
              {errors.length > 0 && (
                <div className="output-stage corrections-stage">
                  <div className="stage-header">
                    <i className="fas fa-wand-magic" />
                    <span>التصحيحات المطبقة ({errors.length}):</span>
                  </div>
                  <div className="corrections-list">
                    {errors.slice(0, 8).map((err, i) => {
                      const original = err.context?.text?.substring(err.context?.offset || 0, (err.context?.offset || 0) + (err.length || 0)) || '...';
                      const fixed = err.replacements?.[0]?.value || '—';
                      return (
                        <div key={i} className="correction-item">
                          <del className="correction-old">{original}</del>
                          <i className="fas fa-arrow-right" />
                          <ins className="correction-new">{fixed}</ins>
                          <span className="correction-reason">{err.shortMessage || ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* المرحلة 2: الترجمة الأولية */}
              {rawTranslation && activeTool !== 'grammar_only' && (
                <div className="output-stage raw-stage">
                  <div className="stage-header">
                    <i className="fas fa-globe" />
                    <span>الترجمة:</span>
                  </div>
                  <p className="stage-content" dir="auto">{rawTranslation}</p>
                </div>
              )}
              
              {/* المرحلة 3: النتيجة النهائية */}
              <div className="output-stage final-stage">
                <div className="stage-header">
                  <i className="fas fa-check-circle" />
                  <span>النتيجة النهائية:</span>
                </div>
                {loading ? (
                  <div className="loading-state"><div className="loader" /><span>جاري المعالجة...</span></div>
                ) : correctedText ? (
                  <p className="stage-content final-content" dir="auto">{correctedText}</p>
                ) : (
                  <span className="placeholder">ستظهر النتيجة هنا...</span>
                )}
              </div>
            </div>
            
            <div className="box-footer">
              <span className="tool-badge">
                <i className={`fas ${getCurrentToolIcon()}`} />
                {detectedLang ? (
                  <><span className="lang-flag">{detectedLang === 'ar' ? '🇸🇦' : '🇬🇧'}</span> {detectedLang === 'ar' ? 'عربي' : 'English'}</>
                ) : 'غير محدد'}
                <i className="fas fa-arrow-right" />
                {correctedText && detectedLang && (
                  <><span className="lang-flag">{detectedLang === 'ar' ? '🇬🇧' : '🇸🇦'}</span> {detectedLang === 'ar' ? 'English' : 'عربي'}</>
                )}
              </span>
              {errors.length > 0 && (
                <span className="errors-count"><i className="fas fa-check-double" /> {errors.length} تصحيح</span>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 زر المعالجة */}
        <div className="texttools-actions">
          <button 
            className="process-btn primary-glow" 
            onClick={handleProcessText}
            disabled={loading || !inputText.trim()}
            type="button"
          >
            {loading ? <><i className="fas fa-spinner fa-spin" /> جاري المعالجة...</> : <><i className={`fas ${getCurrentToolIcon()}`} /> {getCurrentToolName()}</>}
            <span className="btn-glow" />
          </button>
        </div>

        {/* 🔹 الميزات */}
        <div className="features-grid">
          <div className="feature-card glass-card">
            <i className="fas fa-globe" /><h4>ترجمة حقيقية</h4><p>عبر MyMemory API</p>
          </div>
          <div className="feature-card glass-card">
            <i className="fas fa-spell-check" /><h4>تصحيح إملائي</h4><p>عبر LanguageTool</p>
          </div>
          <div className="feature-card glass-card">
            <i className="fas fa-clock-rotate-left" /><h4>سجل محفوظ</h4><p>محليًا في متصفحك</p>
          </div>
        </div>

        {/* 🔹 الفوتر */}
        <footer className="texttools-footer">
          <small><i className="fas fa-info-circle" /> الترجمة: MyMemory | التصحيح: LanguageTool | الدعم: 🇸🇦 / 🇬🇧</small>
        </footer>
      </main>
    </div>
  );
};

export default TextTools;
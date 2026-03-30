import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // ✅ تحميل السجل عند البدء
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('translationHistory');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // ✅ فلترة السجل
  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.sourceText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translatedText?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (item.isTextTool) {
      return matchesSearch && (filterLang === 'all' || filterLang === 'tools');
    }
    
    const matchesLang = 
      filterLang === 'all' || 
      filterLang === 'tools' ||
      `${item.sourceLang}-${item.targetLang}` === filterLang;
    
    return matchesSearch && matchesLang;
  });

  // ✅ حذف عنصر
  const deleteItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('translationHistory', JSON.stringify(updated));
  };

  // ✅ مسح الكل
  const clearAll = () => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف كل سجل الترجمات؟')) {
      setHistory([]);
      localStorage.removeItem('translationHistory');
    }
  };

  // ✅ نسخ النص
  const handleCopy = async (text, id) => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // ✅ إعادة الاستخدام
  const handleReuse = (item) => {
    if (item.isTextTool) {
      localStorage.setItem('reuseTextTool', JSON.stringify(item));
      window.location.href = '/tools';
    } else {
      localStorage.setItem('reuseTranslation', JSON.stringify(item));
      window.location.href = '/translate';
    }
  };

  // ✅ تصدير السجل
  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguapro-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ تنسيق التاريخ
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ✅ أيقونة اللغة
  const getLangIcon = (code) => {
    if (!code) return 'fa-globe';
    const icons = { 
      en: 'fa-globe-americas', ar: 'fa-globe-asia',
      fr: 'fa-eiffel-tower', es: 'fa-monument', de: 'fa-mountain'
    };
    return icons[code] || 'fa-globe';
  };

  // ✅ أيقونة الاتجاه
  const getDirectionIcon = (from, to) => {
    if (!from || !to) return 'fa-exchange-alt';
    return from === 'ar' && to === 'en' ? 'fa-arrow-right' : 
           from === 'en' && to === 'ar' ? 'fa-arrow-left' : 'fa-exchange-alt';
  };

  // ✅ اسم الأداة
  const getToolName = (toolType) => {
    const names = {
      translate_correct: 'ترجمة+تصحيح',
      grammar_only: 'تصحيح قواعد',
      translate_only: 'ترجمة فقط',
    };
    return names[toolType] || 'أداة نص';
  };

  // ✅ تبسيط رسالة الخطأ للعرض
  const formatCorrectionMessage = (msg) => {
    if (!msg) return '';
    return msg.length > 60 ? msg.substring(0, 60) + '...' : msg;
  };

  // ✅ تبديل عرض التصحيحات
  const toggleCorrections = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="history-page">
      <Navbar />

      <main className="history-container">
        {/* 🔹 الهيدر */}
        <header className="history-header">
          <div className="header-glow" />
          <h1>
            <i className="fas fa-clock-rotate-left" /> 
            سجل <span className="accent">الترجمات</span>
          </h1>
          <p>جميع ترجماتك وتصحيحاتك محفوظة محليًا على جهازك</p>
        </header>

        {/* 🔹 أدوات التحكم */}
        <div className="history-controls">
          <div className="search-box glass-card">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="ابحث في السجل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')} type="button">
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)} className="filter-select glass-card">
            <option value="all">🌍 جميع العناصر</option>
            <option value="en-ar">🇬🇧 → 🇸🇦 إنجليزي → عربي</option>
            <option value="ar-en">🇸🇦 → 🇬🇧 عربي → إنجليزي</option>
            <option value="tools">🛠️ أدوات النصوص</option>
          </select>

          <div className="actions-group">
            <button className="action-btn export-btn" onClick={exportHistory} disabled={history.length === 0} type="button">
              <i className="fas fa-download" /> تصدير
            </button>
            <button className="action-btn clear-btn" onClick={clearAll} disabled={history.length === 0} type="button">
              <i className="fas fa-trash" /> مسح الكل
            </button>
          </div>
        </div>

        {/* 🔹 عداد النتائج */}
        <div className="results-summary">
          <span className="count-badge">
            <i className="fas fa-list" /> {filteredHistory.length} من {history.length} عنصر
          </span>
          {(searchTerm || filterLang !== 'all') && (
            <button className="reset-btn" onClick={() => { setSearchTerm(''); setFilterLang('all'); }} type="button">
              <i className="fas fa-undo" /> إعادة تعيين
            </button>
          )}
        </div>

        {/* 🔹 قائمة السجل */}
        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-icon"><i className="fas fa-inbox" /></div>
              <h3>لا توجد عناصر محفوظة</h3>
              <p>ابدأ بالترجمة أو معالجة النصوص وسيتم الحفظ تلقائيًا</p>
              <div className="empty-actions">
                <Link to="/translate" className="primary-btn"><i className="fas fa-language" /> ترجمة</Link>
                <Link to="/tools" className="secondary-btn"><i className="fas fa-wand-magic-sparkles" /> أدوات النصوص</Link>
              </div>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <article key={item.id} className="history-card glass-card" style={{ animationDelay: `${index * 0.05}s` }}>
                
                {/* 🔹 رأس البطاقة */}
                <div className="card-header">
                  <div className="lang-badges">
                    {item.isTextTool ? (
                      <span className="lang-badge tool">
                        <i className="fas fa-wand-magic-sparkles" />
                        {getToolName(item.toolType)}
                      </span>
                    ) : (
                      <>
                        <span className="lang-badge from">
                          <i className={`fas ${getLangIcon(item.sourceLang)}`} />
                          {(item.sourceLang || '??').toUpperCase()}
                        </span>
                        <i className={`fas ${getDirectionIcon(item.sourceLang, item.targetLang)} direction-icon`} />
                        <span className="lang-badge to">
                          <i className={`fas ${getLangIcon(item.targetLang)}`} />
                          {(item.targetLang || '??').toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                  <time className="timestamp" title={new Date(item.timestamp).toLocaleString()}>
                    <i className="fas fa-clock" /> {formatDate(item.timestamp)}
                  </time>
                </div>

                {/* 🔹 محتوى البطاقة */}
                <div className="card-content">
                  <div className="text-section source">
                    <label><i className="fas fa-pen" /> النص الأصلي:</label>
                    <p className="text-content" dir="auto">{item.sourceText || '—'}</p>
                  </div>
                  
                  <div className="text-section translated">
                    <label><i className="fas fa-sparkles" /> النتيجة:</label>
                    <p className="text-content" dir="auto">{item.translatedText || '—'}</p>
                  </div>
                </div>

                {/* 🔹 عرض التصحيحات (موجز + تفصيلي) */}
                {item.corrections?.length > 0 && (
                  <div className="corrections-section">
                    <button 
                      className="corrections-toggle" 
                      onClick={() => toggleCorrections(item.id)}
                      type="button"
                    >
                      <i className={`fas fa-chevron-${expandedCard === item.id ? 'up' : 'down'}`} />
                      <span>
                        <i className="fas fa-check-double" /> 
                        {item.corrections.length} تصحيح{item.corrections.length > 1 ? 'ات' : ''} مطبق
                        {expandedCard === item.id ? ' ▲ إخفاء' : ' ▼ عرض التفاصيل'}
                      </span>
                    </button>
                    
                    {expandedCard === item.id && (
                      <div className="corrections-details">
                        {item.corrections.slice(0, 20).map((correction, idx) => {
                          const original = correction.context?.text?.substring(
                            correction.context?.offset || 0,
                            (correction.context?.offset || 0) + (correction.length || 0)
                          ) || '...';
                          const suggested = correction.replacements?.[0]?.value || '—';
                          const message = correction.shortMessage || correction.message || '';
                          
                          return (
                            <div key={idx} className="correction-row">
                              <div className="correction-change">
                                <del className="correction-old">{original}</del>
                                <i className="fas fa-arrow-right" />
                                <ins className="correction-new">{suggested}</ins>
                              </div>
                              {message && <span className="correction-note">{formatCorrectionMessage(message)}</span>}
                            </div>
                          );
                        })}
                        {item.corrections.length > 20 && (
                          <p className="more-corrections">...و{item.corrections.length - 20} تصحيح آخر</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 🔹 أزرار الإجراءات */}
                <div className="card-actions">
                  <button className="icon-btn reuse-btn" onClick={() => handleReuse(item)} title="إعادة الاستخدام" type="button">
                    <i className="fas fa-redo" />
                  </button>
                  <button className="icon-btn copy-btn" onClick={() => handleCopy(item.translatedText, item.id)} title="نسخ النتيجة" type="button">
                    <i className={`fas ${copiedId === item.id ? 'fa-check' : 'fa-copy'}`} />
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => deleteItem(item.id)} title="حذف" type="button">
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>

                <div className="card-glow" />
              </article>
            ))
          )}
        </div>

        {/* 🔹 الفوتر */}
        <footer className="history-footer">
          <small>
            <i className="fas fa-shield-alt" /> بياناتك مخزنة محليًا في متصفحك فقط.
          </small>
        </footer>
      </main>
    </div>
  );
};

export default History;
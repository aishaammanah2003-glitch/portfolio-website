// ✅ server/routes/updateName.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ✅ استيراد نموذج المستخدم
const User = require('../models/User');

// ✅ Middleware للتحقق من Token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح - لا يوجد Token' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token غير صالح' });
    }
    req.user = user;
    next();
  });
};

// ========================================
// ✏️ API تحديث اسم المستخدم
// ========================================
router.put('/name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    console.log(`✏️ طلب تحديث الاسم للمستخدم: ${userId}`);

    // 🔐 1. التحقق من صحة الاسم
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'الاسم يجب أن يكون حرفين على الأقل' 
      });
    }

    // 🔐 2. التحقق من أن المستخدم موجود
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'المستخدم غير موجود' 
      });
    }

    // ✏️ 3. تحديث الاسم في قاعدة البيانات
    user.name = name.trim();
    user.updatedAt = new Date();
    await user.save();

    // 📝 4. تسجيل التحديث (للأمان)
    console.log(`✅ تم تحديث اسم المستخدم ${userId} إلى: ${user.name}`);

    // ✅ 5. إرجاع رد ناجح
    res.json({ 
      success: true, 
      message: 'تم تحديث الاسم بنجاح',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        updatedAt: user.updatedAt
      }
    });

  } catch (err) {
    console.error('❌ Update name error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'فشل في تحديث الاسم - خطأ في الخادم' 
    });
  }
});

module.exports = router;
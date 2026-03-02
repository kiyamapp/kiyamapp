const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kiyamapp-secret-key';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token gerekli' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
}

module.exports = { auth, JWT_SECRET };

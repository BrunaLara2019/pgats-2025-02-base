const userService = require('../../src/services/userService');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não informado' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const token = parts[1];
  const payload = userService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Attach user info from token to request for downstream handlers
  req.user = payload;
  next();
}

module.exports = { authenticate };

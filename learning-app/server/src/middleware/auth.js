const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const AuthService = require('../auth/AuthService');
const { User } = require('../db/models');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (user && user.isActive) {
      return done(null, user);
    }
    
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Local Strategy for login
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const result = await AuthService.login(email, password);
    return done(null, result);
  } catch (error) {
    return done(null, false, { message: error.message });
  }
}));

// Authentication middleware
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Rate limiting per user
const userRateLimit = (limit = 100, window = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) return next();
    
    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    next();
  };
};

module.exports = {
  passport,
  authenticate,
  authorize,
  optionalAuth,
  userRateLimit
};
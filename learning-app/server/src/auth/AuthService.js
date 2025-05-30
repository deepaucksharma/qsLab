const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, UserProfile, Session, Organization } = require('../db/models');
const { Op } = require('sequelize');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    this.saltRounds = 10;
  }

  async register(data) {
    const { email, password, displayName, organizationSlug, role = 'student' } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Find organization if provided
    let organizationId = null;
    if (organizationSlug) {
      const org = await Organization.findOne({ where: { slug: organizationSlug } });
      if (!org) {
        throw new Error('Organization not found');
      }
      organizationId = org.id;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create user and profile in transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user
      const user = await User.create({
        email,
        passwordHash,
        role,
        organizationId,
        emailVerificationToken: crypto.randomBytes(32).toString('hex')
      }, { transaction: t });

      // Create profile
      await UserProfile.create({
        userId: user.id,
        displayName: displayName || email.split('@')[0],
        preferences: {
          theme: 'light',
          emailNotifications: true,
          terminalTheme: 'default',
          fontSize: 14
        }
      }, { transaction: t });

      return user;
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.id);

    // Create session
    await this.createSession(result.id, tokens.refreshToken, data.ipAddress, data.userAgent);

    return {
      user: await this.getUserWithProfile(result.id),
      tokens
    };
  }

  async login(email, password, ipAddress, userAgent) {
    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update login info
    await user.update({
      lastLoginAt: new Date(),
      loginCount: user.loginCount + 1
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Create session
    await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    return {
      user: await this.getUserWithProfile(user.id),
      tokens
    };
  }

  async logout(userId, token) {
    // Invalidate session
    await Session.update(
      { isActive: false },
      { 
        where: { 
          userId,
          token,
          isActive: true 
        } 
      }
    );
  }

  async logoutAllDevices(userId) {
    // Invalidate all sessions
    await Session.update(
      { isActive: false },
      { 
        where: { 
          userId,
          isActive: true 
        } 
      }
    );
  }

  async refreshToken(refreshToken) {
    // Find session
    const session = await Session.findOne({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(session.userId);

    // Update session
    await session.update({
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + this.parseTimeToMs(this.refreshTokenExpiry)),
      lastActivity: new Date()
    });

    return {
      user: await this.getUserWithProfile(session.userId),
      tokens
    };
  }

  async validateToken(token) {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      
      // Check if session is still active
      const session = await Session.findOne({
        where: {
          userId: payload.userId,
          token,
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      if (!session) {
        throw new Error('Session expired');
      }

      // Update last activity
      await session.update({ lastActivity: new Date() });

      return {
        userId: payload.userId,
        role: payload.role,
        organizationId: payload.organizationId
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async resetPasswordRequest(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link will be sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // In production, send email here
    // For now, return the token (remove in production!)
    return { 
      message: 'Password reset token generated',
      resetToken: resetToken // Remove this in production
    };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

    await user.update({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    // Logout all devices for security
    await this.logoutAllDevices(user.id);

    return { message: 'Password reset successful' };
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerified: false
      }
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: null
    });

    return { message: 'Email verified successfully' };
  }

  // Helper methods
  async generateTokens(userId) {
    const user = await User.findByPk(userId);
    
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { token, refreshToken };
  }

  async createSession(userId, refreshToken, ipAddress, userAgent) {
    const expiresAt = new Date(Date.now() + this.parseTimeToMs(this.refreshTokenExpiry));

    return await Session.create({
      userId,
      token: jwt.sign({ userId, sessionId: crypto.randomBytes(16).toString('hex') }, this.jwtSecret),
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
      deviceInfo: this.parseUserAgent(userAgent)
    });
  }

  async getUserWithProfile(userId) {
    return await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] },
      include: [{
        model: UserProfile,
        as: 'profile'
      }, {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'slug']
      }]
    });
  }

  parseTimeToMs(time) {
    const units = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000
    };
    
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) return 86400000; // Default to 1 day
    
    return parseInt(match[1]) * units[match[2]];
  }

  parseUserAgent(userAgent) {
    // Simple parsing - in production use a proper user-agent parser
    const device = {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown'
    };

    if (userAgent) {
      if (userAgent.includes('Chrome')) device.browser = 'Chrome';
      else if (userAgent.includes('Firefox')) device.browser = 'Firefox';
      else if (userAgent.includes('Safari')) device.browser = 'Safari';

      if (userAgent.includes('Windows')) device.os = 'Windows';
      else if (userAgent.includes('Mac')) device.os = 'macOS';
      else if (userAgent.includes('Linux')) device.os = 'Linux';

      if (userAgent.includes('Mobile')) device.device = 'Mobile';
      else device.device = 'Desktop';
    }

    return device;
  }
}

module.exports = new AuthService();
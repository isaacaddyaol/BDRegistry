import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { verifyPassword } from "./utils/password";

declare module 'express-session' {
  interface SessionData {
    passport: { user: string };
  }
}

const PostgresqlStore = pgSession(session);

// List of public emails that have unrestricted access
const publicEmails = [
  'public@registry.gov.gh',
  'health@registry.gov.gh',
  'registrar@registry.gov.gh'
];

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (user && publicEmails.includes(user.email)) {
    return next();
  }

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.session || !req.session.cookie) {
    console.log('Invalid session state');
    return res.status(401).json({ message: 'Invalid session' });
  }

  req.session.touch();
  return next();
};

export function getSession() {
  return session({
    store: new PostgresqlStore({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true,
      pruneSessionInterval: 24 * 60 * 60 // Prune expired sessions every 24 hours
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-dev',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    },
    name: 'sid'
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup passport strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async function(email: string, password: string, done) {
      try {
        // For public emails, skip password verification entirely
        if (publicEmails.includes(email)) {
          if (email === 'registrar@registry.gov.gh') {
            return done(null, {
              id: 'public-registrar',
              email: email,
              role: 'registrar',
              isVerified: true,
              firstName: 'Registry',
              lastName: 'Officer'
            });
          }
          // For other public emails
          return done(null, {
            id: `public-${email}`,
            email: email,
            role: 'public',
            isVerified: true,
            firstName: 'Public',
            lastName: 'User'
          });
        }

        // For regular users, proceed with normal authentication
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        try {
          const isValidPassword = await verifyPassword(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid email or password' });
          }
        } catch (error) {
          console.error('Password verification error:', error);
          return done(error);
        }

        return done(null, user);
      } catch (err) {
        console.error('Login error:', err);
        return done(err);
      }
    }
  ));

  // User serialization
  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  // Setup user cache
  const userCache = new Map<string, { user: any; timestamp: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // User deserialization
  passport.deserializeUser(async (id: string, done) => {
    try {
      const cached = userCache.get(id);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return done(null, cached.user);
      }

      // For registrar user
      if (id === 'public-registrar') {
        const registrarUser = {
          id: 'public-registrar',
          email: 'registrar@registry.gov.gh',
          role: 'registrar',
          isVerified: true,
          firstName: 'Registry',
          lastName: 'Officer'
        };
        userCache.set(id, { user: registrarUser, timestamp: now });
        return done(null, registrarUser);
      }

      // For other public users
      if (id.startsWith('public-')) {
        const email = id.replace('public-', '');
        if (publicEmails.includes(email)) {
          const publicUser = {
            id: id,
            email: email,
            role: 'public',
            isVerified: true,
            firstName: 'Public',
            lastName: 'User'
          };
          userCache.set(id, { user: publicUser, timestamp: now });
          return done(null, publicUser);
        }
      }

      // If not in cache or expired, fetch from storage
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }

      // Update cache
      userCache.set(id, { user, timestamp: now });
      done(null, user);
    } catch (err) {
      console.error('Deserialization error:', err);
      done(err);
    }
  });

  // Clean up expired cache entries every minute
  setInterval(() => {
    const now = Date.now();
    Array.from(userCache.keys()).forEach(id => {
      const cached = userCache.get(id);
      if (cached && now - cached.timestamp > CACHE_TTL) {
        userCache.delete(id);
      }
    });
  }, 60 * 1000);

  // Auth routes
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      if (!user) {
        console.log('Authentication failed:', info.message);
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.logIn(user, (err: any) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        req.session.save(() => {
          console.log('User logged in successfully:', user.email, 'with role:', user.role);
          return res.json({ user });
        });
      });
    })(req, res, next);
  });

  app.get("/api/auth/user", isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const sessionId = req.session.id;
    req.logout(() => {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'Error during logout' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    });
  });
}
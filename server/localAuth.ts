import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-dev',
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async function(email, password, done) {
      try {
        console.log('Attempting login for:', email);
        const user = await storage.validateUserCredentials({ email, password });
        
        if (!user) {
          console.log('Invalid credentials for:', email);
          return done(null, false, { message: 'Invalid email or password.' });
        }

        if (!user.isVerified) {
          console.log('Unverified email for:', email);
          return done(null, false, { message: 'Email not verified.' });
        }

        console.log('Successful login for:', email, 'with role:', user.role);
        return done(null, user);
      } catch (err) {
        console.error('Login error:', err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log('User not found during deserialization:', id);
        return done(null, false);
      }
      console.log('Deserialized user:', user.email, 'with role:', user.role);
      done(null, user);
    } catch (err) {
      console.error('Deserialization error:', err);
      done(err);
    }
  });

  // Auth endpoints
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      if (!user) {
        console.log('Authentication failed:', info.message);
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        console.log('User logged in successfully:', user.email, 'with role:', user.role);
        return res.json({ 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role = 'public' } = req.body;

      // Check if user exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Register new user
      const user = await storage.registerUser({
        email,
        password,
        firstName,
        lastName,
        role
      });

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.json({ 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Error during registration' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    console.log('Auth check - isAuthenticated:', req.isAuthenticated());
    console.log('Auth check - user:', req.user);
    const user = req.user as any;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  });
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAuthenticated check - session:', req.session);
  console.log('isAuthenticated check - isAuthenticated:', req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}; 
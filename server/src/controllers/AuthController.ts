import { Request, Response } from 'express';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}

const defaultAdmin: AuthUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@college.edu',
  role: 'admin',
};

const defaultStudent: AuthUser = {
  id: 'student-1',
  name: 'Student User',
  email: 'student@college.edu',
  role: 'student',
};

const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
const studentPassword = process.env.STUDENT_PASSWORD || 'Student123!';
const defaultCollegeDomain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((cookies: Record<string, string>, part) => {
    const [name, ...rest] = part.split('=');
    if (!name || rest.length === 0) return cookies;
    cookies[name.trim()] = decodeURIComponent(rest.join('=').trim());
    return cookies;
  }, {});
}

function createAuthCookie(res: Response, user: AuthUser) {
  res.cookie('skill_wizard_user', JSON.stringify(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function decodeJwtPayload(token: string): any | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    const payload = parts[1];
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const decoded = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function buildUserFromEmail(email: string): AuthUser {
  const normalizedEmail = normalizeUsername(email);
  if (normalizedEmail.includes('admin') || normalizedEmail.startsWith('admin@')) {
    return {
      ...defaultAdmin,
      email: normalizedEmail,
      name: 'Admin User',
    };
  }
  return {
    ...defaultStudent,
    email: normalizedEmail,
    name: 'Student User',
  };
}

export class AuthController {
  static login(req: Request, res: Response): Response {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const normalized = normalizeUsername(username);
    let user: AuthUser | null = null;

    if ((normalized === 'admin@college.edu' || normalized === 'admin') && password === adminPassword) {
      user = defaultAdmin;
    } else if ((normalized === 'student@college.edu' || normalized === 'student') && password === studentPassword) {
      user = defaultStudent;
    } else if (normalized.includes('@')) {
      if (password === studentPassword) {
        user = buildUserFromEmail(normalized);
      }
    } else if (normalized === 'admin' && password === adminPassword) {
      user = defaultAdmin;
    } else if (normalized === 'student' && password === studentPassword) {
      user = defaultStudent;
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    createAuthCookie(res, user);
    return res.status(200).json({ user });
  }

  static googleLogin(req: Request, res: Response): Response {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ message: 'Google idToken is required.' });
    }

    let user: AuthUser | null = null;

    if (idToken === 'dev-admin') {
      user = defaultAdmin;
    } else if (idToken === 'dev-student') {
      user = defaultStudent;
    } else {
      const payload = decodeJwtPayload(idToken);
      if (!payload || typeof payload.email !== 'string') {
        return res.status(400).json({ message: 'Unable to parse Google idToken.' });
      }

      const domain = (payload.hd || payload.email.split('@')[1] || '').toLowerCase();
      const allowedDomain = defaultCollegeDomain.toLowerCase();
      if (!domain.includes(allowedDomain) && !payload.email.toLowerCase().endsWith(`@${allowedDomain}`)) {
        return res.status(403).json({ message: `Google login requires a ${allowedDomain} email address.` });
      }

      user = buildUserFromEmail(payload.email);
      if (typeof payload.name === 'string') {
        user.name = payload.name;
      }
    }

    createAuthCookie(res, user);
    return res.status(200).json({ user });
  }

  static me(req: Request, res: Response): Response {
    const cookies = parseCookies(req);
    const userCookie = cookies.skill_wizard_user;
    if (!userCookie) {
      return res.status(200).json({ user: null });
    }

    try {
      const user = JSON.parse(userCookie) as AuthUser;
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(200).json({ user: null });
    }
  }

  static logout(req: Request, res: Response): Response {
    res.clearCookie('skill_wizard_user');
    return res.status(200).json({ message: 'Logged out successfully.' });
  }
}

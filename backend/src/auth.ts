import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Force l'utilisation de node-fetch au lieu du fetch natif
import fetch from 'node-fetch';
// @ts-ignore
globalThis.fetch = fetch;

// Configuration Supabase
const supabaseUrl = 'https://yryuqfdfnvmtkydhsifz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeXVxZmRmbnZtdGt5ZGhzaWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzQ2MTAsImV4cCI6MjA2NzE1MDYxMH0.qKT0Sm_S3cC2VFJktopBIlN0r2jFOf068dEuujcX2a4';
const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';

// Debug: vérifier que les variables d'environnement sont chargées
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '✅ Chargée' : '❌ Manquante');
console.log('Supabase Key (début):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Aucune');
console.log('JWT Secret:', jwtSecret ? '✅ Chargé' : '❌ Manquant');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  role: 'user' | 'admin' | 'superadmin';
  created_at: string;
  last_login: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country: 'France' | 'Suisse' | 'US';
}

export interface LoginData {
  email: string;
  password: string;
}

// Fonction pour hasher le mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Fonction pour vérifier le mot de passe
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Fonction pour générer un token JWT
export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

// Fonction pour vérifier un token JWT
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

// Middleware d'authentification
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Token invalide' });
  }

  req.user = user;
  next();
};

// Middleware pour vérifier les rôles
export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    next();
  };
}; 
import express, { Request } from 'express';
import { 
  supabase, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  authenticateToken, 
  requireRole,
  User,
  RegisterData,
  LoginData
} from './auth';
import { validateRegisterData, validateLoginData } from './validation';

// Étendre l'interface Request pour inclure l'utilisateur
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, country }: RegisterData = req.body;

    // Validation complète des données
    const validation = validateRegisterData({ email, password, first_name, last_name, country });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validation.errors 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          country,
          role: 'user',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }

    // Générer le token
    const token = generateToken(newUser as User);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        country: newUser.country,
        role: newUser.role
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginData = req.body;

    // Validation des données
    const validation = validateLoginData({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validation.errors 
      });
    }

    // Récupérer l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Générer le token
    const token = generateToken(user as User);

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        country: user.country,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer le profil utilisateur
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, country, role, created_at, last_login')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer tous les utilisateurs (Admin et SuperAdmin)
router.get('/users', authenticateToken, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
  try {
    let query = supabase
      .from('users')
      .select('id, email, first_name, last_name, country, role, created_at, last_login')
      .order('created_at', { ascending: false });

    // Si c'est un admin (pas superadmin), ne montrer que les utilisateurs normaux
    if (req.user.role === 'admin') {
      query = query.eq('role', 'user');
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }

    res.json({ users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour supprimer un utilisateur (Admin et SuperAdmin)
router.delete('/users/:id', authenticateToken, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.id;

    // Vérifier que l'utilisateur existe
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Un admin ne peut supprimer que des utilisateurs normaux
    if (req.user.role === 'admin' && user.role !== 'user') {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que des utilisateurs normaux' });
    }

    // Un superadmin ne peut pas se supprimer lui-même
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 
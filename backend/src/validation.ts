// Validation des données d'entrée
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validation du format d'email
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('L\'email est requis');
    return { isValid: false, errors };
  }

  // Regex pour valider le format d'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Format d\'email invalide');
  }

  // Vérifications supplémentaires
  if (email.length > 254) {
    errors.push('L\'email est trop long (maximum 254 caractères)');
  }

  if (email.includes('..') || email.includes('--')) {
    errors.push('L\'email contient des caractères invalides');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validation de la complexité du mot de passe
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Le mot de passe est requis');
    return { isValid: false, errors };
  }

  // Vérifications de complexité
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (password.length > 128) {
    errors.push('Le mot de passe est trop long (maximum 128 caractères)');
  }

  // Au moins une lettre minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }

  // Au moins une lettre majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  // Au moins un chiffre
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Pas d'espaces
  if (/\s/.test(password)) {
    errors.push('Le mot de passe ne doit pas contenir d\'espaces');
  }

  // Pas de caractères non-ASCII
  if (!/^[\x00-\x7F]*$/.test(password)) {
    errors.push('Le mot de passe ne doit contenir que des caractères ASCII');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validation des données d'inscription
export function validateRegisterData(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validation des champs requis
  if (!data.email || !data.password || !data.first_name || !data.last_name || !data.country) {
    errors.push('Tous les champs sont requis');
    return { isValid: false, errors };
  }

  // Validation de l'email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  // Validation du mot de passe
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  // Validation du prénom
  if (data.first_name.length < 2) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }
  if (data.first_name.length > 50) {
    errors.push('Le prénom est trop long (maximum 50 caractères)');
  }
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.first_name)) {
    errors.push('Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes');
  }

  // Validation du nom
  if (data.last_name.length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  if (data.last_name.length > 50) {
    errors.push('Le nom est trop long (maximum 50 caractères)');
  }
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.last_name)) {
    errors.push('Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes');
  }

  // Validation du pays
  if (!['France', 'Suisse', 'US'].includes(data.country)) {
    errors.push('Pays invalide. Les pays autorisés sont : France, Suisse, US');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validation des données de connexion
export function validateLoginData(data: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validation des champs requis
  if (!data.email || !data.password) {
    errors.push('Email et mot de passe requis');
    return { isValid: false, errors };
  }

  // Validation de l'email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  // Validation basique du mot de passe (pas de complexité pour la connexion)
  if (data.password.length === 0) {
    errors.push('Le mot de passe est requis');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validation des données de filtres
export function validateFilterData(data: {
  diseases?: string[];
  metrics?: string[];
  countries?: string[];
  startDate?: string;
  endDate?: string;
  timeGrouping?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validation des maladies
  if (!data.diseases || data.diseases.length === 0) {
    errors.push('Au moins une maladie doit être sélectionnée');
  } else {
    const validDiseases = ['Covid19', 'Variole du Singe'];
    const invalidDiseases = data.diseases.filter(disease => !validDiseases.includes(disease));
    if (invalidDiseases.length > 0) {
      errors.push(`Maladies invalides : ${invalidDiseases.join(', ')}`);
    }
  }

  // Validation des métriques
  if (!data.metrics || data.metrics.length === 0) {
    errors.push('Au moins une métrique doit être sélectionnée');
  } else {
    const validMetrics = ['Cas actifs', 'Décès', 'Total des cas', 'Total des morts', 'Nouveaux cas', 'Population', 'Vaccinations'];
    const invalidMetrics = data.metrics.filter(metric => !validMetrics.includes(metric));
    if (invalidMetrics.length > 0) {
      errors.push(`Métriques invalides : ${invalidMetrics.join(', ')}`);
    }
  }

  // Validation des pays
  if (!data.countries || data.countries.length === 0) {
    errors.push('Au moins un pays doit être sélectionné');
  }

  // Validation des dates
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (isNaN(startDate.getTime())) {
      errors.push('Date de début invalide');
    }
    if (isNaN(endDate.getTime())) {
      errors.push('Date de fin invalide');
    }
    if (startDate > endDate) {
      errors.push('La date de début doit être antérieure à la date de fin');
    }
  }

  // Validation du regroupement temporel
  if (data.timeGrouping && !['day', 'week', 'month'].includes(data.timeGrouping)) {
    errors.push('Regroupement temporel invalide. Valeurs autorisées : day, week, month');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 
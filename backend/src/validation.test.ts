import { 
  validateEmail, 
  validatePassword, 
  validateRegisterData, 
  validateLoginData, 
  validateFilterData 
} from './validation';

// Tests pour la validation d'email
console.log('=== Tests de validation d\'email ===');

// Tests valides
console.log('Email valide:', validateEmail('test@example.com').isValid); // true
console.log('Email avec sous-domaine:', validateEmail('user@sub.domain.com').isValid); // true
console.log('Email avec tirets:', validateEmail('user-name@domain.co.uk').isValid); // true

// Tests invalides
console.log('Email sans @:', validateEmail('testexample.com').isValid); // false
console.log('Email sans domaine:', validateEmail('test@').isValid); // false
console.log('Email avec espaces:', validateEmail('test @example.com').isValid); // false
console.log('Email avec points consécutifs:', validateEmail('test..user@example.com').isValid); // false

// Tests pour la validation de mot de passe
console.log('\n=== Tests de validation de mot de passe ===');

// Tests valides
console.log('Mot de passe valide:', validatePassword('SecurePass123!').isValid); // true
console.log('Mot de passe complexe:', validatePassword('MyP@ssw0rd_2024').isValid); // true

// Tests invalides
console.log('Mot de passe trop court:', validatePassword('Abc1!').isValid); // false
console.log('Pas de majuscule:', validatePassword('securepass123!').isValid); // false
console.log('Pas de minuscule:', validatePassword('SECUREPASS123!').isValid); // false
console.log('Pas de chiffre:', validatePassword('SecurePass!').isValid); // false
console.log('Pas de caractère spécial:', validatePassword('SecurePass123').isValid); // false
console.log('Avec espaces:', validatePassword('Secure Pass 123!').isValid); // false

// Tests pour la validation d'inscription
console.log('\n=== Tests de validation d\'inscription ===');

// Test valide
const validRegisterData = {
  email: 'test@example.com',
  password: 'SecurePass123!',
  first_name: 'Jean',
  last_name: 'Dupont',
  country: 'France'
};
console.log('Données d\'inscription valides:', validateRegisterData(validRegisterData).isValid); // true

// Test invalide
const invalidRegisterData = {
  email: 'invalid-email',
  password: 'weak',
  first_name: 'J',
  last_name: '',
  country: 'InvalidCountry'
};
const registerValidation = validateRegisterData(invalidRegisterData);
console.log('Données d\'inscription invalides:', registerValidation.isValid); // false
console.log('Erreurs d\'inscription:', registerValidation.errors);

// Tests pour la validation de connexion
console.log('\n=== Tests de validation de connexion ===');

// Test valide
const validLoginData = {
  email: 'test@example.com',
  password: 'anypassword'
};
console.log('Données de connexion valides:', validateLoginData(validLoginData).isValid); // true

// Test invalide
const invalidLoginData = {
  email: 'invalid-email',
  password: ''
};
const loginValidation = validateLoginData(invalidLoginData);
console.log('Données de connexion invalides:', loginValidation.isValid); // false
console.log('Erreurs de connexion:', loginValidation.errors);

// Tests pour la validation des filtres
console.log('\n=== Tests de validation des filtres ===');

// Test valide
const validFilterData = {
  diseases: ['Covid19'],
  metrics: ['Cas actifs', 'Décès'],
  countries: ['France'],
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  timeGrouping: 'day'
};
console.log('Données de filtres valides:', validateFilterData(validFilterData).isValid); // true

// Test invalide
const invalidFilterData = {
  diseases: ['InvalidDisease'],
  metrics: ['InvalidMetric'],
  countries: [],
  startDate: '2023-12-31',
  endDate: '2023-01-01', // Date de fin avant date de début
  timeGrouping: 'invalid'
};
const filterValidation = validateFilterData(invalidFilterData);
console.log('Données de filtres invalides:', filterValidation.isValid); // false
console.log('Erreurs de filtres:', filterValidation.errors);

console.log('\n=== Tests terminés ==='); 
import 'dotenv/config';
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://yryuqfdfnvmtkydhsifz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeXVxZmRmbnZtdGt5ZGhzaWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzQ2MTAsImV4cCI6MjA2NzE1MDYxMH0.qKT0Sm_S3cC2VFJktopBIlN0r2jFOf068dEuujcX2a4';

console.log('Test de connexion à Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY ? '✅ Présente' : '❌ Manquante');

async function testSupabase() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.text();
      console.log('✅ Connexion réussie!');
      console.log('Réponse:', data);
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testSupabase(); 
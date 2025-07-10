import fetch from 'node-fetch';

const SUPABASE_URL = 'https://yryuqfdfnvmtkydhsifz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeXVxZmRmbnZtdGt5ZGhzaWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzQ2MTAsImV4cCI6MjA2NzE1MDYxMH0.qKT0Sm_S3cC2VFJktopBIlN0r2jFOf068dEuujcX2a4';

async function testUsersTable() {
  try {
    console.log('Test de la table users...');
    
    // Test 1: Vérifier si la table existe
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('Réponse:', data);

    if (response.ok) {
      console.log('✅ Table users accessible!');
    } else {
      console.log('❌ Erreur avec la table users');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testUsersTable(); 
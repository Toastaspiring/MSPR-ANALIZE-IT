import fetch from 'node-fetch';

async function testRegister() {
  try {
    console.log('Test de la route d\'inscription...');
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123',
        first_name: 'Test',
        last_name: 'User',
        country: 'France'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('Réponse:', data);

    if (response.ok) {
      console.log('✅ Inscription réussie!');
    } else {
      console.log('❌ Erreur lors de l\'inscription');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testRegister(); 
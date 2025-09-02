const axios = require('axios');

async function debugCarteraDeletion() {
  console.log('🔍 Debug de eliminación de contribuyentes...\\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. Login como admin
    console.log('1. Login como admin...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response data:', loginResponse.data);
    console.log('Login response headers:', loginResponse.headers);
    
    if (loginResponse.data.message === 'Login exitoso') {
      const cookies = loginResponse.headers['set-cookie'];
      console.log('Cookies:', cookies);
      
      if (cookies) {
        const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
        if (authCookie) {
          const authToken = authCookie.split('=')[1].split(';')[0];
          console.log('Auth token:', authToken);
          
          // 2. Obtener contribuyentes
          console.log('\\n2. Obteniendo contribuyentes...');
          const contribuyentesResponse = await axios.get(`${baseURL}/api/admin/cartera-contribuyentes`, {
            headers: {
              'Cookie': `auth_token=${authToken}`
            }
          });
          
          console.log('Contribuyentes response status:', contribuyentesResponse.status);
          console.log('Contribuyentes count:', contribuyentesResponse.data.length);
          
          if (contribuyentesResponse.data.length > 0) {
            const firstContribuyente = contribuyentesResponse.data[0];
            console.log('Primer contribuyente:', firstContribuyente);
            
            // 3. Intentar eliminar
            console.log('\\n3. Intentando eliminar...');
            try {
              const deleteResponse = await axios.delete(`${baseURL}/api/admin/cartera-contribuyentes/${firstContribuyente.id}`, {
                headers: {
                  'Cookie': `auth_token=${authToken}`
                }
              });
              
              console.log('Delete response status:', deleteResponse.status);
              console.log('Delete response data:', deleteResponse.data);
            } catch (deleteError) {
              console.log('Delete error status:', deleteError.response?.status);
              console.log('Delete error data:', deleteError.response?.data);
              console.log('Delete error message:', deleteError.message);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugCarteraDeletion(); 
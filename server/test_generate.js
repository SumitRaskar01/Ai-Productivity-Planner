const axios = require('axios');

async function test() {
  try {
    const registerRes = await axios.post('http://localhost:8080/api/auth/register', {
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    const token = registerRes.data.token;
    
    const planRes = await axios.post('http://localhost:8080/api/plan/generate', {
      inputText: "Wake up at 7am, run for 30 minutes, then work."
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(planRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
test();

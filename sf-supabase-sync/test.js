import axios from 'axios';

const params = new URLSearchParams();
params.append('grant_type', 'password'); 
params.append('client_id', 'sf-client-id');
params.append('client_secret', 'sf-secret-key');
params.append('username', 'sf-username');
params.append('password', 'sf-password-token-key');

axios.post('https://login.salesforce.com/services/oauth2/token', params)
  .then(res => console.log('✅ Success:', res.data))
  .catch(err => {
    console.error('❌ Error:', err.response?.status, err.response?.data || err.message);
  });
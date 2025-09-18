import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Step 1: Authenticate with Salesforce
async function authenticateSalesforce() {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', process.env.SF_CLIENT_ID);
  params.append('client_secret', process.env.SF_CLIENT_SECRET);
  params.append('username', process.env.SF_USERNAME);
  params.append('password', process.env.SF_PASSWORD); // append token if needed

  const response = await axios.post('https://login.salesforce.com/services/oauth2/token', params);
  return response.data;
}

// Step 2: Fetch Account records
async function fetchAccounts(accessToken, instanceUrl) {
  const query = 'SELECT Id, Name, Industry FROM Account LIMIT 10';
  const url = `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.records;
}

// Step 3: Push to Supabase via REST API
async function syncToSupabase(accounts) {
  const formatted = accounts.map((acc) => ({
    id: acc.Id,
    name: acc.Name,
    industry: acc.Industry || null,
  }));

  const response = await axios.post(
    `${process.env.SUPABASE_URL}/rest/v1/accounts`,
    formatted,
    {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates', // for UPSERT behavior
      },
    }
  );

  console.log(`✅ Synced ${formatted.length} account(s) to Supabase`);
  return response.data;
}

// Run the sync
(async () => {
  try {
    const auth = await authenticateSalesforce();
    const accounts = await fetchAccounts(auth.access_token, auth.instance_url);
    await syncToSupabase(accounts);
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();

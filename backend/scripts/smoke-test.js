// Simple smoke test: register, login, book, get capacity
const base = 'http://localhost:3000';
const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const username = `smoke_${Date.now()}`;
    const password = 'pass1234';
    console.log('Registering', username);
    let res = await fetch(`${base}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
    });
    const reg = await res.json();
    if (!res.ok) throw new Error('Register failed: ' + JSON.stringify(reg));
    console.log('Registered, token received');

    console.log('Booking slot');
    res = await fetch(`${base}/gyms/gym-1/book`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${reg.token}` }, body: JSON.stringify({})
    });
    const book = await res.json();
    console.log('Book response:', book);

    console.log('Fetching capacity');
    res = await fetch(`${base}/gyms/gym-1/capacity`);
    const cap = await res.json();
    console.log('Capacity:', cap);
  } catch (err) {
    console.error('Smoke test failed', err);
    process.exit(1);
  }
}

run();

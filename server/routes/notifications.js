const admin = require('firebase-admin');
const serviceAccount = require('../path-to-your-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post('/api/send-notification', async (req, res) => {
  try {
    const { token, title, body } = req.body;
    
    const message = {
      notification: {
        title,
        body,
      },
      token: token
    };

    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
}); 
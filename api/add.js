const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const sheetId = req.query.sheetid;
  if (!sheetId) {
    return res.status(400).json({ error: 'sheetid parameter is required' });
  }

  const body = req.body;
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'No data provided in body' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        // 🔐 Add your credentials here
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [Object.values(body)];
    const range = 'Sheet1'; // You can change this to your specific sheet name

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values }
    });

    return res.status(200).json({ success: true, message: 'Data added successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add data', details: error.message });
  }
};

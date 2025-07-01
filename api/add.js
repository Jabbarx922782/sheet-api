const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const sheetId = req.query.sheetid;
  if (!sheetId) {
    return res.status(400).json({ error: 'sheetid parameter is required' });
  }

  const bodyData = req.body;
  if (!bodyData || typeof bodyData !== 'object') {
    return res.status(400).json({ error: 'Invalid or empty request body' });
  }

  try {
    // Auth with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const values = Object.values(bodyData);

    // Append row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1', // or your sheet name
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    res.status(200).json({ success: true, message: 'Row added', data: bodyData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add data', details: err.message });
  }
};

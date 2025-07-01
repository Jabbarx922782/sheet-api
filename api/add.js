const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credentials.json'); // এই ফাইলটি পরে বানাতে হবে

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sheetId = req.query.sheetid;
  if (!sheetId) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  try {
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow(req.body);

    res.status(200).json({ success: true, data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add data', details: error.message });
  }
};

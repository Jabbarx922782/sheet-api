const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { sheetid } = req.query;
  if (!sheetid) return res.status(400).json({ error: "sheetid required" });

  const creds = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  try {
    const doc = new GoogleSpreadsheet(sheetid);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow(req.body);

    res.status(200).json({ success: true, message: "Row added", data: req.body });
  } catch (error) {
    res.status(500).json({ error: "Failed to add row", details: error.message });
  }
};

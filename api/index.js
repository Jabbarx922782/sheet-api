const { google } = require("googleapis");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const sheetId = req.query.sheetid;
  if (!sheetId) return res.status(400).json({ error: "sheetid parameter is required" });

  const body = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const values = [Object.values(body)];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return res.status(200).json({ success: true, added: body });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add data", details: err.message });
  }
};

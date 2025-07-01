const axios = require("axios");

module.exports = async (req, res) => {
  const { sheetid } = req.query;

  if (!sheetid) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetid}/gviz/tq?tqx=out:json&cacheBust=${Date.now()}`;

  try {
    const response = await axios.get(url);
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);

    if (!match) {
      return res.status(500).json({ error: "Invalid sheet response. Make sure headers exist and it's published." });
    }

    const json = JSON.parse(match[1]);
    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows;

    const result = [];

    rows.forEach(row => {
      row.c.forEach((cell, i) => {
        const key = headers[i];
        const value = cell && cell.v !== null ? cell.v : null;
        if (key && value !== null) {
          result.push({ [key]: value });
        }
      });
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

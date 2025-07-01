const axios = require("axios");

module.exports = async (req, res) => {
  const { sheetid } = req.query;

  if (!sheetid) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetid}/gviz/tq?tqx=out:json`;

  try {
    const response = await axios.get(url);
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);

    if (!match) {
      return res.status(500).json({ error: "Invalid sheet response. Make sure it's published to the web." });
    }

    const json = JSON.parse(match[1]);
    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[headers[i]] = cell ? cell.v : null;
      });
      return obj;
    });

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

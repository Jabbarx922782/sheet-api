const axios = require("axios");

module.exports = async (req, res) => {
  const { sheetid } = req.query;
  if (!sheetid) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  const now = Date.now(); // cache bust
  const url = `https://docs.google.com/spreadsheets/d/${sheetid}/gviz/tq?tqx=out:json&cacheBust=${now}`;

  try {
    const response = await axios.get(url);
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    if (!match) {
      return res.status(500).json({ error: "Invalid Google Sheet response." });
    }

    const json = JSON.parse(match[1]);
    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows;

    const output = {};

    // initialize arrays for each header
    headers.forEach(header => {
      if (header) output[header] = [];
    });

    rows.forEach(row => {
      row.c.forEach((cell, i) => {
        const header = headers[i];
        if (header) {
          output[header].push(cell && cell.v !== null ? cell.v : null);
        }
      });
    });

    return res.status(200).json(output);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

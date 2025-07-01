const axios = require("axios");

let cache = {};
const CACHE_TIME = 5 * 60 * 1000; // 5 মিনিট

module.exports = async (req, res) => {
  const { sheetid } = req.query;

  if (!sheetid) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  // Cache Check
  if (cache[sheetid] && (Date.now() - cache[sheetid].time < CACHE_TIME)) {
    return res.status(200).json(cache[sheetid].data);
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetid}/gviz/tq?tqx=out:json`;

  try {
    const response = await axios.get(url);
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);

    if (!match) {
      return res.status(500).json({ error: "Invalid sheet response. Make sure it's published and first row has headers." });
    }

    const json = JSON.parse(match[1]);

    // Headers (Keys) – প্রথম row থেকে
    const headers = json.table.cols.map(col => col.label || `Column_${col.id}`);

    // Rows → key-value format
    const rows = json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[headers[i]] = cell ? cell.v : null;
      });
      return obj;
    });

    // Set Cache
    cache[sheetid] = {
      time: Date.now(),
      data: rows
    };

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

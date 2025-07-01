const axios = require("axios");

let cache = {};
const CACHE_TIME = 5 * 60 * 1000; // ৫ মিনিট

module.exports = async (req, res) => {
  const { sheetid } = req.query;

  if (!sheetid) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  // Cache চেক
  if (cache[sheetid] && (Date.now() - cache[sheetid].time < CACHE_TIME)) {
    return res.status(200).json(cache[sheetid].data);
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetid}/gviz/tq?tqx=out:json`;

  try {
    const response = await axios.get(url);
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);

    if (!match) {
      return res.status(500).json({ error: "Invalid sheet response. Make sure it's published to the web." });
    }

    const json = JSON.parse(match[1]);
    const rows = json.table.rows;

    const result = {};

    rows.forEach(row => {
      const cells = row.c;
      if (cells && cells[0] && cells[1]) {
        const key = cells[0].v;
        const value = cells[1].v;
        result[key] = value;
      }
    });

    // Cache Save
    cache[sheetid] = {
      time: Date.now(),
      data: result
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

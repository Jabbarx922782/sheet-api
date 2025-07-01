const axios = require("axios");

module.exports = async (req, res) => {
  const { sheetid } = req.query;
  if (!sheetid) return res.status(400).json({ error: "sheetid parameter is required" });

  const url = `https://docs.google.com/spreadsheets/d/${sheetid}/gviz/tq?tqx=out:json`;

  try {
    const response = await axios.get(url);
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    if (!match) return res.status(500).json({ error: "Invalid sheet response." });

    const json = JSON.parse(match[1]);
    const rows = json.table.rows;

    const output = {};
    rows.forEach(row => {
      const cells = row.c;
      if (cells && cells[0] && cells[1]) {
        output[cells[0].v] = cells[1].v;
      }
    });

    return res.status(200).json(output);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

const express = require("express");
const axios = require("axios");
const app = express();

app.get("/", async (req, res) => {
  const sheetId = req.query.sheetid;
  if (!sheetId) {
    return res.status(400).json({ error: "sheetid parameter is required" });
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

  try {
    const response = await axios.get(url);
    let data = response.data;

    const jsonStr = data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1];
    const parsed = JSON.parse(jsonStr);

    const headers = parsed.table.cols.map(col => col.label);
    const rows = parsed.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[headers[i]] = cell ? cell.v : null;
      });
      return obj;
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

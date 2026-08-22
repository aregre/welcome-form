const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database("data.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section1 TEXT NOT NULL,
    section2 TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/submissions", (req, res) => {
  const { section1, section2 } = req.body;

  if (
    typeof section1 !== "string" ||
    typeof section2 !== "string" ||
    !section1.trim() ||
    !section2.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Both sections are required."
    });
  }

  const result = db.prepare(`
    INSERT INTO submissions (section1, section2)
    VALUES (?, ?)
  `).run(section1.trim(), section2.trim());

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.get("/api/admin/submissions", (req, res) => {
  const submissions = db.prepare(`
    SELECT id, section1, section2, created_at
    FROM submissions
    ORDER BY id DESC
  `).all();

  res.json(submissions);
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log(" Website: http://localhost:" + PORT);
  console.log(" Admin:   http://localhost:" + PORT + "/admin");
  console.log("================================");
  console.log("");
});
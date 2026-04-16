const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;
const path = require('path');
const DB_PATH = path.join(__dirname, 'schoolData.db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbInit = new sqlite3.Database(DB_PATH);
dbInit.serialize(() => {
  dbInit.run(`
    CREATE TABLE IF NOT EXISTS students (
      studentid INTEGER PRIMARY KEY,
      name TEXT
    )
  `);

  dbInit.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      student INTEGER,
      subject TEXT,
      FOREIGN KEY (student) REFERENCES students (studentid)
    )
  `);
});
dbInit.close();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', (req, res) => {
  const db = sqlite3.Database(DB_PATH);
  const { name, classname } = req.body;

  db.run(`INSERT INTO users (student, subject) VALUES (?,?)`, [name, classname],);
  db.close();
  res.sendStatus(200);
  
  });

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

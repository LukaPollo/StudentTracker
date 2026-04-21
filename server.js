const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;
const db_path = path.join(__dirname, 'schoolData.db')
const db = new sqlite3.Database(db_path);

app.use(express.json());

db.run(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subjectid INTEGER NOT NULL,
    FOREIGN KEY (subjectid) REFERENCES subjects (id)
  )
`);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/students', (req, res) => {
  res.sendFile(path.join(__dirname, 'students.html'));
})

app.get('/studentsdata', (req, res) => {
  db.all(`
    SELECT students.id, students.name, subjects.name AS subject
    FROM students
    INNER JOIN subjects ON students.subjectid = subjects.id
    ORDER BY subjects.name, students.name
  `, (err, rows) => {
    res.json(rows);
  })
})

app.get('/subjects', (req, res) => {
  db.all(`SELECT * FROM subjects`, (err, rows) => {
    res.json(rows);
  })
})

app.post('/student', (req, res) => {
    const {name, subject} = req.body;

    db.run(`INSERT INTO subjects (name) VALUES (?)`, [subject], () => {
        db.get(`SELECT * FROM subjects WHERE name = ?`, [subject], (err, subjectRow) => {
            db.run(`INSERT INTO students (name, subjectid) VALUES (?,?)`, [name, subjectRow.id], function () {
                res.json({
                    id: this.lastID,
                    name:name,
                    subject: subject
                })
            })
        })
    })
})

app.put('/student/:id', (req, res) => {
    const {name} = req.body;
    db.run(`UPDATE students SET name = ? WHERE id = ?`, [name, req.params.id], function () {
        res.json({
            id: req.params.id,
            name: name
        })
    })
})

app.delete('/student/:id', (req, res) => {

    db.run(`DELETE FROM STUDENTS WHERE id = ?`, [req.params.id], function () {
        res.json({success: true});
    });
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

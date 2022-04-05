const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const db_name = path.join(__dirname, "data", "students.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'students.db'");
});

const sql_create = `CREATE TABLE IF NOT EXISTS Students (
  Student_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name VARCHAR(100) NOT NULL,
  Course VARCHAR(100) NOT NULL,
  Comments TEXT
);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Students' table");
  
  const sql_insert = `INSERT INTO Students (Student_ID, Name, Course, Comments) VALUES
  (1, 'Jerry', 'BIS', 'Has good marks'),
  (2, 'Tom', 'BIS', 'Bad attendance');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 2 Students");
  });
});


const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); 

app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/students", (req, res) => {
    const sql = "SELECT * FROM Students ORDER BY Name"
    db.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("students", { model: rows });
    });
  });

  app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Students WHERE Student_ID = ?";
    db.get(sql, id, (err, row) => {
      
      res.render("edit", { model: row });
    });
  });

  app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const student = [req.body.Name, req.body.Course, req.body.Comments, id];
    const sql = "UPDATE Students SET Name = ?, Course = ?, Comments = ? WHERE (Student_ID = ?)";
    db.run(sql, student, err => {
    
      res.redirect("/students");
    });
  });

  app.get("/create", (req, res) => {
    res.render("create", { model: {} });
  });

  app.post("/create", (req, res) => {
    const sql = "INSERT INTO Students (Name, Course, Comments) VALUES (?, ?, ?)";
    const student = [req.body.Name, req.body.Course, req.body.Comments];
    db.run(sql, student, err => {
      
      res.redirect("/students");
    });
  });

  app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Students WHERE Student_ID = ?";
    db.get(sql, id, (err, row) => {
      
      res.render("delete", { model: row });
    });
  });

  app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Students WHERE Student_ID = ?";
    db.run(sql, id, err => {
      
      res.redirect("/students");
    });
  });

  var constraints = {
    name: {
      presence: true
    }
  };
  
  var validate = require("validate.js");
  validate({input: ""}, {input: {presence: {allowEmpty: false}}});
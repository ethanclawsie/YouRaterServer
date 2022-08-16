const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
app.use(cors());
app.listen(4040, () => console.log(`Running on port 4040!`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Setup

const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});
//Connects to database

app.post("/valget", (req, res) => {
  const value = req.body.value;
  const videoid = req.body.videoid;
  const userid = req.body.uuid;
  connection.query(
    `SELECT * FROM datatable WHERE uuid = '${userid}' AND vidid = '${videoid}'`,
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.length > 0) {
          connection.query(
            `DELETE FROM datatable WHERE uuid = '${userid}' AND vidid = '${videoid}'`,
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
              }
            }
          );
          connection.query(
            `INSERT INTO datatable (uuid, vidid, rating) VALUES ('${userid}', '${videoid}', '${value}')`,
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
              }
            }
          );
          //If there is already a row for this video
        } else {
          connection.query(
            `INSERT INTO datatable (uuid, vidid, rating) VALUES ('${userid}', '${videoid}', '${value}')`,
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
              }
            }
          );
        }
        //If there is no row for this video
        connection.query(
          `SELECT AVG(rating) AS average FROM datatable WHERE vidid = ?`,
          [videoid],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              app.post("/yourget", (req, res) => {
                const videoid = req.body.videoid;
                const userid = req.body.uuid;
                connection.query(
                  `SELECT * FROM datatable WHERE vidid = ? AND uuid = ?`,
                  [videoid, userid],
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else if (result[0] == null) {
                      res.send("No rating yet");
                    } else {
                      res.send("" + value + "");
                    }
                  }
                );
              });
            }
          }
        );
      }
    }
  );
});

app.post("/yourget", (req, res) => {
  const videoid = req.body.videoid;
  const userid = req.body.uuid;
  connection.query(
    `SELECT * FROM datatable WHERE vidid = ? AND uuid = ?`,
    [videoid, userid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else if (result[0] == null) {
        res.send("No rating yet");
      } else {
        res.send("" + result[0].rating + "");
      }
    }
  );
});

app.post("/avgget", (req, res) => {
  const videoid = req.body.videoid;
  connection.query(
    `SELECT AVG(rating) AS average FROM datatable WHERE vidid = ?`,
    [videoid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else if (result[0].average == null) {
        res.send("No average rating yet");
      } else {
        const roundedavg = Math.round(result[0].average * 10) / 10;
        res.send("" + roundedavg + "");
      }
    }
  );
});
//Gets the average rating for a video

app.post("/countget", (req, res) => {
  const videoid = req.body.videoid;
  connection.query(
    `SELECT COUNT(*) AS count FROM datatable WHERE vidid = ?`,
    [videoid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("" + result[0].count + "");
      }
    }
  );
});
//Gets the number of ratings for a video

app.post("/deletedata", (req, res) => {
  const userid = req.body.uuid;
  const value = req.body.value;
  if (value == "1") {
    connection.query(
      `DELETE FROM datatable WHERE uuid = '${userid}'`,
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Deleted data for user " + userid);
        }
      }
    );
  }
});
//Deletes all data for a user

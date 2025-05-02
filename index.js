const express = require('express');
const app = express();
const fs = require("fs")
const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
const job = require('./cron.js').job;
app.get("/info/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find(user => user.id == id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
})
app.get("/create", (req, res) => {
  var uid = req.query.uid;
  form = {
    id: uid,
    playstyle: "Hinata",
    lvl: 1,
    vballs: 0
  }
})
app.get("/update/:id/:type", (req, res) => {
  const id = req.params.id;
  const type = req.params.type;
  const user = users.find(user => user.id == id);
  const value = req.query.value;
  if (user) {
    if (!type in user) {
      res.status(404).json({ error: "Type not found" });
    } else {
      user[type] = value;
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
})
app.listen("3000", ()=> {
  console.log("Running on port 3000")
}) 
job.start()

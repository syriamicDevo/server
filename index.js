const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const { exec } = require('child_process');
const { job } = require('./database/cron.js')


const DATABASE_DIR = path.join(__dirname, 'database', 'players');

// Ensure database folder exists
if (!fs.existsSync(DATABASE_DIR)) {
  fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

// Utility: Load all players from the file system safely
function loadAllPlayers() {
  const files = fs.readdirSync(DATABASE_DIR);
  const players = [];

  for (const file of files) {
    const filePath = path.join(DATABASE_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      players.push(data);
    } catch (err) {
      console.error(`Error reading or parsing ${filePath}`, err);
    }
  }

  return players;
}

// UID generator (based on current player count)
function createUID() {
  const files = fs.readdirSync(DATABASE_DIR);
  const startsWith = "1053";
  return (startsWith + (files.length + 1)).toString();
}

// Keycard generator (e.g., random 8-digit number)
function generateKeycard() {
  let keycard;
  const players = loadAllPlayers();
  const existingKeycards = new Set(players.map(p => p.keycard));

  // Ensure uniqueness
  do {
    keycard = Math.floor(10000000 + Math.random() * 90000000).toString();
  } while (existingKeycards.has(keycard));

  return keycard;
}

// GET: Get player info by UID
// GET: Get player info (by id or by keycard)
app.get("/getInfo", (req, res) => {
  const { id, keycard } = req.query;
  const players = loadAllPlayers();

  if (id) {
    // Fetch by UID — Public access (no keycard required)
    const player = players.find(p => p.uid === id);
    if (!player) {
      return res.status(404).json({ error: "Player not found with provided id" });
    }

    // Clone the player object and remove the keycard before sending
    const { keycard, ...safeData } = player;
    return res.json(safeData);
  }

  if (keycard) {
    // Fetch by keycard — Owner access
    const player = players.find(p => p.keycard === keycard);
    if (!player) {
      return res.status(404).json({ error: "Player not found with provided keycard" });
    }

    return res.json(player); // Full data, including keycard
  }

  // Neither provided
  return res.status(400).json({ error: "Either 'id' or 'keycard' must be provided" });
});



// GET: Create a new player (only requires ign)
app.get("/createPlayer", (req, res) => {
  const ign = req.query.ign;

  if (!ign || ign.trim() === '') {
    return res.status(400).json({ error: "IGN is required" });
  }

  const players = loadAllPlayers();

  // Check if IGN already exists (case-insensitive)
  const existingByIGN = players.find(p => p.ign.toLowerCase() === ign.toLowerCase());
  if (existingByIGN) {
    return res.status(409).json({ error: "IGN already in use" });
  }

  const uid = createUID();
  const keycard = generateKeycard();

  const playerData = {
    uid,
    keycard,
    ign,
    money: 0,
    inventory: [],
    inbox: []
  };

  const filePath = path.join(DATABASE_DIR, `${uid}.json`);
  fs.writeFileSync(filePath, JSON.stringify(playerData, null, 2));

  res.redirect(`/getInfo?keycard=${keycard}`);
});
app.get("/avatar", (req,res) => {
  res.sendFile("./database/avatars/10531.png")
})
// Start server
app.listen(3000, () => {
  console.log("Player API running at http://localhost:3000");
});
job.start()

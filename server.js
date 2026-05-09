const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = path.join(__dirname, "users.json");
const MESSAGES_FILE = path.join(__dirname, "messages.json");

// SAFE READ (prevents crash if file missing)
function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    console.log("Read error:", err);
    return fallback;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function readUsers() {
  return readJSON(USERS_FILE, []);
}

function saveUsers(users) {
  writeJSON(USERS_FILE, users);
}

function readMessages() {
  return readJSON(MESSAGES_FILE, []);
}

function saveMessages(messages) {
  writeJSON(MESSAGES_FILE, messages);
}

// LOGIN / REGISTER
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  let users = readUsers();

  let user = users.find(u => u.username === username);

  if (user) {
    if (user.password !== password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    return res.json({ message: "Logged in" });
  }

  users.push({ username, password });
  saveUsers(users);

  res.json({ message: "Account created" });
});

// GET MESSAGES
app.get("/messages", (req, res) => {
  res.json(readMessages());
});

// POST MESSAGE
app.post("/messages", (req, res) => {
  const { username, text } = req.body;

  let messages = readMessages();

  messages.push({ username, text });

  saveMessages(messages);

  res.json({ success: true });
});

// IMPORTANT: Render port fix
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
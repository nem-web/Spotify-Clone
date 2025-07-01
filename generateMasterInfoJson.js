// generateMasterInfoJson.js

const fs = require("fs");
const path = require("path");

const SONGS_DIR = path.join(__dirname, "songs");

// Customize display titles/descriptions here
const meta = {
  Bhojpuri: {
    title: "Bhojpuri Beats",
    description: "Top 10 Bhojpuri songs",
  },
  English: {
    title: "English Pop",
    description: "Top 20 English songs",
  },
  oldHindi: {
    title: "Old Hindi Classics",
    description: "Old is gold",
  },
  newHindi: {
    title: "Hindi Hits",
    description: "Latest Hindi songs",
  },
  Haryanavi: {
    title: "Haryanavi Hits",
    description: "Top Haryanavi songs",
  },
  Lofi: {
    title: "Lofi Lounge",
    description: "Relax and focus",
  },
  Chill: {
    title: "Chill Hits",
    description: "Best chill music",
  },
  Punjabi: {
    title: "Punjabi Party",
    description: "Top Punjabi bangers",
  },
  Tharu: {
    title: "Tharu Trending",
    description: "Hot Tharu tracks",
  },
};

function getSongs(folderPath) {
  return fs
    .readdirSync(folderPath)
    .filter(file => file.toLowerCase().endsWith(".mp3"))
    .sort();
}

function generateMasterJson() {
  const folders = fs
    .readdirSync(SONGS_DIR)
    .filter(f => fs.statSync(path.join(SONGS_DIR, f)).isDirectory());

  const master = {};

  for (const folder of folders) {
    const folderPath = path.join(SONGS_DIR, folder);
    const songs = getSongs(folderPath);

    if (songs.length === 0) continue;

    master[folder] = {
      title: meta[folder]?.title || `${folder} Songs`,
      description: meta[folder]?.description || `Top songs from ${folder}`,
      songs: songs,
    };
  }

  const outputPath = path.join(SONGS_DIR, "info.json");
  fs.writeFileSync(outputPath, JSON.stringify(master, null, 2));
  console.log("✅ songs/info.json generated successfully.");
}

generateMasterJson();

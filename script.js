let currentSong = new Audio();
let songs = [];
let currFolder = "";
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

// Format time in mm:ss
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const total = Math.round(seconds);
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

// Play music by track name
const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) {
        currentSong.pause();
        play.src = "img/playButton.png";
    }
    currentSong.play();
    play.src = "img/pauseButton.svg";
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

// Update song list in the left panel
function updateSongListUI(songList) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songList) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.png" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Nem</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/playButton.png" alt="">
            </div>
        </li>`;
    }

    document.querySelectorAll(".songList li").forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });
}

// Display album cards dynamically
async function displayAlbums() {
    const response = await fetch("/songs/info.json");
    const data = await response.json();
    const cardContainer = document.querySelector(".cardContainer");

    for (let folder in data) {
        const album = data[folder];

        cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="green" />
                    <polygon points="40,30 70,50 40,70" fill="black" stroke="black" stroke-width="2" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    }

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", () => {
            const folder = card.dataset.folder;
            songs = data[folder].songs;
            currFolder = `/songs/${folder}`;
            playMusic(songs[0], true);
            updateSongListUI(songs);
        });
    });
}

// Main function
async function main() {
    await displayAlbums();

    // Play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pauseButton.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.png";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = formatTime(currentSong.currentTime) + " / " + formatTime(currentSong.duration);
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    // Hamburger open/close
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous/Next buttons
    previous.addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Mute/Unmute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        const img = e.target;
        if (img.src.includes("volume.svg")) {
            img.src = img.src.replace("volume.svg", "muteSong.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            img.src = img.src.replace("muteSong.svg", "volume.svg");
            currentSong.volume = 0.5;
            document.querySelector(".range input").value = 50;
        }
    });
}

main();

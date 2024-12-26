let currentSong = new Audio();
let songs;
let currFolder;

//function to convert seconds in mm:ss format
function formatTime(seconds) {
    //if time in NaN
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    // Round the total seconds to the nearest integer
    const totalSeconds = Math.round(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Ensure both are two-digit numbers
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }


    //show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.png" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Nem</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/playButton.png" alt="">
                            </div> </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.pause()
        play.src = "img/playButton.svg"
    }
    currentSong.play()
    play.src = "img/pauseButton.svg"
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        //Create album cards
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //Get meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
                                    <!-- Circular background -->
                                    <circle cx="50" cy="50" r="48" fill="green" />
                                    <!-- Play triangle -->
                                    <polygon points="40,30 70,50 40,70" fill="black" stroke="black" stroke-width="2" />
                                </svg>
    
                            </div>
                            <img src="/songs/${folder}/cover.jpeg" alt="">
                            <h2>${response.title}!</h2>
                            <p>${response.description}!</p>
                        </div>`
        }
    }


    //Load the Library when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0], true)
        });
    })



}


async function main() {

    await getSongs("songs/newSong");
    playMusic(songs[0], true)

    //Display all the album on the page
    displayAlbums()



    //Attach an event listener to previous,play and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pauseButton.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.png"
        }
    })

    //Listen for timeupdate events
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = formatTime(currentSong.currentTime) + " / " + formatTime(currentSong.duration)
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = percent * currentSong.duration / 100;

    })

    //Add an event listener for hamburger button
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an event listner to previous song and next song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) playMusic(songs[index - 1])
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) playMusic(songs[index + 1])
    })

    //Add an event to volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Add event listner to mute the song
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "muteSong.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("muteSong.svg", "volume.svg");
            currentSong.volume = 0.5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })





}

main()
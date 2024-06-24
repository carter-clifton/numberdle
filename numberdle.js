let rNum = [null, null, null, null, null];

let currentDate = new Date().toDateString()
let random_seed = hashCode(currentDate);
if (random_seed < 0) {
    random_seed *= -1;
}

function seededRandom(seed, max = 1) {
    // Linear congruential generator (LCG)
    let a = 1103515245;
    let c = 12345;
    let m = 2147483647;

    seed = (seed % m + c) % m;

    return function() {
        seed = (seed * a + c) % m;
        return seed / m * max;
    }
}

for (let i = 0; i < 5; i++) {
    let digit = Math.floor(seededRandom(random_seed, 9)());
    if (digit === 10) {
        digit -= 1;
    }
    rNum[i] = digit;
    random_seed *= 7547;
}

let answer = rNum.join("");

let gameState = Array(6).fill(null).map(() => Array(5).fill(null));
let resultsOfGuesses = Array(6).fill(null).map(() => Array(5).fill(null));
let guessNumber = 0;
let wordLength = 0;

let finished = false;
let win = false;

let gameNumber = daysSinceJune23rd();

let valid_keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

document.getElementById("stats_button").addEventListener("click", show_stats_screen);
document.getElementById("close_stats_button").addEventListener("click", disable_stats_screen);

document.getElementById("changes_button").addEventListener("click", show_changes_screen);
document.getElementById("close_changes_button").addEventListener("click", disable_changes_screen);

function type_letter(letter) {
    if (finished) {
        return;
    }
    if (wordLength < 5) {
        gameState[guessNumber][wordLength] = letter;
        const p_tag = document.createElement("p");
        p_tag.innerHTML = letter;
        document.getElementById("square_" + (guessNumber + 1) + "_" + (wordLength + 1)).appendChild(p_tag);
        wordLength += 1;
    }
}

function enter_button() {
    if (wordLength === 5) {
        check_answer();
        check_for_win();
        guessNumber += 1;
        wordLength = 0;
        if (guessNumber === 6 && win === false) {
            finished = true;
            for (let i = 0; i < guessNumber; i++) {
                document.getElementById("line_" + (i + 1)).innerHTML = resultsOfGuesses[i].join("");
            }
            document.getElementById("result").innerHTML = "X / 6 Guesses."
            document.getElementById("share").style.display = "inline";
            game_show_stats_screen();
        }
    }
}

function delete_button() {
    if (wordLength > 0) {
        wordLength -= 1;
        gameState[guessNumber][wordLength] = null;
        document.getElementById("square_" + (guessNumber + 1) + "_" + (wordLength + 1)).innerHTML = "";
    }
}

function check_answer() {
    let answerArray = answer.split("");
    answerArray = check_for_green(answerArray);
    let answerSet = new Set(answerArray); 
    check_for_yellow(answerSet);
    incorrect_letters();
}

function check_for_green(answer_array) {
    for (let i = 0; i < 5; i++) {
        if (gameState[guessNumber][i] === answer_array[i]) {
            document.getElementById("square_" + (guessNumber + 1) + "_" + (i + 1)).classList += " correct";
            document.getElementById(gameState[guessNumber][i]).classList += " correct"
            resultsOfGuesses[guessNumber][i] = "🟩";
            answer_array[i] = null;
        }
    }
    return answer_array
}

function check_for_yellow(answer_set) {
    for (let i = 0; i < 5; i++) {
        let letter = gameState[guessNumber][i];
        if (answer_set.has(letter)) {
            document.getElementById("square_" + (guessNumber + 1) + "_" + (i + 1)).classList += " semi";
            document.getElementById(letter).classList += " semi"
            resultsOfGuesses[guessNumber][i] = "🟨";
            answer_set.delete(letter);
        }
    }
}

function incorrect_letters() {
    for (let i = 0; i < 5; i++) {
        let c_list = document.getElementById("square_" + (guessNumber + 1) + "_" + (i + 1)).classList;
        if (c_list[1] !== "correct" && c_list[1] !== "semi") {
            document.getElementById("square_" + (guessNumber + 1) + "_" + (i + 1)).classList += " wrong";
            document.getElementById(gameState[guessNumber][i]).classList += " wrong"
        }
    }
    for (let i = 0; i < 5; i++) {
        if (resultsOfGuesses[guessNumber][i] === null) {
            resultsOfGuesses[guessNumber][i] = "⬛";
        }
    }
}

function check_for_win() {
    for (let i = 0; i < 5; i++) {
        let c_list = document.getElementById("square_" + (guessNumber + 1) + "_" + (i + 1)).classList;
        if (c_list[1] !== "correct") {
            return;
        }
    }
    finished = true;
    win = true;
    for (let i = 0; i < guessNumber + 1; i++) {
        document.getElementById("line_" + (i + 1)).innerHTML = resultsOfGuesses[i].join("");
    }
    document.getElementById("result").innerHTML = (guessNumber + 1) + "/6"
    document.getElementById("share").style.display = "inline";
    game_show_stats_screen();
}

async function game_show_stats_screen() {
    await new Promise(r => setTimeout(r, 1000));
    show_stats_screen();
}

function disable_stats_screen() {
    document.getElementById("stats").style.display = "none";
}

function show_stats_screen() {
    document.getElementById("stats").style.display = "block";
}

function disable_changes_screen() {
    document.getElementById("changes").style.display = "none";
}

function show_changes_screen() {
    document.getElementById("changes").style.display = "block";
}

async function share_button() {

    var copyText = "Numberdle " + (gameNumber) + " " + (guessNumber) + "/6 Guesses.";

    for (let i = 0; i < guessNumber; i++) {
        copyText = copyText + "\n" + resultsOfGuesses[i].join("");
    }

    try {
        await copyToClipboard(copyText);
    } catch(error) {
        console.log("Something went wrong...")
    }
}

async function copyToClipboard(textToCopy) {
    // thank you Simon Dehaut,  from stack overflow
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}

document.addEventListener("keypress", function onEvent(event) {
    let typed_key = event.key;
    if (valid_keys.includes(typed_key)) {
        type_letter(typed_key);
    } else if (typed_key === "Enter") {
        enter_button();
    }
});

document.addEventListener("keydown", function onEvent(event) {
    let typed_key = event.key;
    if (typed_key === "Backspace" || typed_key === "Delete") {
        delete_button();
    }
});

function daysSinceJune23rd() {
    // Get today's date
    const today = new Date();
  
    // Create a date object for June 23rd, 2024
    const baseDate = new Date(2024, 6 - 1, 23); // Month is zero-indexed (January = 0)
  
    // Calculate the difference in milliseconds
    const timeDifference = today.getTime() - baseDate.getTime();
  
    // Convert the difference in milliseconds to days and round down to whole days
    const daysSince = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
    return daysSince;
}

function hashCode(string){
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        var code = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
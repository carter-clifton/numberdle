rNum = [null, null, null, null, null];

for (let i = 0; i < 5; i++) {
    let digit = Math.floor(Math.random() * 10);
    if (digit === 10) {
        digit -= 1;
    }
    rNum[i] = digit;
}

let answer = rNum.join("");

let gameState = Array(6).fill(null).map(() => Array(5).fill(null));
let resultsOfGuesses = Array(6).fill(null).map(() => Array(5).fill(null));
let guessNumber = 0;
let wordLength = 0;

let finished = false;
let win = false;

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
    document.getElementById("result").innerHTML = (guessNumber + 1) + "/6 Guesses."
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

    var copyText = resultsOfGuesses[0].join("") + "\n";

    for (let i = 1; i < guessNumber; i++) {
        copyText = copyText + resultsOfGuesses[i].join("") + "\n";
    }
    copyText = copyText + (guessNumber) + "/6 Guesses."

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
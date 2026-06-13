let timer;
let running = false;
let isStudy = true;

let studyTime = 25;
let breakTime = 5;

let timeLeft = studyTime * 60;

let data = JSON.parse(localStorage.getItem("data")) || {
    sessions: 0,
    minutes: 0,
    streak: 0,
    lastDay: null,
    history: []
};

// ---------------- TIMER ----------------

function update() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;

    document.getElementById("time").textContent =
        `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    document.getElementById("mode").textContent =
        isStudy ? "📚 Study" : "☕ Break";
}

function start() {
    if (running) return;
    running = true;

    timer = setInterval(() => {
        timeLeft--;
        update();

        if (timeLeft <= 0) {
            clearInterval(timer);
            running = false;
            finishSession();
        }
    }, 1000);
}

function pause() {
    running = false;
    clearInterval(timer);
}

function reset() {
    pause();
    timeLeft = (isStudy ? studyTime : breakTime) * 60;
    update();
}

// ---------------- “AI” SYSTEM (NO API) ----------------

function generateEncouragement() {

    const mood =
        data.sessions < 3 ? "beginner" :
        data.sessions < 10 ? "growing" :
        "advanced";

    const streak = data.streak;

    const messages = {
        beginner: [
            "よく頑張ったね。少しずつでいいよ。",
            "集中できてえらいよ。続けようね。",
            "その調子で進めば大丈夫だよ。"
        ],
        growing: [
            "いい感じだね。ちゃんと成長してるよ。",
            "集中力がどんどん上がってるね。",
            "この調子ならもっと伸びるよ。"
        ],
        advanced: [
            "もうかなり集中力が高いね。すごいよ。",
            "あなたの努力は本当に立派だよ。",
            "プロレベルの集中力だね。"
        ]
    };

    let base = messages[mood];

    let extra =
        streak >= 7 ? "毎日続けていて本当にえらいよ。" :
        streak >= 3 ? "習慣になってきているね。" :
        "";

    let msg = base[Math.floor(Math.random() * base.length)];

    return extra ? msg + extra : msg;
}

// ---------------- VOICE ----------------

function speak(text) {
    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = "ja-JP";
    msg.rate = 0.95;
    speechSynthesis.speak(msg);
}

// ---------------- SESSION LOGIC ----------------

function finishSession() {

    if (isStudy) {
        data.sessions++;
        data.minutes += studyTime;

        data.history.unshift({
            date: new Date().toLocaleString(),
            min: studyTime
        });

        updateStreak();

        let text = generateEncouragement();
        speak(text);
    }

    isStudy = !isStudy;
    timeLeft = (isStudy ? studyTime : breakTime) * 60;

    save();
    render();
    start();
}

// ---------------- STREAK ----------------

function updateStreak() {
    let today = new Date().toDateString();

    if (data.lastDay !== today) {

        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (data.lastDay === yesterday.toDateString()) {
            data.streak++;
        } else {
            data.streak = 1;
        }

        data.lastDay = today;
    }
}

// ---------------- SAVE ----------------

function save() {
    localStorage.setItem("data", JSON.stringify(data));
}

// ---------------- UI ----------------

function render() {

    document.getElementById("sessions").textContent = data.sessions;
    document.getElementById("minutes").textContent = data.minutes;
    document.getElementById("streak").textContent = data.streak;

    let box = document.getElementById("history");
    box.innerHTML = "";

    data.history.slice(0, 10).forEach(h => {
        let div = document.createElement("div");
        div.textContent = `${h.date} - ${h.min} min`;
        box.appendChild(div);
    });
}

// ---------------- INIT ----------------

function init() {
    studyTime = +document.getElementById("studyInput").value;
    breakTime = +document.getElementById("breakInput").value;

    timeLeft = studyTime * 60;

    update();
    render();
}

init();

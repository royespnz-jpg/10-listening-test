/* =========================================
   LISTENING EXAM — 10TH GRADE
   Colegio Nocturno de Cariari · Second Semester 2026
   ========================================= */

/* PASTE HERE the /exec URL of the Apps Script deployment of the
   10th grade Google Sheet. The answer key lives in that script, so
   this page only sends the student's answers. */
const APPS_SCRIPT_URL = "";

let examLocked = false;

/* =========================================
   AUDIO CONTROLLER
   - Max 3 plays per audio
   - Button disabled WHILE playing (no wasted plays)
   - Equalizer + pulse ring while playing
========================================= */
class AudioController {
    constructor(audioId, buttonId, counterId, maxPlays = 3) {
        this.audio = document.getElementById(audioId);
        this.button = document.getElementById(buttonId);
        this.counter = document.getElementById(counterId);
        this.card = this.button ? this.button.closest(".audio-card") : null;
        this.maxPlays = maxPlays;
        this.plays = 0;

        if (this.button) {
            this.button.addEventListener("click", () => this.play());
        }
        if (this.audio) {
            this.audio.addEventListener("ended", () => this.onEnded());
            this.audio.addEventListener("error", () => this.onError());
            const src = this.audio.querySelector("source");
            if (src) src.addEventListener("error", () => this.onError());
        }
    }

    play() {
        if (examLocked) return;
        if (this.plays >= this.maxPlays) return;
        if (!this.audio) return;

        // Only one audio at a time.
        document.querySelectorAll("audio").forEach(a => { if (a !== this.audio && !a.paused) a.pause(); });

        this.audio.currentTime = 0;
        const started = this.audio.play();
        if (started && started.catch) started.catch(() => this.onError());

        this.plays++;
        this.button.disabled = true;
        this.button.classList.add("is-playing");
        if (this.card) this.card.classList.add("playing");
        this.setLabel("Playing...");
        this.updateUI();
    }

    onEnded() {
        this.button.classList.remove("is-playing");
        if (this.card) this.card.classList.remove("playing");

        if (examLocked) {
            this.button.disabled = true;
            return;
        }
        if (this.plays >= this.maxPlays) {
            this.button.disabled = true;
            this.setLabel("No More Plays");
        } else {
            this.button.disabled = false;
            this.setLabel("Play Again");
        }
    }

    onError() {
        // Only react if an actual play attempt failed (e.g. wrong filename on GitHub)
        if (!this.button.classList.contains("is-playing")) return;
        this.plays = Math.max(0, this.plays - 1); // refund the play
        this.button.classList.remove("is-playing");
        if (this.card) this.card.classList.remove("playing");
        this.button.disabled = examLocked;
        this.setLabel("Audio not found");
        this.updateUI();
    }

    setLabel(text) {
        const label = this.button.querySelector(".btn-label");
        if (label) label.textContent = text;
    }

    updateUI() {
        if (this.counter) {
            const dots = this.counter.querySelectorAll(".play-dot");
            dots.forEach((d, idx) => d.classList.toggle("used", idx < this.plays));
            const num = this.counter.querySelector(".plays-num");
            if (num) num.textContent = this.maxPlays - this.plays;
        }
    }
}

/* =========================================
   THE EXAM — 4 parts, 12 points
   (no answers here: the Apps Script grades the exam)
========================================= */
const PARTS = [
    {
        audio: 1,
        title: "Multiple Choice I",
        kind: "choice",
        directions: "Listen carefully to the audio and choose the correct answer to each question.",
        questions: [
            { id: "mc1", text: "What is the environmental problem mentioned in the audio?",
              options: ["Deforestation", "Climate change", "Pollution"] },
            { id: "mc2", text: "Which of the following options is a factor that contributed to the problem?",
              options: ["The large amount of plastic people use", "The lack of public transportation in cities",
                        "The lack of garbage cans on the streets"] },
            { id: "mc3", text: "What is one reason the speaker considers pollution a concerning problem?",
              options: ["The difficulty of reducing pollution", "The lack of government laws to stop pollution",
                        "Its harmful effects on animals, plants, and people"] }
        ]
    },
    {
        audio: 2,
        title: "Matching",
        kind: "matching",
        directions: "Column A lists the names of countries. Column B contains the consequences that pollution " +
            "triggered in each country. Listen to the audio and match each country with the image that shows the " +
            "consequence pollution had in that country. Choose the correct number for each country. " +
            "No answers should be left blank.",
        countries: [
            { id: "india", name: "India" },
            { id: "japan", name: "Japan" },
            { id: "australia", name: "Australia" }
        ],
        images: [
            { n: "1", src: "img/matching-1.jpg", alt: "Dry, cracked soil with dying plants and trash" },
            { n: "2", src: "img/matching-2.jpg", alt: "A river with plastic bottles and garbage bags" },
            { n: "3", src: "img/matching-3.jpg", alt: "Old, dirty apartment buildings" }
        ]
    },
    {
        audio: 3,
        title: "Identification",
        kind: "identification",
        directions: "The image shows actions to reduce three specific environmental problems mentioned in the " +
            "audio. Listen to the audio and, in the box below each action, choose the environmental problem that " +
            "the action helps to reduce. Use each environmental problem only once. No answer should be left blank.",
        bank: ["Pollution", "Air pollution", "Climate change"],
        image: { src: "img/identification.jpg", alt: "People getting on a bus (1), recycling in colored bins (2) and planting a tree (3)" },
        // Each box sits where the blank is on the printed exam (percent of the picture).
        blanks: [
            { id: "id1", n: 1, action: "People taking the bus", left: 0.8, top: 82.5, width: 24.5 },
            { id: "id2", n: 2, action: "People recycling", left: 38, top: 91.4, width: 23.5 },
            { id: "id3", n: 3, action: "People planting a tree", left: 66.6, top: 81.6, width: 24 }
        ]
    },
    {
        audio: 4,
        title: "Multiple Choice II",
        kind: "choice",
        directions: "Listen carefully to the audio and choose the correct answer to each question.",
        questions: [
            { id: "mc4", text: "Why was the speaker concerned about the environment?",
              options: ["Because there are too many cars in the city",
                        "Because not enough people are environmentally friendly",
                        "Because there are no recycling programs in the city"] },
            { id: "mc5", text: "What did the speaker use to create awareness?",
              options: ["A school project", "A TV program", "Social media"] },
            { id: "mc6", text: "What is one recommendation the speaker gave to take care of the environment?",
              options: ["To save water and electricity", "To buy local food", "To use less paper at school"] }
        ]
    }
];

/* Every answer the student gives, in order: 12 in total. */
const ITEMS = PARTS.flatMap(p =>
    p.kind === "choice" ? p.questions.map(q => q.id)
    : p.kind === "matching" ? p.countries.map(c => c.id)
    : p.blanks.map(b => b.id));
const TOTAL_QUESTIONS = ITEMS.length;

/* =========================================
   BUILD EXAM
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    buildExam();

    for (let i = 1; i <= PARTS.length; i++) {
        new AudioController(`audio${i}`, `playBtn${i}`, `counter${i}`);
    }

    const date = document.getElementById("examDate");
    if (date) date.textContent = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    document.getElementById("quizForm").addEventListener("submit", checkAnswers);

    enableSelectionStyling();
    enableTilt();
    enableReveal();
    updateProgress();
});

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function buildExam() {
    document.getElementById("questions-container").innerHTML = PARTS.map(partHtml).join("");
}

function partHtml(part, i) {
    const audio = `
<section class="card audio-card reveal" data-tilt>
    <div class="audio-head">
        <span class="audio-num">Part ${i + 1} &middot; ${esc(part.title)}</span>
        <span class="audio-line"></span>
        <span class="part-points">3 points</span>
    </div>
    <p class="directions">${esc(part.directions)}</p>
    <audio id="audio${part.audio}" preload="auto">
        <source src="audio${part.audio}.mp3" type="audio/mpeg">
    </audio>
    <div class="audio-controls">
        <button type="button" class="play-btn" id="playBtn${part.audio}">
            <span class="btn-ring" aria-hidden="true"></span>
            <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
            <span class="btn-label">Play Audio ${part.audio}</span>
        </button>
        <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <span class="counter" id="counter${part.audio}">
            <span class="play-dot"></span><span class="play-dot"></span><span class="play-dot"></span>
            <span class="plays-text">Plays left: <b class="plays-num">3</b></span>
        </span>
    </div>
</section>`;
    if (part.kind === "choice") return audio + part.questions.map(choiceHtml).join("");
    if (part.kind === "matching") return audio + matchingHtml(part);
    return audio + identificationHtml(part);
}

function choiceHtml(q, k) {
    const letters = ["a", "b", "c", "d"];
    const opts = q.options.map((text, j) => `
        <label class="option">
            <input type="radio" name="${q.id}" value="${letters[j].toUpperCase()}">
            <span class="opt-key">${letters[j].toUpperCase()}</span>
            <span class="opt-text">${esc(text)}</span>
        </label>`).join("");
    return `
<article class="card question reveal" data-q="${q.id}" data-tilt>
    <div class="q-head">
        <span class="q-num">${k + 1}</span>
        <h2 class="q-text">${esc(q.text)}</h2>
    </div>
    <div class="options">${opts}
    </div>
</article>`;
}

// A drop-down; the choices already used in the same group are greyed out.
function selectHtml(id, group, choices, label, placeholder) {
    return `<select class="pick" name="${id}" data-group="${group}" aria-label="${esc(label)}">
        <option value="">${esc(placeholder)}</option>
        ${choices.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}
    </select>`;
}

function matchingHtml(part) {
    const numbers = part.images.map(img => img.n);
    const rows = part.countries.map(c => `
        <div class="match-row" data-q="${c.id}">
            <span class="country">${esc(c.name)}</span>
            <span class="paren">(</span>
            ${selectHtml(c.id, "matching", numbers, `Number for ${c.name}`, "—")}
            <span class="paren">)</span>
        </div>`).join("");
    const pics = part.images.map(img => `
        <figure class="match-pic">
            <span class="pic-num">${img.n}</span>
            <img src="${img.src}" alt="${esc(img.alt)}" loading="lazy">
        </figure>`).join("");
    return `
<article class="card matching reveal">
    <div class="match-grid">
        <div class="col">
            <h3 class="col-title">Column A</h3>
            ${rows}
        </div>
        <div class="col">
            <h3 class="col-title">Column B</h3>
            <div class="pics">${pics}</div>
        </div>
    </div>
</article>`;
}

function identificationHtml(part) {
    const blanks = part.blanks.map(b => `
            <label class="blank" data-q="${b.id}" style="--left:${b.left}%;--top:${b.top}%;--width:${b.width}%">
                <span class="blank-num">${b.n}</span>
                ${selectHtml(b.id, "identification", part.bank, `Action ${b.n}: ${b.action}`, "Choose…")}
            </label>`).join("");
    return `
<article class="card identification reveal">
    <div class="bank" aria-label="Environmental problems">
        ${part.bank.map(w => `<span class="bank-word">${esc(w)}</span>`).join("")}
    </div>
    <div class="id-figure">
        <img src="${part.image.src}" alt="${esc(part.image.alt)}" loading="lazy">
        <div class="blanks">${blanks}
        </div>
    </div>
</article>`;
}

/* =========================================
   SELECTED OPTION STYLING + PROGRESS
========================================= */
function enableSelectionStyling() {
    document.addEventListener("change", e => {
        if (e.target.matches('input[type="radio"]')) {
            document.querySelectorAll(`input[name="${e.target.name}"]`).forEach(inp => {
                inp.closest(".option").classList.toggle("selected", inp.checked);
            });
        }
        if (e.target.matches("select.pick")) {
            e.target.classList.toggle("filled", !!e.target.value);
            refreshGroup(e.target.dataset.group);
        }
        updateProgress();
    });
}

// Each number / problem can be used only once per part, like on paper.
function refreshGroup(group) {
    const selects = [...document.querySelectorAll(`select.pick[data-group="${group}"]`)];
    selects.forEach(sel => {
        const usedElsewhere = selects.filter(o => o !== sel).map(o => o.value).filter(Boolean);
        [...sel.options].forEach(opt => {
            if (opt.value) opt.disabled = usedElsewhere.includes(opt.value);
        });
    });
}

function answerOf(id) {
    const radio = document.querySelector(`input[name="${id}"]:checked`);
    if (radio) return radio.value;
    const select = document.querySelector(`select[name="${id}"]`);
    return select ? select.value : "";
}

function updateProgress() {
    const answered = ITEMS.filter(id => answerOf(id)).length;
    const fill = document.getElementById("progFill");
    const txt = document.getElementById("progText");
    if (fill) fill.style.width = ((answered / TOTAL_QUESTIONS) * 100) + "%";
    if (txt) txt.textContent = `Answered ${answered}/${TOTAL_QUESTIONS}`;
    const note = document.getElementById("unanswered");
    if (note && !note.hidden && answered === TOTAL_QUESTIONS) note.hidden = true;
}

/* =========================================
   3D TILT (desktop only)
========================================= */
function enableTilt() {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll("[data-tilt]").forEach(card => {
        card.addEventListener("mousemove", e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform =
                `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

/* =========================================
   SCROLL REVEAL
========================================= */
function enableReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        els.forEach(el => el.classList.add("visible"));
        return;
    }
    const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add("visible");
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
}

/* =========================================
   SUBMIT
========================================= */
let pending = null; // what was sent, kept to try again if it fails

function checkAnswers(event) {
    event.preventDefault();
    if (pending) return sendToSheet(pending); // "Try again" after a failed send
    if (examLocked) return;

    const nameInput = document.getElementById("studentName");
    const groupInput = document.getElementById("studentGroup");
    const nameError = document.getElementById("nameError");
    const studentName = nameInput.value.trim();

    if (!studentName) {
        nameInput.classList.remove("input-error");
        void nameInput.offsetWidth; // restart shake animation
        nameInput.classList.add("input-error");
        nameError.hidden = false;
        nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInput.focus({ preventScroll: true });
        return;
    }
    nameInput.classList.remove("input-error");
    nameError.hidden = true;

    // Blank answers: warn once, then the next click submits anyway.
    const missing = ITEMS.filter(id => !answerOf(id));
    const note = document.getElementById("unanswered");
    if (missing.length && note.hidden) {
        note.hidden = false;
        note.textContent = `You have ${missing.length} unanswered question${missing.length > 1 ? "s" : ""}. ` +
            "Answer them, or press Submit Exam again to send it as it is.";
        const first = document.querySelector(`[data-q="${missing[0]}"]`) ||
            document.querySelector(`[name="${missing[0]}"]`)?.closest(".card");
        if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    const respuestas = {};
    ITEMS.forEach(id => { respuestas[id] = answerOf(id); });

    pending = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        exam: "10th",
        nombre: studentName,
        grupo: groupInput ? groupInput.value.trim() : "",
        respuestas
    };
    bloquearExamen();
    sendToSheet(pending);
}

/* =========================================
   LOCK EXAM
========================================= */
function bloquearExamen() {
    examLocked = true;

    document.getElementById("quizForm").classList.add("locked");
    document.querySelectorAll("input, select").forEach(el => el.disabled = true);
    document.querySelectorAll("audio").forEach(a => a.pause());
    document.querySelectorAll(".play-btn").forEach(btn => {
        btn.disabled = true;
        btn.classList.remove("is-playing");
    });
    document.querySelectorAll(".audio-card").forEach(c => c.classList.remove("playing"));
    document.getElementById("unanswered").hidden = true;
}

/* =========================================
   SAVE TO GOOGLE SHEETS
========================================= */
function sendToSheet(datos) {
    const statusEl = document.getElementById("saveStatus");
    const btn = document.querySelector(".submit-btn");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Submitting...";
    statusEl.className = "save-status saving";
    statusEl.textContent = "Submitting exam...";

    if (!APPS_SCRIPT_URL) {
        return failed(new Error("this exam is not connected to the teacher's Google Sheet yet"));
    }

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos)
    })
    .then(r => r.text())
    .then(raw => {
        let result;
        try { result = JSON.parse(raw); }
        catch (e) { throw new Error("the Google Sheet did not answer correctly"); }
        if (!result.success) throw new Error(result.error || "Unknown error");

        pending = null;
        btn.querySelector("span").textContent = "Exam Submitted";
        statusEl.className = "save-status saved";
        statusEl.innerHTML = `✓ Exam submitted successfully.<br>Thank you, <strong>${esc(datos.nombre)}</strong>.`;
        statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    })
    .catch(failed);

    function failed(err) {
        console.error("SEND ERROR:", err);
        btn.disabled = false;
        btn.querySelector("span").textContent = "Try Again";
        statusEl.className = "save-status error";
        statusEl.textContent = `Could not submit (${err.message}). Your answers are kept: press Try Again or tell your teacher.`;
    }
}

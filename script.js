const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const examForm = document.getElementById("examForm");
const setupScreen = document.getElementById("setupScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const dashboardNav = document.getElementById("dashboardNav");

const displayExamName = document.getElementById("displayExamName");
const heroDate = document.getElementById("heroDate");
const heroDateTime = document.getElementById("heroDateTime");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const moodBadge = document.getElementById("moodBadge");
const moodMessage = document.getElementById("moodMessage");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const studyPlan = document.getElementById("studyPlan");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressSub = document.getElementById("progressSub");
const planTitle = document.getElementById("planTitle");
const planSubtitle = document.getElementById("planSubtitle");
const completionModal = document.getElementById("completionModal");
const closeCompletion = document.getElementById("closeCompletion");

let examDateTime = null;
let countdownTimer = null;
let studentName = "";
let completionAnnounced = false;

const quotes = [
  ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
  ["The secret of getting ahead is getting started.", "Mark Twain"],
  ["It always seems impossible until it is done.", "Nelson Mandela"],
  ["Great things are done by a series of small things brought together.", "Vincent van Gogh"],
  ["The future depends on what you do today.", "Mahatma Gandhi"],
  ["You do not have to be perfect. You just have to keep going.", "Exam Companion"]
];

const fallbackPlan = [
  ["DAY 7", "Understand the syllabus", "Map the units, mark the difficult topics, and make a realistic revision order."],
  ["DAY 6", "Build your first strong topic", "Study one major unit and finish with a short active-recall test."],
  ["DAY 5", "Build your second strong topic", "Learn the next important unit and write down key definitions and formulas."],
  ["DAY 4", "Strengthen the middle", "Cover another unit and revisit anything you could not recall yesterday."],
  ["DAY 3", "Practice important questions", "Use previous questions or a self-test to find your weak areas."],
  ["DAY 2", "Revise difficult topics", "Return only to weak topics and test yourself without notes."],
  ["DAY 1", "Final formula + mind map review", "Keep it light. Review summaries, key concepts, and exam strategy."],
  ["EXAM DAY", "Official examination", "Arrive early, breathe, read carefully, and work through the paper calmly."]
];

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const password = document.getElementById("studentPassword").value;

  if (!name || !email || !password) return;

  studentName = name;
  loginScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

examForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("examName").value.trim();
  const date = document.getElementById("examDate").value;
  const time = document.getElementById("examTime").value;

  if (!name || !date || !time) return;

  const target = new Date(`${date}T${time}`);
  if (Number.isNaN(target.getTime()) || target <= new Date()) {
    alert("Please choose a future exam date and time.");
    return;
  }

  examDateTime = target;
  displayExamName.textContent = name;
  heroDate.textContent = target.toLocaleDateString(undefined, {day:"2-digit", month:"short", year:"numeric"}).toUpperCase();
  heroDateTime.textContent = target.toLocaleString(undefined, {
    weekday:"short", day:"numeric", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });

  setupScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  dashboardNav.classList.remove("hidden");

  createPlan();
  updateCountdown();
  loadQuote();

  clearInterval(countdownTimer);
  countdownTimer = setInterval(updateCountdown, 1000);
  window.scrollTo({top:0, behavior:"smooth"});
});

document.getElementById("changeExam").addEventListener("click", () => {
  clearInterval(countdownTimer);
  dashboardScreen.classList.add("hidden");
  dashboardNav.classList.add("hidden");
  setupScreen.classList.remove("hidden");
  examForm.reset();
  studyPlan.innerHTML = "";
  window.scrollTo({top:0, behavior:"smooth"});
});

document.getElementById("brandReset").addEventListener("click", (event) => {
  event.preventDefault();
  clearInterval(countdownTimer);
  dashboardScreen.classList.add("hidden");
  dashboardNav.classList.add("hidden");
  setupScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginForm.reset();
  examForm.reset();
  studyPlan.innerHTML = "";
  window.scrollTo({top:0, behavior:"smooth"});
});

function updateCountdown() {
  if (!examDateTime) return;
  const diff = examDateTime - new Date();

  if (diff <= 0) {
    setTime(0,0,0,0);
    setMood("completed");
    clearInterval(countdownTimer);
    return;
  }

  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  setTime(days,hours,minutes,seconds);
  updateMood(days);
  updateToday(days);
}

function setTime(d,h,m,s) {
  daysEl.textContent = String(d).padStart(2,"0");
  hoursEl.textContent = String(h).padStart(2,"0");
  minutesEl.textContent = String(m).padStart(2,"0");
  secondsEl.textContent = String(s).padStart(2,"0");
}

function updateMood(days) {
  if (days > 7) setMood("calm");
  else if (days >= 3) setMood("focus");
  else setMood("urgent");
}

function setMood(type) {
  moodBadge.classList.remove("calm","focus","urgent","completed");
  const data = {
    calm: ["🌱 CALM MODE", "You have time. Build your plan deliberately."],
    focus: ["🎯 FOCUS MODE", "Time to get serious. Protect your study blocks."],
    urgent: ["🔥 FINAL STRETCH", "Prioritize your most important topics now."],
    completed: ["🎓 EXAM DAY", "You've made it. Stay calm and do your best."]
  };
  moodBadge.classList.add(type);
  moodBadge.textContent = data[type][0];
  moodMessage.textContent = data[type][1];
}

async function loadQuote() {
  quoteText.textContent = "“Finding a little motivation…”";
  quoteAuthor.textContent = "— Exam Companion";

  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    if (!response.ok) throw new Error("Quote API unavailable");
    const data = await response.json();
    quoteText.textContent = `“${data.quote}”`;
    quoteAuthor.textContent = `— ${data.author}`;
  } catch (error) {
    const item = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = `“${item[0]}”`;
    quoteAuthor.textContent = `— ${item[1]}`;
  }
}

function createPlan() {
  studyPlan.innerHTML = "";
  completionAnnounced = false;

  const diff = examDateTime - new Date();
  const daysAvailable = Math.max(1, Math.ceil(diff / 86400000));

  planTitle.textContent = daysAvailable === 1
    ? "Your Final-Day Plan"
    : `Your ${daysAvailable}-Day Plan`;
  planSubtitle.textContent = daysAvailable > 7
    ? `You have ${daysAvailable} days before the exam, so your plan gives every day a purpose.`
    : `You have ${daysAvailable} day${daysAvailable === 1 ? "" : "s"} left, so the plan focuses only on the time you actually have.`;

  for (let day = daysAvailable; day >= 1; day--) {
    const plan = getTaskForDay(day, daysAvailable);
    addPlanItem(`DAY ${day}`, plan.title, plan.description, day);
  }

  addPlanItem("EXAM DAY", "Official examination", "Arrive early, breathe, read carefully, and work through the paper calmly.", 0);

  updateProgress();
  updateToday(daysAvailable);
}

function getTaskForDay(day, totalDays) {
  if (day === 1) {
    return {
      title: "Final revision",
      description: "Keep it light. Review summaries, formulas, key concepts, and the topics you still hesitate on."
    };
  }

  if (day === 2) {
    return {
      title: "Revise your weak topics",
      description: "Return to the areas you found difficult and test yourself without looking at your notes."
    };
  }

  if (day === 3) {
    return {
      title: "Practice important questions",
      description: "Use previous questions or a self-test to identify gaps and improve your answer speed."
    };
  }

  if (day === 4) {
    return {
      title: "Strengthen the core concepts",
      description: "Review the concepts that connect multiple units and make short recall notes."
    };
  }

  if (day === 5) {
    return {
      title: "Build your next strong topic",
      description: "Study one important unit and finish with a short active-recall test."
    };
  }

  if (day === 6) {
    return {
      title: "Build another strong topic",
      description: "Cover another major topic and write down the definitions, formulas, or examples you need to remember."
    };
  }

  if (day === 7) {
    return {
      title: "Map the syllabus",
      description: "Divide the syllabus into manageable pieces and decide what needs the most attention."
    };
  }

  const studyDayNumber = totalDays - day + 1;
  const cycle = [
    ["Learn a new core topic", "Study one major concept from the syllabus and finish with a short recall check."],
    ["Deepen your understanding", "Work through examples, diagrams, problems, or practical applications for today's topic."],
    ["Make compact revision notes", "Turn today's material into a one-page summary you can revisit later."],
    ["Active recall session", "Close your notes and write down everything you remember before checking your answers."],
    ["Practice and correct", "Solve questions from today's topic and mark the mistakes you need to revisit."],
    ["Connect the concepts", "Link today's topic with earlier material so the syllabus starts to feel like one system."]
  ];

  const [title, description] = cycle[(studyDayNumber - 1) % cycle.length];
  return { title, description };
}

function addPlanItem(dayLabel, titleText, descriptionText, dayNumber) {
  const row = document.createElement("article");
  row.className = "plan-item";
  row.dataset.dayIndex = String(dayNumber);

  const day = document.createElement("div");
  day.className = "plan-day";
  const node = document.createElement("span");
  node.className = "node";
  const dayText = document.createElement("span");
  dayText.textContent = dayLabel;
  day.append(node, dayText);

  const task = document.createElement("div");
  task.className = "plan-task";
  const title = document.createElement("strong");
  title.textContent = titleText;
  const desc = document.createElement("p");
  desc.textContent = descriptionText;
  task.append(title, desc);

  const status = document.createElement("div");
  status.className = "plan-status";
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("aria-label", `Complete ${dayLabel}`);
  label.append(checkbox, document.createTextNode(" Done"));
  status.appendChild(label);

  row.append(day, task, status);
  studyPlan.appendChild(row);

  checkbox.addEventListener("change", () => {
    row.classList.toggle("done", checkbox.checked);
    updateProgress();
  });
}

function updateToday(daysLeft) {
  document.querySelectorAll(".plan-item").forEach(row => row.classList.remove("today"));
  if (daysLeft <= 0) return;

  const target = [...document.querySelectorAll(".plan-item")]
    .find(row => Number(row.dataset.dayIndex) === daysLeft);

  if (target) target.classList.add("today");
}

function updateProgress() {
  const boxes = [...document.querySelectorAll(".plan-item input[type='checkbox']")];
  const done = boxes.filter(box => box.checked).length;
  const percent = boxes.length ? Math.round((done / boxes.length) * 100) : 0;

  progressText.textContent = `${percent}%`;
  progressSub.textContent = `${done} of ${boxes.length} milestones complete`;
  progressFill.style.width = `${percent}%`;

  if (boxes.length && done === boxes.length) {
    if (!completionAnnounced) {
      completionAnnounced = true;
      openCompletionModal();
    }
  } else {
    completionAnnounced = false;
  }
}

function openCompletionModal() {
  completionModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  setTimeout(() => closeCompletion.focus(), 50);
}

function closeCompletionModal() {
  completionModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.getElementById("plan").scrollIntoView({ behavior: "smooth", block: "start" });
}

closeCompletion.addEventListener("click", closeCompletionModal);
completionModal.querySelector("[data-close-modal]").addEventListener("click", closeCompletionModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !completionModal.classList.contains("hidden")) {
    closeCompletionModal();
  }
});

// Make navbar links land cleanly below the header instead of relying only on the browser's anchor offset.
dashboardNav.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const headerOffset = document.querySelector(".topbar").offsetHeight + 22;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

const today = new Date();
const dateInput = document.getElementById("examDate");
const minDate = new Date(today.getTime() + 60 * 60 * 1000);
dateInput.min = minDate.toISOString().slice(0,10);


/* Back to top */
const backToTop = document.getElementById("backToTop");

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

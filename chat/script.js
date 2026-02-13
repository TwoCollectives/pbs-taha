// Quiz data
const quizQuestions = [
  {
    intro: "Great! Let's get started.",
    question: "How do you usually spend time on your phone?",
    options: [
      "Scrolling Facebook or watching videos",
      "Keeping in touch with family and friends",
      "Shopping or browsing online",
      "A little bit of everything",
    ],
  },
  {
    intro: "That is a popular one!",
    question: "If your phone could do one more thing for you, what would it be?",
    options: [
      "Help bring in a little extra money",
      "Give me more free time",
      "Make life a little less stressful",
      "I'm just curious what this is about",
    ],
  },
  {
    intro: "Perfect.",
    question: "What's your main goal right now?",
    options: [
      "Making extra income on the side",
      "Finding a simpler way to earn",
      "Building something long-term",
      "Just exploring my options",
    ],
  },
  {
    question: "How much time could you realistically spend on your phone daily?",
    options: [
      "10-30 minutes",
      "30-60 minutes",
      "1-2 hours",
      "As much as it takes",
    ],
  },
  {
    intro: "That works very well for this opportunity.",
    question: "What sounds most appealing to you?",
    options: [
      "Earning while I scroll",
      "Automated income streams",
      "Something simple and proven",
      "All of the above",
    ],
  },
];

// Utilities
function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipod/i.test(ua)) return "iPhone";
  if (/android.*mobile/i.test(ua)) return "Android phone";
  if (/ipad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iPad";
  if (/android(?!.*mobile)/i.test(ua) || /tablet|kindle|silk/i.test(ua)) return "Android tablet";
  if (/windows|macintosh|linux/i.test(ua) && !/mobile/i.test(ua)) return "computer";
  return "mobile phone";
}

function calculateDeadline() {
  const now = new Date();
  let targetHour = now.getHours() + 2;
  if (targetHour >= 24) {
    now.setDate(now.getDate() + 1);
    targetHour = targetHour % 24;
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[now.getDay()];
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  const dateStr = `${month}/${day}/${year}`;
  let timeStr;
  if (targetHour === 0) timeStr = "12am";
  else if (targetHour === 12) timeStr = "12pm";
  else if (targetHour > 12) timeStr = `${targetHour - 12}pm`;
  else timeStr = `${targetHour}am`;
  return { dayName, dateStr, timeStr };
}

async function detectLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data?.country_name && data.country_name !== "Unknown") return data.country_name;
  } catch {
    // fallback
  }
  return "the United States";
}

// Render functions
function renderTyping() {
  return `<div class="message-wrapper bot">
    <div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  </div>`;
}

function renderBotMessage(text) {
  return `<div class="message-wrapper bot">
    <div class="message bot">${text}</div>
  </div>`;
}

function renderUserMessage(text) {
  return `<div class="message-wrapper user">
    <div class="message user">${text}</div>
  </div>`;
}

function renderOptions(options, callback) {
  const html = `<div class="message-wrapper bot">
    <div class="options-wrapper">
      ${options.map((opt) => `<button class="option-btn" data-option="${opt}">${opt}</button>`).join("")}
    </div>
  </div>`;
  
  setTimeout(() => {
    const container = document.getElementById("messages");
    container.innerHTML += html;
    container.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        callback(e.target.getAttribute("data-option"));
      });
    });
    scrollToBottom();
  }, 0);
}

function renderCTA() {
  return `<div class="cta-wrapper">
    <a href="https://go.dailygrowthpath.com/click" class="cta-btn">Click Here</a>
  </div>`;
}

function scrollToBottom() {
  setTimeout(() => {
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? 200 : 100;
    const scrollPos = document.documentElement.scrollHeight - window.innerHeight - offset;
    window.scrollTo({ top: Math.max(scrollPos, 0), behavior: "smooth" });
  }, 100);
}

// State
let currentQuestion = 0;
let userDevice = "mobile phone";
let userCountry = "the United States";
let hasStarted = false;
let messagesContainer = null;

function addMessage(html) {
  messagesContainer.innerHTML += html;
  scrollToBottom();
}

function clearOptions() {
  document.querySelectorAll(".options-wrapper").forEach(wrapper => wrapper.closest(".message-wrapper").remove());
}

function askQuestion(index) {
  const q = quizQuestions[index];
  
  if (q.intro) {
    addMessage(renderBotMessage(q.intro));
    setTimeout(() => {
      addMessage(renderTyping());
      setTimeout(() => {
        document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
        addMessage(renderBotMessage(q.question));
        setTimeout(() => {
          renderOptions(q.options, handleOptionSelect);
        }, 1000);
      }, 2000);
    }, 1000);
  } else {
    addMessage(renderBotMessage(q.question));
    setTimeout(() => {
      renderOptions(q.options, handleOptionSelect);
    }, 1000);
  }
}

function handleOptionSelect(answer) {
  clearOptions();
  
  if (answer === "Yes" && currentQuestion === 0 && !hasStarted) {
    hasStarted = true;
    addMessage(renderUserMessage("Yes"));
    setTimeout(() => {
      addMessage(renderTyping());
      setTimeout(() => {
        document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
        askQuestion(0);
      }, 1500);
    }, 800);
    return;
  }

  addMessage(renderUserMessage(answer));
  setTimeout(() => {
    addMessage(renderTyping());
    setTimeout(() => {
      document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
      currentQuestion++;
      if (currentQuestion < quizQuestions.length) {
        askQuestion(currentQuestion);
      } else {
        showFinalMessage();
      }
    }, 1500);
  }, 800);
}

function showFinalMessage() {
  addMessage(renderBotMessage("Congratulations!"));
  setTimeout(() => {
    addMessage(renderTyping());
    setTimeout(() => {
      document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
      addMessage(renderBotMessage(`You qualify for The Pegasus System program to make $1,000+ a week on your ${userDevice} from ${userCountry}.`));
      setTimeout(() => {
        addMessage(renderTyping());
        setTimeout(() => {
          document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
          addMessage(renderBotMessage("Please click the button below to watch the 15 minute onboarding video."));
          setTimeout(() => {
            addMessage(renderCTA());
          }, 1000);
        }, 2000);
      }, 1000);
    }, 2000);
  }, 1000);
}

// Initialize
async function init() {
  messagesContainer = document.getElementById("messages");
  
  // Set deadline
  const deadline = calculateDeadline();
  document.querySelector(".deadline-day").textContent = deadline.dayName;
  document.querySelector(".deadline-date").textContent = deadline.dateStr;
  document.querySelector(".deadline-time").textContent = deadline.timeStr;
  
  // Detect device
  userDevice = detectDevice();
  
  // Detect location
  userCountry = await detectLocation();
  
  // Start quiz
  addMessage(renderBotMessage("Hi 👋"));
  setTimeout(() => {
    addMessage(renderTyping());
    setTimeout(() => {
      document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
      addMessage(renderBotMessage("I'm Emily from The Pegasus System"));
      setTimeout(() => {
        addMessage(renderTyping());
        setTimeout(() => {
          document.querySelectorAll(".typing-indicator").forEach(el => el.parentElement.remove());
          addMessage(renderBotMessage(`I see you're from ${userCountry} and interested in earning $1,000+ per week using just your ${userDevice}.<br><br>I'd love to see if you're a good fit for our program! Do you have 2-3 minutes to answer a few quick questions?`));
          setTimeout(() => {
            renderOptions(["Yes"], handleOptionSelect);
          }, 1000);
        }, 1500);
      }, 1500);
    }, 1500);
  }, 500);
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", init);

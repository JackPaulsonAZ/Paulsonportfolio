async function loadResume() {
  const res = await fetch("content/resume.json");
  const resume = await res.json();
  renderResume(resume);
}

function renderResume(resume) {
  document.getElementById("hero-name").textContent = resume.name;
  document.getElementById("hero-title").textContent = resume.title;
  document.getElementById("hero-location").textContent = resume.location;
  document.getElementById("summary-text").textContent = resume.summary;

  const heroEmail = document.getElementById("hero-email");
  heroEmail.textContent = resume.email;
  heroEmail.href = `mailto:${resume.email}`;
  document.getElementById("hero-linkedin").href = resume.linkedin;

  const contactEmail = document.getElementById("contact-email");
  contactEmail.textContent = resume.email;
  contactEmail.href = `mailto:${resume.email}`;
  document.getElementById("contact-linkedin").href = resume.linkedin;

  const expContainer = document.getElementById("experience-list");
  resume.experience.forEach((job) => {
    const card = document.createElement("article");
    card.className = "job-card";
    card.innerHTML = `
      <div class="job-header">
        <h3>${job.company} — ${job.title}</h3>
        <span class="job-dates">${job.dates}</span>
      </div>
      <p class="job-location">${job.location}</p>
      <ul>${job.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
    `;
    expContainer.appendChild(card);
  });

  const skillsContainer = document.getElementById("skills-grid");
  Object.entries(resume.tools).forEach(([category, items]) => {
    const group = document.createElement("div");
    group.className = "skill-group";
    group.innerHTML = `<h4>${category}</h4><p>${items.join(", ")}</p>`;
    skillsContainer.appendChild(group);
  });

  const eduContainer = document.getElementById("education-list");
  resume.education.forEach((edu) => {
    const item = document.createElement("div");
    item.className = "education-item";
    item.innerHTML = `<h4>${edu.school}</h4><p>${edu.location} · ${edu.dates}</p>`;
    eduContainer.appendChild(item);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
}

loadResume();

// --- Chat widget ---
const chatToggle = document.getElementById("chat-toggle");
const chatClose = document.getElementById("chat-close");
const chatPanel = document.getElementById("chat-panel");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

let history = [];
const initialMessagesHTML = chatMessages.innerHTML;

function resetChat() {
  history = [];
  chatMessages.innerHTML = initialMessagesHTML;
}

function togglePanel(open) {
  chatPanel.classList.toggle("open", open);
  if (open) {
    chatInput.focus();
  } else {
    resetChat();
  }
}

chatToggle.addEventListener("click", () => {
  togglePanel(!chatPanel.classList.contains("open"));
});

chatClose.addEventListener("click", () => togglePanel(false));

function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `chat-message ${role}`;
  el.textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}

async function sendMessage(text) {
  appendMessage("user", text);
  history.push({ role: "user", content: text });

  const typingEl = appendMessage("assistant", "Thinking…");
  typingEl.classList.add("typing");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    typingEl.remove();

    if (!res.ok) {
      appendMessage("assistant", data.error || "Something went wrong. Please try again.");
      return;
    }

    appendMessage("assistant", data.reply);
    history.push({ role: "assistant", content: data.reply });
  } catch (err) {
    typingEl.remove();
    appendMessage("assistant", "Network error — please try again.");
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  sendMessage(text);
});

chatMessages.addEventListener("click", (e) => {
  const chip = e.target.closest(".suggestion-chip");
  if (chip) sendMessage(chip.textContent);
});

import "./styles.css";
import { createChat } from "./chat.js";
import { createStaticMode } from "./staticMode.js";
import { createAiMode } from "./aiMode.js";
import { createPracticeMode } from "./practiceMode.js";
import { content, siteConfig } from "./content.js";
import { uiStrings, resolveInitialLanguage, setStoredLanguage } from "./i18n.js";
import { iconAiEnter, iconAiExit, iconPracticeExit, iconTheme, iconSend, iconLogo } from "./icons.js";

const THEME_KEY = "signal-sifter-theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") {
    document.documentElement.dataset.theme = saved;
  }
}

function toggleTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = document.documentElement.dataset.theme || (prefersDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function renderShell(profile, strings, lang, aiModeAvailable, showAiHint, practice) {
  const app = document.querySelector("#app");
  const modeButton = practice
    ? `<button type="button" class="icon-btn" data-practice-exit title="${strings.practiceExitTitle}">${iconPracticeExit}</button>`
    : aiModeAvailable
      ? `<button type="button" class="icon-btn${showAiHint ? " icon-btn--pulse" : ""}" data-mode-toggle title="${strings.aiModeEnterTitle}">${iconAiEnter}</button>`
      : "";
  app.innerHTML = `
    <div class="chat">
      <header class="chat__header">
        <div class="chat__avatar" data-chat-avatar>
          ${profile.avatar ? `<img src="${profile.avatar}" alt="${profile.name}" />` : initials(profile.name)}
        </div>
        <div class="chat__identity">
          <div class="chat__name" data-chat-name>
            <span class="chat__logo" title="Powered by Signal Sifter">${iconLogo}</span>
            <span class="chat__name-text">${profile.name}</span>
            ${practice ? `<span class="chat__practice-badge">${strings.practiceBadge}</span>` : ""}
          </div>
          <div class="chat__status">
            <span class="chat__status-dot"></span>
            <span data-chat-status>${practice ? strings.practiceStatusText : profile.statusText}</span>
          </div>
        </div>
        <div class="chat__header-actions">
          ${modeButton}
          <button type="button" class="icon-btn" data-lang-toggle title="${strings.langToggleTitle}">${lang.toUpperCase()}</button>
          <button type="button" class="icon-btn" data-theme-toggle title="${strings.themeToggleTitle}">${iconTheme}</button>
        </div>
      </header>

      <div class="chat__messages" data-chat-messages></div>

      <div class="chat__quick-replies" data-chat-quick-replies hidden></div>

      <div class="chat__inputbar">
        <input
          type="text"
          class="chat__input"
          data-chat-input
          placeholder="${strings.inputPlaceholder}"
          disabled
        />
        <button type="button" class="chat__send" data-chat-send disabled>${iconSend}</button>
      </div>
    </div>
  `;
  return app;
}

function nextLanguage(current) {
  const langs = siteConfig.supportedLanguages;
  const idx = langs.indexOf(current);
  return langs[(idx + 1) % langs.length];
}

async function boot(lang, { skipPractice = false } = {}) {
  const { resume, buckets, story } = content[lang];
  const strings = uiStrings[lang] ?? uiStrings.en;
  const aiModeAvailable = Boolean(siteConfig.aiMode.enabled && siteConfig.aiMode.endpoint);

  // Hidden candidate-only entrance: the published site never links to it.
  // Ignored entirely when AI mode is off, so the static site stays untouched.
  const params = new URLSearchParams(location.search);
  const practiceActive = !skipPractice && aiModeAvailable && params.get("practice") === "1";
  const persona = params.get("persona") === "manager" ? "manager" : "hr";
  // AI mode is the product's core value — the discovery hint shows on every
  // load. Most visitors only ever come once; a show-once localStorage gate
  // (the old behavior) optimized the wrong case and hid the feature.
  const showAiHint = !practiceActive && aiModeAvailable;

  const app = renderShell(resume.profile, strings, lang, aiModeAvailable, showAiHint, practiceActive);

  document.querySelector("[data-theme-toggle]").addEventListener("click", toggleTheme);
  document.querySelector("[data-lang-toggle]").addEventListener("click", () => {
    const next = nextLanguage(lang);
    setStoredLanguage(next);
    boot(next);
  });

  const chat = createChat(app, strings);

  if (practiceActive) {
    await setupPracticeMode({ app, chat, resume, buckets, story, lang, strings, persona });
    return;
  }

  const staticMode = createStaticMode({ chat, resume, buckets, strings });

  if (aiModeAvailable) {
    setupAiMode({ app, chat, staticMode, resume, story, lang, strings });
  }

  await chat.addBotMessage(resume.profile.summary);
  await staticMode.start();

  if (showAiHint) {
    await chat.addBotMessage(strings.aiModeHint);
  }
}

async function setupPracticeMode({ app, chat, resume, buckets, story, lang, strings, persona }) {
  const input = app.querySelector("[data-chat-input]");
  const sendBtn = app.querySelector("[data-chat-send]");
  const exitBtn = app.querySelector("[data-practice-exit]");

  exitBtn.addEventListener("click", () => {
    location.href = location.pathname;
  });

  const practice = createPracticeMode({
    chat,
    endpoint: siteConfig.aiMode.endpoint,
    lang,
    resume,
    story,
    persona,
  });

  let busy = true;
  let over = false;

  function setInputEnabled(enabled) {
    input.disabled = !enabled;
    sendBtn.disabled = !enabled;
  }

  async function fallbackToStatic(error) {
    over = true;
    setInputEnabled(false);
    chat.clearQuickReplies();
    const quotaHit = error?.status === 429;
    await chat.addBotMessage(quotaHit ? strings.aiModeQuotaError : strings.aiModeError);
    const staticMode = createStaticMode({ chat, resume, buckets, strings });
    await staticMode.start();
  }

  function showFinishChip() {
    chat.setQuickReplies([{ label: strings.practiceFinishChip }], async () => {
      if (busy || over) return;
      chat.clearQuickReplies();
      await exchangeTurn(strings.practiceFinishMessage);
    });
  }

  async function exchangeTurn(text) {
    busy = true;
    setInputEnabled(false);

    const result = await practice.send(text);

    if (!result.ok) {
      await fallbackToStatic(result.error);
      return;
    }

    busy = false;
    if (result.ended) {
      over = true;
      chat.clearQuickReplies();
      return;
    }
    setInputEnabled(true);
    showFinishChip();
    input.focus();
  }

  async function submit() {
    const text = input.value.trim();
    if (!text || busy || over) return;
    input.value = "";
    await exchangeTurn(text);
  }

  sendBtn.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });

  const personaLabel = strings.practicePersonaLabels[persona] || strings.practicePersonaLabels.hr;
  await chat.addBotMessage(strings.practiceIntro.replace("{persona}", personaLabel));

  const result = await practice.start();
  if (!result.ok) {
    await fallbackToStatic(result.error);
    return;
  }

  busy = false;
  setInputEnabled(true);
  showFinishChip();
  input.focus();
}

function setupAiMode({ app, chat, staticMode, resume, story, lang, strings }) {
  const modeToggle = app.querySelector("[data-mode-toggle]");
  const input = app.querySelector("[data-chat-input]");
  const sendBtn = app.querySelector("[data-chat-send]");

  const aiMode = createAiMode({ chat, endpoint: siteConfig.aiMode.endpoint, lang, resume, story });
  let mode = "static";
  let busy = false;

  async function enterAiMode() {
    mode = "ai";
    chat.clearQuickReplies();
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    modeToggle.innerHTML = iconAiExit;
    modeToggle.title = strings.aiModeExitTitle;
    await chat.addBotMessage(strings.aiModeIntro);
    await chat.addBotMessage(strings.aiModeGroundingNote);
    if (story?.aiIntroTopics?.length) {
      await chat.addBotList(story.aiIntroTopics);
    }
  }

  function exitAiMode() {
    mode = "static";
    input.disabled = true;
    sendBtn.disabled = true;
    input.value = "";
    modeToggle.innerHTML = iconAiEnter;
    modeToggle.title = strings.aiModeEnterTitle;
    staticMode.start();
  }

  modeToggle.addEventListener("click", () => {
    if (busy) return;
    modeToggle.classList.remove("icon-btn--pulse");
    if (mode === "static") enterAiMode();
    else exitAiMode();
  });

  async function submit() {
    const text = input.value.trim();
    if (!text || busy || mode !== "ai") return;

    busy = true;
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;

    const result = await aiMode.send(text);

    if (!result.ok) {
      const quotaHit = result.error?.status === 429;
      await chat.addBotMessage(quotaHit ? strings.aiModeQuotaError : strings.aiModeError);
      busy = false;
      exitAiMode();
      return;
    }

    busy = false;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
}

function main() {
  initTheme();
  const lang = resolveInitialLanguage(siteConfig.supportedLanguages, siteConfig.defaultLanguage);
  boot(lang);
}

main();

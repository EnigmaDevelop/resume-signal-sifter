// Generates every PNG under docs/screenshots/. Boots the mock worker
// (scripts/mock-worker.mjs) and a Vite dev server pointed at it via
// VITE_AI_ENDPOINT, then drives the real UI with Playwright. Never touches
// the real Groq/Worker endpoint — see scripts/conversations.mjs for the
// scripted replies.
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { conversations } from "./conversations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCREEN_DIR = path.join(ROOT, "docs", "screenshots");

const VITE_PORT = 5183;
const VITE_ORIGIN = `http://127.0.0.1:${VITE_PORT}`;
const MOCK_ORIGIN = "http://127.0.0.1:8788";

const LANGS = ["tr", "en"];
const APP_VIEWPORT = { width: 420, height: 820 };
// Low-content frames (fresh menu, AI hint) leave a large empty band at
// 420x820 because the quick replies pin to the bottom — use a shorter
// viewport for those so the frame reads dense instead of empty.
const SHORT_APP_VIEWPORT = { width: 420, height: 560 };
const DEVICE_SCALE = 2;

const produced = new Set();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPort(url, timeoutMs = 20000) {
  const start = Date.now();
  for (;;) {
    try {
      await fetch(url);
      return;
    } catch {
      if (Date.now() - start > timeoutMs) throw new Error(`Timed out waiting for ${url}`);
      await sleep(300);
    }
  }
}

function killTree(child, label) {
  if (!child || child.exitCode !== null || child.killed) return;
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(child.pid), "/f", "/t"]);
    } else {
      child.kill("SIGTERM");
    }
  } catch (error) {
    console.error(`Failed to kill ${label}:`, error);
  }
}

async function newAppPage(browser, { lang, theme = "light", hintSeen = true, viewport = APP_VIEWPORT }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: DEVICE_SCALE });
  await context.addInitScript(
    ({ lang, theme, hintSeen }) => {
      localStorage.setItem("signal-sifter-lang", lang);
      localStorage.setItem("signal-sifter-theme", theme);
      if (hintSeen) localStorage.setItem("signal-sifter-ai-hint-seen", "1");
      else localStorage.removeItem("signal-sifter-ai-hint-seen");
    },
    { lang, theme, hintSeen },
  );
  return context.newPage();
}

async function shot(page, lang, filename) {
  const dest = path.join(SCREEN_DIR, lang, filename);
  await page.screenshot({ path: dest });
  produced.add(dest);
  console.log(`  wrote ${lang}/${filename}`);
}

async function shotFullPage(page, dest) {
  await page.screenshot({ path: dest, fullPage: true });
  produced.add(dest);
  console.log(`  wrote ${path.relative(SCREEN_DIR, dest)}`);
}

// Waits for the reply-in-flight round trip to finish. The input is disabled
// while a send is in progress and re-enabled once the stream fully lands, so
// that transition is a reliable "done streaming" signal regardless of
// whether the reply produced a badge/coach-label. `extraSelector`, when
// given, additionally confirms the expected UI landmark (badge, coach label,
// card) rendered before we screenshot.
async function sendAndWait(page, text, { extraSelector, timeout = 20000 } = {}) {
  await page.fill("[data-chat-input]", text);
  await page.click("[data-chat-send]");
  try {
    await page.waitForSelector("[data-chat-input][disabled]", { timeout: 1000 });
  } catch {
    // The mock's short streams can complete before we observe the busy
    // state — harmless, the next wait still catches the real completion.
  }
  await page.waitForSelector("[data-chat-input]:not([disabled])", { timeout });
  if (extraSelector) {
    await page.waitForSelector(extraSelector, { timeout: 5000 });
  }
  await page.waitForTimeout(400);
}

async function captureStaticMenu(browser, lang) {
  const page = await newAppPage(browser, { lang, viewport: SHORT_APP_VIEWPORT });
  await page.goto(`${VITE_ORIGIN}/`);
  await page.waitForSelector(".chat__quick-replies .chip");
  await page.waitForTimeout(300);
  await shot(page, lang, "01-static-menu.png");
  await page.context().close();
}

async function captureStaticAnswer(browser, lang) {
  const page = await newAppPage(browser, { lang });
  await page.goto(`${VITE_ORIGIN}/`);
  await page.waitForSelector(".chat__quick-replies .chip");
  await page.click(".chat__quick-replies .chip >> nth=0");
  await page.waitForSelector(".chat__quick-replies .chip");
  await page.click(".chat__quick-replies .chip >> nth=0");
  await page.waitForSelector(".msg__card");
  await page.waitForTimeout(300);
  await shot(page, lang, "02-static-answer.png");
  await page.context().close();
}

async function captureAiHint(browser, lang) {
  const page = await newAppPage(browser, { lang, hintSeen: false, viewport: SHORT_APP_VIEWPORT });
  await page.goto(`${VITE_ORIGIN}/`);
  await page.waitForSelector("xpath=//div[contains(@class,'msg__bubble') and contains(text(),'💡')]");
  await page.waitForSelector("[data-mode-toggle].icon-btn--pulse");
  await page.waitForTimeout(300);
  await shot(page, lang, "03-ai-hint.png");
  await page.context().close();
}

// 04/05/06 share one continuous conversation: the mock server picks its
// scripted reply by *turn count*, so entering AI mode once and sending the
// three scripted questions in order is required for the replies to line up.
async function captureAiSequence(browser, lang) {
  const page = await newAppPage(browser, { lang });
  const turns = conversations[lang].represent;

  await page.goto(`${VITE_ORIGIN}/`);
  await page.waitForSelector(".chat__quick-replies .chip");
  await page.click("[data-mode-toggle]");
  await page.waitForSelector(".msg__list");
  await page.waitForTimeout(300);

  await sendAndWait(page, turns[0].user, {
    extraSelector: ".chat__messages > .msg:last-child .msg__source .tag-pill--verified",
  });
  await shot(page, lang, "04-ai-conflict-answer.png");

  await sendAndWait(page, turns[1].user, {
    extraSelector: ".chat__messages > .msg:last-child .msg__source .tag-pill",
  });
  await shot(page, lang, "05-ai-growth-answer.png");

  await sendAndWait(page, turns[2].user);
  await page.click(".tag-pill--verified >> nth=0");
  await page.waitForSelector(".chat__messages > .msg:last-child .msg__card");
  await page.waitForTimeout(300);
  await shot(page, lang, "06-methodology.png");

  await page.context().close();
}

async function captureGroundingProof(browser, lang) {
  const page = await newAppPage(browser, { lang, viewport: { width: 900, height: 700 } });
  const url = pathToFileURL(path.join(ROOT, "docs", "grounding-demo.html"));
  url.search = `lang=${lang}`;
  await page.goto(url.href);
  await page.waitForSelector(".code-panel .hl");
  await page.waitForTimeout(200);
  await shotFullPage(page, path.join(SCREEN_DIR, lang, "07-grounding-proof.png"));
  await page.context().close();
}

async function capturePracticeCoaching(browser, lang) {
  const page = await newAppPage(browser, { lang });
  const [, weakTurn] = conversations[lang].practice;

  await page.goto(`${VITE_ORIGIN}/?practice=1`);
  await page.waitForSelector("[data-chat-input]:not([disabled])", { timeout: 20000 });
  await page.waitForTimeout(300);

  await sendAndWait(page, weakTurn.user, {
    extraSelector: ".chat__messages > .msg:last-child.msg--bot",
  });
  await page.waitForSelector(".msg--coach");
  await shot(page, lang, "08-practice-coaching.png");
  await page.context().close();
}

async function captureDarkTheme(browser, lang) {
  const page = await newAppPage(browser, { lang, theme: "dark" });
  const turns = conversations[lang].represent;

  await page.goto(`${VITE_ORIGIN}/`);
  await page.waitForSelector(".chat__quick-replies .chip");
  await page.click("[data-mode-toggle]");
  await page.waitForSelector(".msg__list");
  await page.waitForTimeout(300);

  await sendAndWait(page, turns[0].user, {
    extraSelector: ".chat__messages > .msg:last-child .msg__source .tag-pill--verified",
  });
  await shot(page, lang, "09-dark-theme.png");
  await page.context().close();
}

async function captureCvSnippet(browser, lang) {
  const page = await newAppPage(browser, { lang, viewport: { width: 900, height: 500 } });
  const url = pathToFileURL(path.join(ROOT, "docs", "cv-snippet.html"));
  url.search = `lang=${lang}`;
  await page.goto(url.href);
  await page.waitForSelector(".link-line");
  await page.waitForTimeout(200);
  await shotFullPage(page, path.join(SCREEN_DIR, `cv-link-${lang}.png`));
  await page.context().close();
}

function cleanupStale() {
  const dirs = [SCREEN_DIR, path.join(SCREEN_DIR, "tr"), path.join(SCREEN_DIR, "en")];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith(".png")) continue;
      const full = path.join(dir, entry);
      if (fs.statSync(full).isFile() && !produced.has(full)) {
        fs.rmSync(full);
        console.log(`  removed stale ${path.relative(SCREEN_DIR, full)}`);
      }
    }
  }
}

async function main() {
  for (const lang of LANGS) {
    fs.mkdirSync(path.join(SCREEN_DIR, lang), { recursive: true });
  }

  console.log("Starting mock worker...");
  const mockProc = spawn(process.execPath, [path.join(ROOT, "scripts", "mock-worker.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
  });

  console.log("Starting Vite dev server...");
  const isWin = process.platform === "win32";
  const viteProc = spawn("npx", ["vite", "--port", String(VITE_PORT), "--strictPort", "--host", "127.0.0.1"], {
    cwd: ROOT,
    env: { ...process.env, VITE_AI_ENDPOINT: MOCK_ORIGIN },
    stdio: "inherit",
    shell: isWin,
  });

  let browser;
  try {
    await waitForPort(MOCK_ORIGIN);
    await waitForPort(VITE_ORIGIN);
    console.log("Both servers are up. Launching Chromium...");

    browser = await chromium.launch();

    for (const lang of LANGS) {
      console.log(`\n=== ${lang} ===`);
      await captureStaticMenu(browser, lang);
      await captureStaticAnswer(browser, lang);
      await captureAiHint(browser, lang);
      await captureAiSequence(browser, lang);
      await captureGroundingProof(browser, lang);
      await capturePracticeCoaching(browser, lang);
      await captureDarkTheme(browser, lang);
      await captureCvSnippet(browser, lang);
    }

    console.log("\nAll screenshots captured.");
  } finally {
    if (browser) await browser.close();
    cleanupStale();
    killTree(viteProc, "vite");
    killTree(mockProc, "mock-worker");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

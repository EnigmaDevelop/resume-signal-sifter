const TYPING_MIN_MS = 450;
const TYPING_MAX_MS = 1400;
const TYPING_MS_PER_CHAR = 18;

function typingDelay(text) {
  const estimate = text.length * TYPING_MS_PER_CHAR;
  return Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, estimate));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sourceBadgeInfo(key, strings) {
  const verifiedMatch = key.match(/^story\.selfAssessments:(.+)$/);
  if (verifiedMatch) {
    const instrument = verifiedMatch[1];
    const instrumentLabel = strings.instrumentLabels?.[instrument] || instrument;
    return { verified: true, instrument, label: `${strings.sourceVerifiedPrefix} ${instrumentLabel}`, icon: "✓" };
  }
  const label = strings.sourceLabels?.[key];
  if (!label) return null;
  const icon = key.startsWith("resume.") ? "📄" : "📖";
  return { verified: false, label, icon };
}

export function createChat(root, strings) {
  const messagesEl = root.querySelector("[data-chat-messages]");
  const quickRepliesEl = root.querySelector("[data-chat-quick-replies]");

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendBubble(author, buildContent) {
    const msg = document.createElement("div");
    msg.className = `msg msg--${author}`;

    const bubble = document.createElement("div");
    bubble.className = "msg__bubble";
    buildContent(bubble);

    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function addUserMessage(text) {
    return appendBubble("user", (bubble) => {
      bubble.textContent = text;
    });
  }

  function showTypingIndicator() {
    const msg = document.createElement("div");
    msg.className = "msg msg--bot msg--typing";

    const bubble = document.createElement("div");
    bubble.className = "msg__bubble";
    bubble.innerHTML =
      '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  async function renderBotBubble(estimateText, buildContent, { typing = true } = {}) {
    if (!typing) {
      return appendBubble("bot", buildContent);
    }

    const indicator = showTypingIndicator();
    await sleep(typingDelay(estimateText));
    indicator.remove();
    return appendBubble("bot", buildContent);
  }

  function addBotMessage(text, opts) {
    return renderBotBubble(
      text,
      (bubble) => {
        bubble.textContent = text;
      },
      opts,
    );
  }

  function addBotList(items, opts) {
    return renderBotBubble(
      items.join(" "),
      (bubble) => {
        const ul = document.createElement("ul");
        ul.className = "msg__list";
        for (const item of items) {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        }
        bubble.appendChild(ul);
      },
      opts,
    );
  }

  function addBotLinks(links, opts) {
    return renderBotBubble(
      links.map((l) => l.label).join(" "),
      (bubble) => {
        const wrap = document.createElement("div");
        wrap.className = "msg__links";
        for (const link of links) {
          const a = document.createElement("a");
          a.className = "msg__link";
          a.href = link.url;
          a.textContent = link.label;
          if (/^https?:\/\//.test(link.url)) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }
          wrap.appendChild(a);
        }
        bubble.appendChild(wrap);
      },
      opts,
    );
  }

  function addBotCard(card, opts) {
    const estimate = [card.title, card.subtitle, card.description, ...(card.items || [])].filter(Boolean).join(" ");
    return renderBotBubble(
      estimate,
      (bubble) => {
        const wrap = document.createElement("div");
        wrap.className = "msg__card";

        const title = document.createElement("div");
        title.className = "msg__card-title";
        title.textContent = card.title;
        wrap.appendChild(title);

        if (card.subtitle) {
          const subtitle = document.createElement("div");
          subtitle.className = "msg__card-subtitle";
          subtitle.textContent = card.subtitle;
          wrap.appendChild(subtitle);
        }

        if (card.description) {
          const desc = document.createElement("p");
          desc.className = "msg__card-desc";
          desc.textContent = card.description;
          wrap.appendChild(desc);
        }

        if (card.items && card.items.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "msg__list";
          for (const item of card.items) {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          }
          wrap.appendChild(ul);
        }

        if (card.tags && card.tags.length > 0) {
          const tagsWrap = document.createElement("div");
          tagsWrap.className = "msg__card-tags";
          for (const tag of card.tags) {
            const pill = document.createElement("span");
            pill.className = "tag-pill";
            pill.textContent = tag;
            tagsWrap.appendChild(pill);
          }
          wrap.appendChild(tagsWrap);
        }

        if (card.url) {
          const a = document.createElement("a");
          a.className = "msg__card-link";
          a.href = card.url;
          a.textContent = card.linkLabel || card.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          wrap.appendChild(a);
        }

        bubble.appendChild(wrap);
      },
      opts,
    );
  }

  // LLM-free methodology card shown when a ✓ verified badge is tapped —
  // surfaces how the self-assessment was done (framework + honest self-report
  // framing) so the grounding is inspectable rather than taken on faith.
  function showMethodologyCard(instrument) {
    const methodology = strings?.instrumentMethodology?.[instrument];
    if (!methodology) return;
    return addBotCard(
      {
        title: strings.instrumentLabels?.[instrument] || instrument,
        subtitle: strings.methodologyTitle,
        description: `${methodology}\n\n${strings.methodologyDisclaimer}`,
      },
      { typing: false },
    );
  }

  function renderSourceBadge(container, sourceKeys) {
    const badges = sourceKeys
      .filter((key) => key !== "none")
      .map((key) => sourceBadgeInfo(key, strings))
      .filter(Boolean);
    if (badges.length === 0) return;

    const wrap = document.createElement("div");
    wrap.className = "msg__source";
    for (const badge of badges) {
      const pill = document.createElement(badge.verified ? "button" : "span");
      if (badge.verified) {
        pill.type = "button";
        pill.title = strings.methodologyTitle;
        pill.addEventListener("click", () => showMethodologyCard(badge.instrument));
      }
      pill.className = badge.verified ? "tag-pill tag-pill--verified" : "tag-pill";
      pill.textContent = `${badge.icon} ${badge.label}`;
      wrap.appendChild(pill);
    }
    container.appendChild(wrap);
  }

  function streamBotMessage() {
    const indicator = showTypingIndicator();
    let bubble = null;

    function ensureStarted() {
      if (bubble) return;
      indicator.remove();
      bubble = appendBubble("bot", () => {}).querySelector(".msg__bubble");
    }

    return {
      append(text) {
        ensureStarted();
        bubble.textContent += text;
        scrollToBottom();
      },
      cancel() {
        if (bubble) {
          bubble.closest(".msg").remove();
        } else {
          indicator.remove();
        }
      },
      finish(sourceKeys) {
        if (!bubble) {
          indicator.remove();
          return;
        }
        if (strings && Array.isArray(sourceKeys) && sourceKeys.length > 0) {
          renderSourceBadge(bubble.closest(".msg"), sourceKeys);
          scrollToBottom();
        }
      },
    };
  }

  // Same contract as streamBotMessage(), but rendered as a coaching aside
  // (practice mode): distinct visual treatment + label, never source badges.
  function streamCoachMessage() {
    const indicator = showTypingIndicator();
    let textEl = null;

    function ensureStarted() {
      if (textEl) return;
      indicator.remove();
      const msg = appendBubble("bot", (bubble) => {
        const label = document.createElement("div");
        label.className = "msg__coach-label";
        label.textContent = strings?.practiceCoachLabel || "Coach";
        bubble.appendChild(label);
        textEl = document.createElement("div");
        bubble.appendChild(textEl);
      });
      msg.classList.add("msg--coach");
    }

    return {
      append(text) {
        ensureStarted();
        textEl.textContent += text;
        scrollToBottom();
      },
      cancel() {
        if (textEl) {
          textEl.closest(".msg").remove();
        } else {
          indicator.remove();
        }
      },
      finish() {
        if (!textEl) indicator.remove();
      },
    };
  }

  function setQuickReplies(options, onSelect) {
    quickRepliesEl.innerHTML = "";
    if (!options || options.length === 0) {
      quickRepliesEl.hidden = true;
      return;
    }
    quickRepliesEl.hidden = false;
    for (const option of options) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = option.label;
      chip.addEventListener("click", () => onSelect(option));
      quickRepliesEl.appendChild(chip);
    }
  }

  function clearQuickReplies() {
    setQuickReplies([], () => {});
  }

  function clearMessages() {
    messagesEl.innerHTML = "";
  }

  return {
    addUserMessage,
    addBotMessage,
    addBotList,
    addBotLinks,
    addBotCard,
    streamBotMessage,
    streamCoachMessage,
    setQuickReplies,
    clearQuickReplies,
    clearMessages,
    scrollToBottom,
  };
}

const DEFAULT_STRINGS = {
  backToMenu: "⬅ Back to menu",
  present: "present",
};

function resolveProject(resume, ref) {
  return resume.projects.find((p) => p.id === ref);
}

function resolveExperience(resume, refs) {
  if (!refs) return resume.experience;
  return refs.map((id) => resume.experience.find((e) => e.id === id)).filter(Boolean);
}

function resolveSkills(resume, refs) {
  if (!refs) return resume.skills;
  return refs.map((cat) => resume.skills.find((s) => s.category === cat)).filter(Boolean);
}

function formatDateRange(start, end, strings) {
  const endLabel = end === "present" ? strings.present : end;
  return `${start} - ${endLabel}`;
}

function projectToCard(project) {
  return {
    title: project.name,
    description: project.description,
    tags: project.tags,
    url: project.url || undefined,
  };
}

function experienceToCard(exp, strings) {
  const range = formatDateRange(exp.start, exp.end, strings);
  return {
    title: `${exp.role} · ${exp.company}`,
    subtitle: exp.location ? `${range} · ${exp.location}` : range,
    items: exp.highlights,
  };
}

function skillToCard(skill) {
  return {
    title: skill.category,
    tags: skill.items,
  };
}

function educationToCard(edu) {
  return {
    title: edu.school,
    subtitle: `${edu.degree} · ${edu.field}`,
    description: `${edu.start} - ${edu.end}`,
  };
}

export function createStaticMode({ chat, resume, buckets, strings = {} }) {
  const s = { ...DEFAULT_STRINGS, ...strings };

  async function renderBlock(block) {
    switch (block.type) {
      case "text":
        await chat.addBotMessage(block.text);
        break;
      case "list":
        await chat.addBotList(block.items);
        break;
      case "link":
        await chat.addBotLinks([{ label: block.label, url: block.url }]);
        break;
      case "links":
        await chat.addBotLinks(resume.profile.links);
        break;
      case "project": {
        const project = resolveProject(resume, block.ref);
        if (project) await chat.addBotCard(projectToCard(project));
        break;
      }
      case "projects":
        for (const project of resume.projects) {
          await chat.addBotCard(projectToCard(project));
        }
        break;
      case "experience":
        for (const exp of resolveExperience(resume, block.refs)) {
          await chat.addBotCard(experienceToCard(exp, s));
        }
        break;
      case "skills":
        for (const skill of resolveSkills(resume, block.refs)) {
          await chat.addBotCard(skillToCard(skill));
        }
        break;
      case "education":
        for (const edu of resume.education) {
          await chat.addBotCard(educationToCard(edu));
        }
        break;
      default:
        break;
    }
  }

  async function showMenu() {
    chat.clearQuickReplies();
    await chat.addBotMessage(buckets.menu.title);
    chat.setQuickReplies(
      buckets.menu.categories.map((c) => ({ label: `${c.icon} ${c.label}`, categoryId: c.id })),
      async (option) => {
        chat.clearQuickReplies();
        chat.addUserMessage(option.label);
        await enterCategory(option.categoryId);
      },
    );
  }

  async function enterCategory(categoryId) {
    const category = buckets.categories[categoryId];
    await chat.addBotMessage(category.intro);
    showCategoryMenu(categoryId, category);
  }

  function showCategoryMenu(categoryId, category) {
    const options = [
      ...category.questions.map((q) => ({ label: q.label, questionId: q.id })),
      { label: s.backToMenu, back: true },
    ];
    chat.setQuickReplies(options, async (option) => {
      chat.clearQuickReplies();
      chat.addUserMessage(option.label);

      if (option.back) {
        await showMenu();
        return;
      }

      const question = category.questions.find((q) => q.id === option.questionId);
      for (const block of question.answer) {
        await renderBlock(block);
      }
      showCategoryMenu(categoryId, category);
    });
  }

  return { start: showMenu };
}

const LANG_KEY = "signal-sifter-lang";

export const uiStrings = {
  tr: {
    inputPlaceholder: "Bir mesaj yazın…",
    themeToggleTitle: "Tema değiştir",
    langToggleTitle: "Dil değiştir",
    backToMenu: "⬅ Ana menü",
    present: "günümüz",
    aiModeEnterTitle: "AI moduna geç",
    aiModeExitTitle: "Statik moda dön",
    aiModeIntro: "Artık serbestçe soru sorabilirsin. Sadece özgeçmişimle ilgili sorulara cevap veriyorum.",
    aiModeGroundingNote:
      "Her cevabım gerçek özgeçmiş ve hikaye verime dayanır; kullandığım kaynaklar cevabın altında rozet olarak görünür. ✓ işaretli rozetler literatüre dayalı öz-değerlendirmelerdir — metodolojiyi görmek için rozete dokunabilirsin.",
    aiModeError: "AI modu şu anda kullanılamıyor, statik moda dönülüyor.",
    aiModeQuotaError:
      "Ücretsiz demo kotası şu an dolu — biraz sonra tekrar deneyebilirsin. (Bu açık kaynak bir şablon: fork'layıp kendi anahtarınla sınırsız kullanabilirsin.) Şimdilik statik moda dönüyorum.",
    aiModeHint: "💡 İpucu: sağ üstteki ✦ yıldız simgesine dokunursan benimle serbestçe, kendi kelimelerinle sohbet edebilirsin.",
    practiceBadge: "PROVA",
    practiceStatusText: "Mülakat provası oturumu",
    practiceExitTitle: "Provadan çık",
    practiceIntro:
      "🎯 Mülakat provası modu: Karşında {persona} rolünde bir AI mülakatçı var. Sorular senin özgeçmişine ve hikayene dayanacak; her cevabından sonra kısa bir koçluk notu göreceksin. İstediğin an aşağıdaki düğmeyle bitirip genel değerlendirmeni alabilirsin.",
    practicePersonaLabels: {
      hr: "İK uzmanı",
      manager: "işe alım yöneticisi",
    },
    practiceCoachLabel: "Koçluk notu",
    practiceFinishChip: "🏁 Bitir ve genel değerlendirme al",
    practiceFinishMessage: "Mülakatı burada bitirelim — genel değerlendirmemi alabilir miyim?",
    methodologyTitle: "Bu değerlendirme nasıl yapıldı?",
    methodologyDisclaimer:
      "Aday tarafından, projenin halka açık rehberindeki (STORY_GUIDE) yapılandırılmış anketle öz-puanlanmıştır — dürüst öz-bildirim, üçüncü taraf sertifikası değildir.",
    instrumentMethodology: {
      teamRole:
        "Belbin Takım Rolleri çerçevesi (Belbin, 1981): kişinin takım içinde doğal olarak üstlendiği rolleri tanımlar.",
      conflictStyle:
        "Thomas–Kilmann Çatışma Modeli (TKI, 1974): anlaşmazlık durumlarında beş temel yaklaşımdan hangilerine eğilim olduğunu haritalar.",
      motivationDrivers:
        "Öz-Belirleme Kuramı (Deci & Ryan): özerklik, yetkinlik ve aidiyet eksenlerinde içsel motivasyon kaynaklarını tanımlar.",
      personalitySnapshot:
        "TIPI — On Maddelik Kişilik Envanteri (Gosling vd., 2003): Beş Faktör kişilik modelinin kısa öz-bildirim versiyonu.",
      leadershipStyle:
        "Goleman'ın Altı Liderlik Stili (Harvard Business Review, 2000): duruma göre kullanılan liderlik yaklaşımlarını sınıflandırır.",
    },
    sourceVerifiedPrefix: "Doğrulanmış öz-değerlendirme:",
    sourceLabels: {
      "resume.profile": "Profil",
      "resume.experience": "Deneyim",
      "resume.projects": "Projeler",
      "resume.education": "Eğitim",
      "resume.skills": "Yetenekler",
      "story.motivation": "Motivasyon",
      "story.values": "Değerler",
      "story.workStyle": "Çalışma tarzı",
      "story.careerGoals": "Kariyer hedefleri",
      "story.strengths": "Güçlü yönler",
      "story.growthAreas": "Gelişim alanları",
      "story.behavioralStories": "Deneyim hikayesi",
    },
    instrumentLabels: {
      teamRole: "Takım Rolü",
      conflictStyle: "Çatışma Tarzı",
      motivationDrivers: "Motivasyon Kaynağı",
      personalitySnapshot: "Kişilik Anlık Görüntüsü",
      leadershipStyle: "Liderlik Tarzı",
    },
  },
  en: {
    inputPlaceholder: "Type a message…",
    themeToggleTitle: "Toggle theme",
    langToggleTitle: "Switch language",
    backToMenu: "⬅ Back to menu",
    present: "present",
    aiModeEnterTitle: "Switch to AI mode",
    aiModeExitTitle: "Back to static mode",
    aiModeIntro: "You can now ask anything freely. I only answer questions related to my résumé.",
    aiModeGroundingNote:
      "Every answer is grounded in my real résumé and story data; the sources appear as badges under each reply. Badges marked ✓ are literature-based self-assessments — tap one to see the methodology.",
    aiModeError: "AI mode is currently unavailable, falling back to static mode.",
    aiModeQuotaError:
      "The free demo quota is maxed out right now — please try again a little later. (This is an open-source template: fork it with your own key for unlimited use.) Falling back to static mode for now.",
    aiModeHint: "💡 Tip: tap the ✦ sparkle icon top-right to chat with me freely, in your own words.",
    practiceBadge: "PRACTICE",
    practiceStatusText: "Interview practice session",
    practiceExitTitle: "Exit practice",
    practiceIntro:
      "🎯 Interview practice mode: you're facing an AI interviewer playing {persona}. The questions will be grounded in your own résumé and story; after each answer you'll get a short coaching note. Finish any time with the button below to get your overall evaluation.",
    practicePersonaLabels: {
      hr: "an HR screener",
      manager: "a hiring manager",
    },
    practiceCoachLabel: "Coach's note",
    practiceFinishChip: "🏁 Finish & get my evaluation",
    practiceFinishMessage: "Let's wrap up here — could I get my overall evaluation?",
    methodologyTitle: "How was this assessed?",
    methodologyDisclaimer:
      "Self-scored by the candidate using the structured questionnaire in the project's public guide (STORY_GUIDE) — honest self-report, not a third-party certification.",
    instrumentMethodology: {
      teamRole:
        "Belbin Team Roles framework (Belbin, 1981): identifies the roles a person naturally takes on within a team.",
      conflictStyle:
        "Thomas–Kilmann Conflict Mode Instrument (TKI, 1974): maps tendencies across five core approaches to disagreement.",
      motivationDrivers:
        "Self-Determination Theory (Deci & Ryan): identifies intrinsic motivation drivers along autonomy, competence, and relatedness.",
      personalitySnapshot:
        "TIPI — Ten-Item Personality Inventory (Gosling et al., 2003): a brief self-report measure of the Big Five personality model.",
      leadershipStyle:
        "Goleman's Six Leadership Styles (Harvard Business Review, 2000): classifies leadership approaches used in different situations.",
    },
    sourceVerifiedPrefix: "Verified self-assessment:",
    sourceLabels: {
      "resume.profile": "Profile",
      "resume.experience": "Experience",
      "resume.projects": "Projects",
      "resume.education": "Education",
      "resume.skills": "Skills",
      "story.motivation": "Motivation",
      "story.values": "Values",
      "story.workStyle": "Work style",
      "story.careerGoals": "Career goals",
      "story.strengths": "Strengths",
      "story.growthAreas": "Growth areas",
      "story.behavioralStories": "Experience story",
    },
    instrumentLabels: {
      teamRole: "Team Role",
      conflictStyle: "Conflict Style",
      motivationDrivers: "Motivation Drivers",
      personalitySnapshot: "Personality Snapshot",
      leadershipStyle: "Leadership Style",
    },
  },
};

export function getStoredLanguage(supportedLanguages) {
  const saved = localStorage.getItem(LANG_KEY);
  return supportedLanguages.includes(saved) ? saved : null;
}

export function setStoredLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function detectBrowserLanguage(supportedLanguages) {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag?.slice(0, 2).toLowerCase();
    if (supportedLanguages.includes(code)) return code;
  }
  return null;
}

export function resolveInitialLanguage(supportedLanguages, defaultLanguage) {
  return getStoredLanguage(supportedLanguages) ?? detectBrowserLanguage(supportedLanguages) ?? defaultLanguage;
}

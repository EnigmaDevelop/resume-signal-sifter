// Scripted scenario data for scripts/mock-worker.mjs. Each reply is the raw
// text the real Worker would stream — markers (§SRC:…§ / §COACH§ / §Q§)
// included — so the client-side buffering/parsing logic in src/aiMode.js and
// src/practiceMode.js exercises exactly the same code path it does against
// the real backend. This is what screenshots.mjs drives; it never calls the
// real Groq/Worker endpoint.
//
// Turns are matched by (lang, mode, number of user messages in the request).
// The client always pushes the new user message onto history before it
// sends, so turn N (1-indexed) has exactly N user messages in body.messages.

export const conversations = {
  tr: {
    represent: [
      {
        user: "Ekipte teknik yön konusunda anlaşmazlık olduğunda ne yaparsınız?",
        reply:
          "§SRC:story.selfAssessments:conflictStyle,story.behavioralStories§\n" +
          "Anlaşmazlıkları “kim haklı” tartışmasından çıkarıp “veri ne gösteriyor” sorusuna çevirmeye çalışırım. Güzel bir örneğini geçtiğimiz yıl yaşadık: monolit mimariyi mikroservislere bölme kararını tartışırken bir arkadaşım bunun erken bir optimizasyon olacağını, önce iç mimariyi sadeleştirmemiz gerektiğini düşünüyordu. Tartışmayı uzatmak yerine birlikte kısa bir karar dokümanı yazdık; hangi ölçütlerin hangi yaklaşımı desteklediğini net biçimde ortaya koyduk, iki taraf da varsayımlarını açıkça belirtti ve bir haftalık zaman kutusuyla küçük bir kanıt-konsepti denemesi yaptık. Deneme, geçişin doğru yönde olduğunu ama daha kademeli ilerlemesi gerektiğini gösterdi; arkadaşımın endişesi kademeli bir yol haritası olarak plana dahil edildi ve karar, dayatılmış değil ekip tarafından ortaklaşa sahiplenilmiş bir karara dönüştü. Genel olarak çatışma tarzım da buna benzer: işbirlikçi bir yaklaşımı tercih ederim, zaman baskısı olduğunda uzlaşmaya da açığım.",
      },
      {
        user: "Ekibiniz en büyük gelişim alanınız için ne derdi?",
        reply:
          "§SRC:story.growthAreas§\n" +
          "Dürüst cevap: delegasyon. Bir işi nasıl çözeceğimi net biçimde bildiğimde, erkenden devretmek yerine kendim yapmaya kalkışabiliyorum — kıdemli bir role doğru ilerlerken tam olarak bırakmam gereken bir refleks bu. Bunun yanında, bir konu kafamda netse yazıya dökmeyi erteleyip doğrudan koda geçme eğilimim var; bunu genelde birisi ihtiyaç duyup sorana kadar fark etmeyebiliyorum. İkisini de muhtemelen ekibim benden önce fark ederdi ama ikisi üzerinde de aktif olarak çalışıyorum.",
      },
      {
        user: "Bu değerlendirmeler nasıl yapıldı — sertifikalı mı?",
        reply:
          "§SRC:none§\n" +
          "Sormanız iyi oldu, açık konuşayım: bunlar üçüncü taraf sertifikaları değil. Çatışma tarzım ya da liderlik tarzım gibi başlıklar, halka açık, yayınlanmış bir anket kullanılarak kendim tarafından puanlanan yapılandırılmış öz-değerlendirmeler — kullanılan çerçeveleri ve soruları bu projenin STORY_GUIDE dosyasında bulabilirsiniz. Yani bunları resmi bir psikometrik sertifika değil, tanınmış çerçevelere dayanan dürüst bir öz-bildirim olarak düşünün. Bence bu şeffaflık bir rozetten daha değerli: kendimi nasıl gördüğümü, sizin de kontrol edebileceğiniz bir metodolojiye dayanarak doğrudan görüyorsunuz.",
      },
    ],
    practice: [
      {
        user: "[START_INTERVIEW]",
        reply:
          "§Q§\n" +
          "Merhaba, zaman ayırdığınız için teşekkürler — bugün İK uzmanı rolündeyim ve sohbet havasında ilerleyelim istiyorum. Özgeçmişinizden bir noktayla başlayalım: teknik lider olduğunuz dönemde ortalama PR inceleme süresinin %35 kısaldığını belirtmişsiniz. Orada gerçekte ne değişti, anlatır mısınız?",
      },
      {
        user: "code review'lar yavaştı, ekipçe bir checklist yaptık, düzeldi",
        reply:
          "§COACH§\n" +
          "İyi bir başlangıç ama Sonuç (Result) kısmı eksik — üstelik elinizde güçlü bir tane var: kendi hikayenizde ortalama PR inceleme süresinin üç ay içinde %35 kısaldığı belirtiliyor, bunu öne çıkarın. Ayrıca “ekipçe” ifadesine dikkat edin — şu haliyle sizin payınızın ne olduğunu ekibin ortak payından ayırt edemiyorum. Daha güçlü bir versiyon şöyle olabilir: “İnceleme checklist'inin ilk taslağını ben önerip yazdım, ardından ekibi hizalamak için haftalık bir kalibrasyon toplantısı başlattım — üç ay içinde ortalama inceleme süresi %35 kısaldı.”\n" +
          "§Q§\n" +
          "O zaman checklist sürecine biraz daha yakından bakalım — hangi kısmı sizin fikrinizdi, hangisi ekiple birlikte ortaya çıktı?",
      },
    ],
  },
  en: {
    represent: [
      {
        user: "How do you handle disagreements about technical direction?",
        reply:
          "§SRC:story.selfAssessments:conflictStyle,story.behavioralStories§\n" +
          "I try to move disagreements away from “who's right” and toward “what does the data say.” A good example: when we were deciding whether to split our monolith into microservices, a teammate felt it was premature and that we should simplify the internal architecture first. Instead of arguing it out, we wrote a short decision doc together listing which metrics and scenarios would favor each approach, both sides stated their assumptions explicitly, and we ran a one-week timeboxed proof of concept to test them. The experiment showed the migration was the right direction, but that it should happen more gradually — so my teammate's concern became a phased roadmap instead of a blocker, and the decision ended up being owned by the whole team rather than imposed by me. That's pretty consistent with how I generally operate: I lean collaborative, with some compromise when time is tight.",
      },
      {
        user: "What would your team say is your biggest growth area?",
        reply:
          "§SRC:story.growthAreas§\n" +
          "Honestly? Delegation. I still catch myself picking up a task myself instead of handing it off earlier, especially when I already know exactly how I'd solve it — which is exactly the instinct I need to unlearn as I grow into a more senior role. I'm also working on prioritizing written documentation before diving straight into code; when something's clear in my head, I sometimes don't write it down until someone else needs it and asks. Both are things my team would probably flag before I would, honestly, but I'm actively working on them.",
      },
      {
        user: "How were these assessments done — are they certified?",
        reply:
          "§SRC:none§\n" +
          "Good question to ask, and I'd rather be upfront about it: these aren't third-party certifications. Things like my conflict style or leadership style are structured self-assessments that I scored myself using a public, published questionnaire — you can find the exact frameworks and questions in this project's STORY_GUIDE. So think of them as honest self-report grounded in well-known frameworks, not an official psychometric certification. I think that transparency matters more than a badge would: you're seeing exactly how I see myself, sourced from a methodology you can go check yourself.",
      },
    ],
    practice: [
      {
        user: "[START_INTERVIEW]",
        reply:
          "§Q§\n" +
          "Hi, thanks for making time for this — I'll be playing the HR screener today, and we'll keep this conversational. Let's start with something from your résumé: you mention that under your tech lead role, average PR review time dropped by 35%. Can you walk me through what actually changed?",
      },
      {
        user: "code reviews were slow, we made a checklist as a team, it got better",
        reply:
          "§COACH§\n" +
          "Good instinct to bring this up, but you're missing the Result — and you actually have a great one: your own story notes that average PR review time dropped 35% within three months, so lead with that. I'd also watch the “we” here — right now I can't tell what you specifically did versus what the team did collectively. A stronger version might sound like: “I proposed and wrote the first draft of the review checklist, then ran a weekly calibration session to keep the team aligned — within three months, average review time dropped 35%.”\n" +
          "§Q§\n" +
          "So walking through that checklist rollout specifically — what part of it was your idea versus something the team arrived at together?",
      },
    ],
  },
};

// Used once a scenario runs past its scripted turns (shouldn't happen during
// screenshots.mjs, but keeps `npm run mock` usable for manual poking around).
export const fallback = {
  tr: {
    represent: "§SRC:none§\nBu, demo mock sunucusundaki senaryo dışı bir soru — gerçek Worker'da bu, özgeçmiş ve hikaye verime dayalı bir cevap üretir.",
    practice:
      "§COACH§\nBu senaryo dışı bir tur — gerçek Worker'da bu noktada cevabınıza özel bir koçluk notu görürdünüz.\n§Q§\nDevam edelim: bahsetmek istediğiniz başka bir deneyim var mı?",
  },
  en: {
    represent: "§SRC:none§\nThis is an off-script question in the demo mock server — the real Worker would ground this in my actual résumé and story data.",
    practice:
      "§COACH§\nThis is an off-script turn — against the real Worker you'd see coaching tailored to your actual answer here.\n§Q§\nLet's keep going: is there another experience you'd like to talk about?",
  },
};

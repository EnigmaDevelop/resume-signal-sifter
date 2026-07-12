import siteConfig from "../content/config.json";
import trResume from "../content/tr/resume.json";
import trBuckets from "../content/tr/buckets.json";
import trStory from "../content/tr/story.json";
import enResume from "../content/en/resume.json";
import enBuckets from "../content/en/buckets.json";
import enStory from "../content/en/story.json";

export const content = {
  tr: { resume: trResume, buckets: trBuckets, story: trStory },
  en: { resume: enResume, buckets: enBuckets, story: enStory },
};

// Build-time-only override for local/dev tooling (mock server, screenshot
// generation): when VITE_AI_ENDPOINT is set, AI mode is force-enabled against
// that endpoint. content/config.json itself is never touched — it ships with
// aiMode.enabled: false, so the deployed static site has no runtime attack
// surface unless the repo owner explicitly flips it after standing up their
// own Worker.
const devEndpoint = import.meta.env.VITE_AI_ENDPOINT;
const resolvedSiteConfig = devEndpoint
  ? { ...siteConfig, aiMode: { enabled: true, endpoint: devEndpoint } }
  : siteConfig;

export { resolvedSiteConfig as siteConfig };

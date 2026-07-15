export type AppTheme = "dark" | "light";

export const PERSIST_STORAGE_KEY = "nextb-storage";

export function parseStoredTheme(raw: string | null): AppTheme {
  if (!raw) return "dark";
  try {
    const parsed = JSON.parse(raw) as {
      state?: { theme?: AppTheme; mapTheme?: AppTheme };
    };
    const theme = parsed.state?.theme ?? parsed.state?.mapTheme;
    return theme === "light" || theme === "dark" ? theme : "dark";
  } catch {
    return "dark";
  }
}

/** Inline script — must run before first paint to avoid theme flash. */
export const themeInitScript = `(function(){try{var r=localStorage.getItem("${PERSIST_STORAGE_KEY}");var t="dark";if(r){var p=JSON.parse(r);var s=p.state||{};t=s.theme||s.mapTheme||"dark"}if(t!=="light"&&t!=="dark")t="dark";document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark"}})();`;

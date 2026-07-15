import axios from "axios";

let userInfo = "";
let authTimer: ReturnType<typeof setTimeout> | null = null;

const ALERTS_URL = "https://info.stbsa.ro/v2/api/web/notifications";
const AUTH_URL = "https://info.stbsa.ro/v2/api/web/user/auth";

const COMMON_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "en",
  "App-Id": "buca1aafb0c-e130-41b7-92bc-5e7dd03f0c96",
  "App-Version": "0.0.0",
  "App-key": "gcALgRyZHC,qFonZ=Jde",
  Connection: "keep-alive",
  "Device-Name": "Chrome",
  Host: "info.stbsa.ro",
  Lang: "ro",
  "OS-Type": "Web",
  "OS-Version":
    "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://info.stbsa.ro/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  Source: "ro.radcom.smartcity.web",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "sec-ch-ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
};

function startAuthRefresh() {
  async function fetchAuth() {
    try {
      const response = await axios.get(AUTH_URL, { headers: COMMON_HEADERS });
      userInfo = response.data.user_info || "";
      if (authTimer) clearTimeout(authTimer);
      authTimer = setTimeout(fetchAuth, 30 * 60 * 1000);
    } catch {
      authTimer = setTimeout(fetchAuth, 2 * 60 * 1000);
    }
  }
  fetchAuth();
}

startAuthRefresh();

export async function getAlerts() {
  const headers = {
    ...COMMON_HEADERS,
    "User-Info": userInfo,
    "Content-Type": "application/json",
    "Accept-Language": "en,en-CA;q=0.9,ro;q=0.8",
  };

  while (true) {
    try {
      if (!userInfo) {
        await new Promise((res) => setTimeout(res, 1000));
      }
      const r = await axios.get(ALERTS_URL, {
        headers: { ...headers, "User-Info": userInfo },
      });
      return r.data;
    } catch (e: unknown) {
      const err = e as { response?: { status: number } };
      if (err.response?.status === 412) {
        const oldUserInfo = userInfo;
        startAuthRefresh();
        let waited = 0;
        while (userInfo === oldUserInfo && waited < 5000) {
          await new Promise((res) => setTimeout(res, 200));
          waited += 200;
        }
        continue;
      }
      throw e;
    }
  }
}

// resources/js/widgets/weather.js

import { getLocale, tr } from "../os/i18n.js";

const STORE_KEY = "nexus.weather.location";
// { mode: "auto" } OR { mode:"manual", name:"Prague", lat:..., lon:..., country:"CZ" }

const I18N = {
    cz: {
        updated: "Aktualizováno {time}",
        weather_unavailable: "Počasí není dostupné",
        check_permissions: "Zkontroluj oprávnění / síť",
        weather_title: "Počasí",
        next_days: "Další dny",
        location_title: "Lokace",
        use_auto: "Použít auto lokaci",
        search_placeholder: "Hledat město (např. Praha, Brno, Chicago)",
        pick_result: "Vyber výsledek:",
        manual_prefix: "Ruční",
        auto_geo: "Auto (geolokace)",
        auto_short: "Auto",
        type_min_2: "Napiš aspoň 2 znaky.",
        searching: "Hledám…",
        no_results: "Žádné výsledky.",
        search_failed: "Vyhledání selhalo. Zkontroluj síť.",
        wind: "Vítr",
        refresh: "Obnovit",
        change_location: "Změnit lokaci",
    },
    en: {
        updated: "Updated {time}",
        weather_unavailable: "Weather unavailable",
        check_permissions: "Check permissions / network",
        weather_title: "Weather",
        next_days: "Next days",
        location_title: "Location",
        use_auto: "Use auto location",
        search_placeholder: "Search city (e.g. Prague, Brno, Chicago)",
        pick_result: "Pick a result:",
        manual_prefix: "Manual",
        auto_geo: "Auto (geolocation)",
        auto_short: "Auto",
        type_min_2: "Type at least 2 characters.",
        searching: "Searching…",
        no_results: "No results.",
        search_failed: "Search failed. Check network.",
        wind: "Wind",
        refresh: "Refresh",
        change_location: "Change location",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

function fmt(key, vars = {}, fallback = "") {
    let msg = t(key, fallback);
    for (const [k, v] of Object.entries(vars)) msg = msg.replace(`{${k}}`, String(v));
    return msg;
}

function dateLocale() {
    return getLocale() === "cz" ? "cs-CZ" : "en-US";
}

const WMO = {
    0: ["Clear", "☀"],
    1: ["Mostly clear", "🌤"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁"],
    45: ["Fog", "🌫"],
    48: ["Rime fog", "🌫"],
    51: ["Drizzle", "🌦"],
    53: ["Drizzle", "🌦"],
    55: ["Drizzle", "🌧"],
    61: ["Rain", "🌧"],
    63: ["Rain", "🌧"],
    65: ["Heavy rain", "🌧"],
    71: ["Snow", "🌨"],
    73: ["Snow", "🌨"],
    75: ["Heavy snow", "❄"],
    80: ["Showers", "🌧"],
    81: ["Showers", "🌧"],
    82: ["Heavy showers", "⛈"],
    95: ["Thunderstorm", "⛈"],
    96: ["Thunder + hail", "⛈"],
    99: ["Thunder + hail", "⛈"],
};

const WMO_CZ = {
    Clear: "Jasno",
    "Mostly clear": "Převážně jasno",
    "Partly cloudy": "Polojasno",
    Overcast: "Zataženo",
    Fog: "Mlha",
    "Rime fog": "Mrznoucí mlha",
    Drizzle: "Mrholení",
    Rain: "Déšť",
    "Heavy rain": "Silný déšť",
    Snow: "Sněžení",
    "Heavy snow": "Silné sněžení",
    Showers: "Přeháňky",
    "Heavy showers": "Silné přeháňky",
    Thunderstorm: "Bouřka",
    "Thunder + hail": "Bouřka s krupobitím",
};

function localizeWmoDesc(desc) {
    return tr({ cz: { desc: WMO_CZ[desc] || desc }, en: { desc } }, "desc", desc);
}

function loadPref() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return { mode: "auto" };
        const p = JSON.parse(raw);
        if (!p?.mode) return { mode: "auto" };
        return p;
    } catch {
        return { mode: "auto" };
    }
}

function savePref(pref) {
    localStorage.setItem(STORE_KEY, JSON.stringify(pref));
}

function fmtUpdated() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function getCoordsFromGeo() {
    const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("No geolocation"));
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
    });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Auto" };
}

async function geocodeCity(query) {
    const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(query)}` +
        `&count=6&language=en&format=json`;

    const r = await fetch(url);
    if (!r.ok) throw new Error("Geocoding failed");
    const data = await r.json();
    return data?.results ?? [];
}

async function getWeather(lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${encodeURIComponent(lat)}` +
        `&longitude=${encodeURIComponent(lon)}` +
        `&current=temperature_2m,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto`;

    const r = await fetch(url);
    if (!r.ok) throw new Error("Weather fetch failed");
    return r.json();
}

// Small shared state for UI updates
const state = {
    pref: loadPref(),
    last: null, // { name, lat, lon, temp, icon, desc, wind, updated }
    listeners: new Set(),
};

function focusExistingWindow(wm, id) {
    const existing = wm?.windows?.get(id);
    if (!existing) return false;
    if (existing.state?.minimized) wm.restore(id);
    wm.focus(id);
    return true;
}

function notify() {
    for (const fn of state.listeners) fn(state.last, state.pref);
}

function setLast(last) {
    state.last = last;
    notify();
}

async function resolveLocation() {
    const pref = state.pref;

    if (pref.mode === "manual" && typeof pref.lat === "number" && typeof pref.lon === "number") {
        return { lat: pref.lat, lon: pref.lon, name: pref.name ?? "Manual", country: pref.country ?? "" };
    }

    // auto
    const geo = await getCoordsFromGeo();
    return { lat: geo.lat, lon: geo.lon, name: "Auto", country: "" };
}

export async function refreshWeather() {
    const loc = await resolveLocation();
    const data = await getWeather(loc.lat, loc.lon);

    const t = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const wind = Math.round(data.current.wind_speed_10m);

    const [baseDesc, icon] = WMO[code] ?? [t("weather_title", "Weather"), "☁"];
    const desc = localizeWmoDesc(baseDesc);

    const name =
        state.pref.mode === "manual"
            ? `${state.pref.name}${state.pref.country ? ", " + state.pref.country : ""}`
            : `Auto (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})`;

    setLast({
        name,
        lat: loc.lat,
        lon: loc.lon,
        temp: t,
        icon,
        desc,
        wind,
        updated: fmtUpdated(),
        daily: data.daily,
    });
}

export function initWeatherUI({ wm } = {}) {
    // Bind UI elements if present
    const elTemp = document.getElementById("wx-temp");
    const elCity = document.getElementById("wx-city");
    const elDesc = document.getElementById("wx-desc");
    const elUpd = document.getElementById("wx-updated");
    const btnRefresh = document.getElementById("wx-refresh");

    const tbBtn = document.getElementById("taskbar-weather");
    const tbTemp = document.getElementById("tb-wx-temp");
    const tbIcon = document.getElementById("tb-wx-icon");
    const tbCity = document.getElementById("tb-wx-city");

    const render = (last) => {
        if (!last) return;

        if (elTemp) elTemp.textContent = `${last.temp}°`;
        if (elCity) elCity.textContent = last.name;
        if (elDesc) elDesc.textContent = last.desc;
        if (elUpd) elUpd.textContent = fmt("updated", { time: last.updated }, `Updated ${last.updated}`);

        if (tbTemp) tbTemp.textContent = `${last.temp}°`;
        if (tbIcon) tbIcon.textContent = last.icon;
        if (tbCity) tbCity.textContent = state.pref.mode === "manual" ? (state.pref.name ?? "—") : t("auto_short", "Auto");
    };

    // Subscribe
    const onUpdate = (last) => render(last);
    state.listeners.add(onUpdate);

    btnRefresh?.addEventListener("click", () => refreshWeather().catch(() => { }));

    // Click pill -> open Weather window (if wm provided)
    tbBtn?.addEventListener("click", () => {
        if (!wm) return;
        openWeatherWindow(wm);
    });

    // initial refresh + timer
    refreshWeather().catch(() => {
        // graceful fallback text
        if (elCity) elCity.textContent = t("weather_unavailable", "Weather unavailable");
        if (elDesc) elDesc.textContent = t("check_permissions", "Check permissions / network");
    });

    setInterval(() => refreshWeather().catch(() => { }), 15 * 60 * 1000);
}

export function openWeatherWindow(wm) {
    if (focusExistingWindow(wm, "weather")) return;

    const contentEl = document.createElement("div");
    contentEl.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div>
        <div style="font-family:'Ubuntu Sans'; font-weight:800; letter-spacing:.05em;">${t("weather_title", "Weather")}</div>
        <div class="muted" id="wxw-name">—</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="nx-btn" id="wxw-refresh" title="${t("refresh", "Refresh")}">↻</button>
        <button class="nx-btn" id="wxw-location" title="${t("change_location", "Change location")}">⌖</button>
      </div>
    </div>

    <div style="margin-top:12px; display:flex; align-items:center; gap:14px;">
      <div style="font-size:40px; line-height:1;" id="wxw-icon">☁</div>
      <div>
        <div style="font-family:'Ubuntu Sans'; font-weight:900; font-size:34px; line-height:1;" id="wxw-temp">--°</div>
        <div class="muted" id="wxw-desc">—</div>
        <div class="muted" id="wxw-wind">—</div>
      </div>
    </div>

    <div style="margin-top:12px;" class="muted" id="wxw-updated">—</div>

    <div style="margin-top:14px;">
      <div class="nx-row" style="margin-bottom:8px;">
        <div class="muted">${t("next_days", "Next days")}</div>
        <div class="nx-badge">Open-Meteo</div>
      </div>
      <div id="wxw-forecast" class="nx-list"></div>
    </div>
  `;

    wm.createWindow({
        id: "weather",
        title: t("weather_title", "Weather"),
        iconText: "☁",
        x: 240,
        y: 120,
        width: 520,
        height: 520,
        contentEl,
    });

    const updateView = (last) => {
        if (!last) return;

        contentEl.querySelector("#wxw-name").textContent = last.name;
        contentEl.querySelector("#wxw-icon").textContent = last.icon;
        contentEl.querySelector("#wxw-temp").textContent = `${last.temp}°`;
        contentEl.querySelector("#wxw-desc").textContent = last.desc;
        contentEl.querySelector("#wxw-wind").textContent = `${t("wind", "Wind")}: ${last.wind} km/h`;
        contentEl.querySelector("#wxw-updated").textContent = fmt("updated", { time: last.updated }, `Updated ${last.updated}`);

        // daily forecast (max/min + icon)
        const fc = contentEl.querySelector("#wxw-forecast");
        fc.innerHTML = "";

        const daily = last.daily;
        if (!daily?.time?.length) return;

        for (let i = 0; i < Math.min(5, daily.time.length); i++) {
            const date = new Date(daily.time[i]);
            const max = Math.round(daily.temperature_2m_max[i]);
            const min = Math.round(daily.temperature_2m_min[i]);
            const code = daily.weather_code[i];
            const [dsc, ic] = WMO[code] ?? [t("weather_title", "Weather"), "☁"];

            const row = document.createElement("div");
            row.className = "nx-item";
            row.innerHTML = `
        <div class="nx-row">
          <div>
            <div style="font-weight:700;">${date.toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric" })}</div>
            <div class="muted">${dsc}</div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:18px;">${ic}</div>
            <div class="nx-badge">${max}° / ${min}°</div>
          </div>
        </div>
      `;
            fc.appendChild(row);
        }
    };

    // subscribe (and render current)
    const fn = (last) => updateView(last);
    state.listeners.add(fn);
    if (state.last) updateView(state.last);

    // buttons
    contentEl.querySelector("#wxw-refresh").addEventListener("click", () => refreshWeather().catch(() => { }));
    contentEl.querySelector("#wxw-location").addEventListener("click", () => openLocationPicker(wm));
}

export function openLocationPicker(wm) {
    if (focusExistingWindow(wm, "location")) return;

    const contentEl = document.createElement("div");
    contentEl.innerHTML = `
    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; flex-wrap:wrap;">
      <div style="min-width:0; flex:1 1 220px;">
        <div style="font-family:'Ubuntu Sans'; font-weight:800;">${t("location_title", "Location")}</div>
        <div class="muted" id="loc-current" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">—</div>
      </div>
      <button class="nx-btn" id="loc-auto" title="${t("use_auto", "Use auto location")}" style="width:auto; min-width:72px; padding:0 12px;">AUTO</button>
    </div>

    <div class="nx-form">
      <input class="nx-input" id="loc-q" placeholder="${t("search_placeholder", "Search city (e.g. Prague, Brno, Chicago)")}" />
      <button class="nx-btn" id="loc-search">🔎</button>
    </div>

    <div class="muted">${t("pick_result", "Pick a result:")}</div>
    <div id="loc-results" class="nx-list"></div>
  `;

    wm.createWindow({
        id: "location",
        title: t("location_title", "Location"),
        iconText: "⌖",
        x: 280,
        y: 160,
        width: 520,
        height: 520,
        contentEl,
    });

    const currentEl = contentEl.querySelector("#loc-current");
    currentEl.textContent =
        state.pref.mode === "manual"
            ? `${t("manual_prefix", "Manual")}: ${state.pref.name}${state.pref.country ? ", " + state.pref.country : ""}`
            : t("auto_geo", "Auto (geolocation)");

    const qEl = contentEl.querySelector("#loc-q");
    const resultsEl = contentEl.querySelector("#loc-results");
    qEl.focus();

    async function doSearch() {
        const q = qEl.value.trim();
        if (!q) return;
        if (q.length < 2) {
            resultsEl.innerHTML = `<div class="muted">${t("type_min_2", "Type at least 2 characters.")}</div>`;
            return;
        }

        resultsEl.innerHTML = `<div class="muted">${t("searching", "Searching…")}</div>`;
        try {
            const results = await geocodeCity(q);
            resultsEl.innerHTML = "";
            if (!results.length) {
                resultsEl.innerHTML = `<div class="muted">${t("no_results", "No results.")}</div>`;
                return;
            }

            for (const r of results) {
                const name = r.name;
                const country = r.country_code ?? "";
                const admin1 = r.admin1 ?? "";
                const lat = r.latitude;
                const lon = r.longitude;

                const item = document.createElement("div");
                item.className = "nx-item nx-item-action";
                item.innerHTML = `
          <div style="font-weight:700;">${name}${admin1 ? ", " + admin1 : ""}</div>
          <div class="muted">${country} • ${lat.toFixed(2)}, ${lon.toFixed(2)}</div>
        `;
                item.addEventListener("click", async () => {
                    state.pref = { mode: "manual", name, country, lat, lon };
                    savePref(state.pref);
                    currentEl.textContent = `${t("manual_prefix", "Manual")}: ${name}${country ? ", " + country : ""}`;
                    await refreshWeather().catch(() => { });
                    wm.close("location");
                    if (wm.windows?.has("weather")) wm.focus("weather");
                });

                resultsEl.appendChild(item);
            }
        } catch (e) {
            resultsEl.innerHTML = `<div class="muted">${t("search_failed", "Search failed. Check network.")}</div>`;
        }
    }

    contentEl.querySelector("#loc-search").addEventListener("click", doSearch);
    qEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearch();
    });

    contentEl.querySelector("#loc-auto").addEventListener("click", async () => {
        state.pref = { mode: "auto" };
        savePref(state.pref);
        currentEl.textContent = t("auto_geo", "Auto (geolocation)");
        await refreshWeather().catch(() => { });
        wm.close("location");
        if (wm.windows?.has("weather")) wm.focus("weather");
    });
}

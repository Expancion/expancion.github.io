// resources/js/widgets/desktopWidgets.js
import { getLocale, subscribeLocale, tr } from "../os/i18n.js";

const TASKS_KEY = "nexus.widget.tasks.v1";
const POMO_KEY = "nexus.widget.pomodoro.v1";
const CAL_KEY = "nexus.widget.calendar.v1";
const WIDGET_LAYOUT_KEY = "nexus.widget.layout.v1";

const I18N = {
    cz: {
        monitor_title: "System Monitor",
        pomodoro_title: "Pomodoro",
        focus: "Focus",
        break: "Pauza",
        paused: "Pozastaveno",
        running: "Běží",
        start: "Start",
        pause: "Pauza",
        switch: "Přepnout",
        reset: "Reset",
        pomodoro_notify_focus: "Focus blok dokončen.",
        pomodoro_notify_break: "Pauza dokončena.",
        tasks_title: "Úkoly",
        add_task: "Přidat úkol...",
        add: "Přidat",
        no_tasks: "Zatím žádné úkoly.",
        remove: "Odstranit",
        calendar_title: "Kalendář",
        prev_month: "Předchozí měsíc",
        next_month: "Další měsíc",
        agenda: "Agenda",
        add_event: "Přidat událost...",
        no_events: "Žádné události.",
        mon: "Po",
        tue: "Út",
        wed: "St",
        thu: "Čt",
        fri: "Pá",
        sat: "So",
        sun: "Ne",
        widgets_manage: "Widgety",
        widgets_reset: "Reset layoutu",
        widget_weather: "Počasí",
        widget_core: "Nexus Core",
        widget_monitor: "System Monitor",
        widget_pomodoro: "Pomodoro",
        widget_tasks: "Úkoly",
        widgets_lock: "Uzamknout pozice",
    },
    en: {
        monitor_title: "System Monitor",
        pomodoro_title: "Pomodoro",
        focus: "Focus",
        break: "Break",
        paused: "Paused",
        running: "Running",
        start: "Start",
        pause: "Pause",
        switch: "Switch",
        reset: "Reset",
        pomodoro_notify_focus: "Focus block completed.",
        pomodoro_notify_break: "Break completed.",
        tasks_title: "Tasks",
        add_task: "Add task...",
        add: "Add",
        no_tasks: "No tasks yet.",
        remove: "Remove",
        calendar_title: "Calendar",
        prev_month: "Previous month",
        next_month: "Next month",
        agenda: "Agenda",
        add_event: "Add event...",
        no_events: "No events.",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat",
        sun: "Sun",
        widgets_manage: "Widgets",
        widgets_reset: "Reset layout",
        widget_weather: "Weather",
        widget_core: "Nexus Core",
        widget_monitor: "System Monitor",
        widget_pomodoro: "Pomodoro",
        widget_tasks: "Tasks",
        widgets_lock: "Lock positions",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

function dateLocale() {
    return getLocale() === "cz" ? "cs-CZ" : "en-US";
}

export function initDesktopWidgets({ notify } = {}) {
    const panel = document.getElementById("gadget-panel");
    if (!panel) return;

    if (!document.getElementById("gadget-system-monitor")) {
        const el = createSystemMonitorWidget();
        panel.appendChild(el);
    }
    if (!document.getElementById("gadget-pomodoro")) {
        const el = createPomodoroWidget({ notify });
        panel.appendChild(el);
    }
    if (!document.getElementById("gadget-tasks")) {
        const el = createTasksWidget();
        panel.appendChild(el);
    }
    // Calendar widget moved to clock flyout panel in taskbar.
    const legacyCalendar = document.getElementById("gadget-calendar");
    if (legacyCalendar) legacyCalendar.remove();

    initWidgetManager(panel, [
        { id: "gadget-weather", key: "weather", label: () => t("widget_weather", "Weather") },
        { id: "gadget-core", key: "core", label: () => t("widget_core", "Nexus Core") },
        { id: "gadget-system-monitor", key: "monitor", label: () => t("widget_monitor", "System Monitor") },
        { id: "gadget-pomodoro", key: "pomodoro", label: () => t("widget_pomodoro", "Pomodoro") },
        { id: "gadget-tasks", key: "tasks", label: () => t("widget_tasks", "Tasks") },
    ]);
}

function initWidgetManager(panel, defs) {
    if (panel.dataset.widgetManagerReady === "1") return;
    panel.dataset.widgetManagerReady = "1";
    panel.classList.add("is-floating");

    const widgets = defs
        .map((def) => ({ ...def, el: document.getElementById(def.id) }))
        .filter((item) => item.el);
    if (!widgets.length) return;

    const layout = readJSON(WIDGET_LAYOUT_KEY, {});
    const meta = normalizeWidgetMeta(layout._meta);
    const gridSize = 12;
    let widgetsLocked = !!meta.locked;
    let yCursor = 14;
    let stackZ = 1;

    widgets.forEach((widget) => {
        const { el, key } = widget;
        el.classList.add("nx-widget-floating");
        el.dataset.widgetKey = key;
        ensureWidgetChrome(el, () => {
            setWidgetVisible(widget, false, true);
            renderWidgetMenu();
        });

        const width = el.offsetWidth || 320;
        const height = el.offsetHeight || 180;
        const defaultX = Math.max(14, panel.clientWidth - width - 14);
        const defaultY = yCursor;
        yCursor += height + 14;

        const entry = normalizeWidgetEntry(layout[key], { x: defaultX, y: defaultY });
        layout[key] = entry;
        setWidgetPosition(el, panel, entry.x, entry.y, { clampOnly: false, snap: true, grid: gridSize });
        el.style.zIndex = String(++stackZ);
        el.addEventListener("pointerdown", () => {
            el.style.zIndex = String(++stackZ);
        });
        setWidgetVisible(widget, entry.visible !== false, false);
        bindWidgetDrag(panel, el, el.querySelector(".nx-gadget-title"), {
            isLocked: () => widgetsLocked,
            grid: gridSize,
            onDragEnd: () => {
                const pos = { x: pxToNum(el.style.left), y: pxToNum(el.style.top) };
                layout[key] = normalizeWidgetEntry({ ...layout[key], ...pos }, pos);
                saveWidgetLayout(layout);
            },
        });
    });

    const dock = createWidgetDock(panel);
    const toggleBtn = ensureWidgetTaskbarButton();
    const menu = dock.querySelector(".nx-widget-menu");
    const menuList = dock.querySelector(".nx-widget-menu-list");
    const resetBtn = dock.querySelector(".nx-widget-reset");
    let menuOpen = false;

    function setMenuOpen(next) {
        menuOpen = !!next;
        menu.classList.toggle("is-open", menuOpen);
        menu.setAttribute("aria-hidden", menuOpen ? "false" : "true");
        toggleBtn?.setAttribute("aria-expanded", menuOpen ? "true" : "false");
        toggleBtn?.classList.toggle("is-open", menuOpen);
    }

    function setWidgetVisible(widget, visible, persist = true) {
        const { el, key } = widget;
        el.classList.toggle("is-hidden", !visible);
        const entry = normalizeWidgetEntry(layout[key], {
            x: pxToNum(el.style.left),
            y: pxToNum(el.style.top),
        });
        entry.visible = !!visible;
        layout[key] = entry;
        if (persist) saveWidgetLayout(layout);
    }

    function applyLockState(persist = true) {
        panel.classList.toggle("widgets-locked", widgetsLocked);
        layout._meta = { ...normalizeWidgetMeta(layout._meta), locked: widgetsLocked };
        if (persist) saveWidgetLayout(layout);
    }

    function renderWidgetMenu() {
        if (toggleBtn) {
            toggleBtn.textContent = "+";
            toggleBtn.title = t("widgets_manage", "Widgets");
            toggleBtn.setAttribute("aria-label", t("widgets_manage", "Widgets"));
        }
        resetBtn.textContent = t("widgets_reset", "Reset layout");
        menuList.innerHTML = "";

        const lockRow = document.createElement("label");
        lockRow.className = "nx-widget-menu-item";
        const lockBox = document.createElement("input");
        lockBox.type = "checkbox";
        lockBox.checked = widgetsLocked;
        lockBox.addEventListener("change", () => {
            widgetsLocked = lockBox.checked;
            applyLockState(true);
        });
        const lockText = document.createElement("span");
        lockText.textContent = t("widgets_lock", "Lock positions");
        lockRow.appendChild(lockBox);
        lockRow.appendChild(lockText);
        menuList.appendChild(lockRow);

        widgets.forEach((widget) => {
            const row = document.createElement("label");
            row.className = "nx-widget-menu-item";
            const box = document.createElement("input");
            box.type = "checkbox";
            box.checked = !widget.el.classList.contains("is-hidden");
            box.addEventListener("change", () => {
                setWidgetVisible(widget, box.checked, true);
            });

            const name = document.createElement("span");
            name.textContent = widget.label();
            row.appendChild(box);
            row.appendChild(name);
            menuList.appendChild(row);
        });
    }

    function resetLayout() {
        let localCursor = 14;
        widgets.forEach((widget) => {
            const { el, key } = widget;
            const width = el.offsetWidth || 320;
            const height = el.offsetHeight || 180;
            const x = Math.max(14, panel.clientWidth - width - 14);
            const y = localCursor;
            localCursor += height + 14;
            setWidgetPosition(el, panel, x, y, { clampOnly: false, snap: true, grid: gridSize });
            layout[key] = { x, y, visible: true };
            setWidgetVisible(widget, true, false);
        });
        saveWidgetLayout(layout);
        renderWidgetMenu();
    }

    function ensureAnyVisible() {
        const hasVisible = widgets.some((w) => !w.el.classList.contains("is-hidden"));
        if (hasVisible) return;
        resetLayout();
    }

    toggleBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    });
    resetBtn.addEventListener("click", () => {
        resetLayout();
    });

    document.addEventListener("click", (e) => {
        if (!menuOpen) return;
        if (dock.contains(e.target) || toggleBtn?.contains(e.target)) return;
        setMenuOpen(false);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
        widgets.forEach((widget) => {
            const pos = {
                x: pxToNum(widget.el.style.left),
                y: pxToNum(widget.el.style.top),
            };
            const next = setWidgetPosition(widget.el, panel, pos.x, pos.y, { clampOnly: true, snap: true, grid: gridSize });
            layout[widget.key] = normalizeWidgetEntry({ ...layout[widget.key], ...next }, next);
        });
        saveWidgetLayout(layout);
    });

    applyLockState(false);
    ensureAnyVisible();
    renderWidgetMenu();
    subscribeLocale(renderWidgetMenu);
    saveWidgetLayout(layout);
}

function createWidgetDock(panel) {
    const dock = document.createElement("div");
    dock.className = "nx-widget-dock";
    dock.innerHTML = `
      <div class="nx-widget-menu" aria-hidden="true">
        <div class="nx-widget-menu-list"></div>
        <button class="nx-mini-btn nx-widget-reset" type="button"></button>
      </div>
    `;
    document.body.appendChild(dock);
    return dock;
}

function ensureWidgetTaskbarButton() {
    const right = document.getElementById("taskbar-right");
    const taskbar = document.getElementById("taskbar");
    const host = right || taskbar;
    if (!host) return null;

    let btn = document.getElementById("taskbar-widgets");
    if (btn) return btn;

    btn = document.createElement("button");
    btn.id = "taskbar-widgets";
    btn.className = "nx-pill nx-widget-dock-toggle";
    btn.type = "button";
    btn.textContent = "+";
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");

    if (right) host.insertBefore(btn, right.firstChild);
    else host.appendChild(btn);
    return btn;
}

function ensureWidgetChrome(widgetEl, onHide) {
    if (widgetEl.dataset.widgetChromeReady === "1") return;
    widgetEl.dataset.widgetChromeReady = "1";

    const title = widgetEl.querySelector(".nx-gadget-title");
    if (title) {
        title.classList.add("nx-widget-handle");
        if (!title.querySelector(".nx-widget-grip")) {
            const grip = document.createElement("span");
            grip.className = "nx-widget-grip";
            grip.textContent = "⋮⋮";
            grip.setAttribute("aria-hidden", "true");
            title.prepend(grip);
        }
    }

    const controls = document.createElement("div");
    controls.className = "nx-widget-controls";
    controls.innerHTML = `<button class="nx-widget-close" type="button" title="Hide widget">×</button>`;
    controls.querySelector(".nx-widget-close").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onHide === "function") onHide();
    });
    widgetEl.appendChild(controls);
}

function bindWidgetDrag(panel, widgetEl, handleEl, opts = {}) {
    if (!panel || !widgetEl || !handleEl) return;
    if (widgetEl.dataset.widgetDragReady === "1") return;
    widgetEl.dataset.widgetDragReady = "1";
    const { onDragEnd, isLocked, grid = 12 } = opts;

    let drag = null;

    function onPointerMove(e) {
        if (!drag || e.pointerId !== drag.pointerId) return;
        const panelRect = panel.getBoundingClientRect();
        const x = e.clientX - panelRect.left - drag.dx;
        const y = e.clientY - panelRect.top - drag.dy;
        setWidgetPosition(widgetEl, panel, x, y, { clampOnly: true, snap: true, grid });
    }

    function onPointerUp(e) {
        if (!drag) return;
        if (e.pointerId !== drag.pointerId) return;
        drag = null;
        widgetEl.classList.remove("is-dragging");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        if (typeof onDragEnd === "function") onDragEnd();
    }

    handleEl.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        if (e.target.closest("button, input, textarea, select, a")) return;
        if (typeof isLocked === "function" && isLocked()) return;
        const panelRect = panel.getBoundingClientRect();
        const widgetRect = widgetEl.getBoundingClientRect();
        drag = {
            pointerId: e.pointerId,
            dx: e.clientX - widgetRect.left,
            dy: e.clientY - widgetRect.top,
            panelX: panelRect.left,
            panelY: panelRect.top,
        };
        widgetEl.classList.add("is-dragging");
        handleEl.setPointerCapture?.(e.pointerId);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
        e.preventDefault();
    });
}

function setWidgetPosition(widgetEl, panel, x, y, opts = {}) {
    const legacy = typeof opts === "boolean" ? { clampOnly: opts } : (opts || {});
    const clampOnly = legacy.clampOnly !== false;
    const snap = !!legacy.snap;
    const grid = Number.isFinite(legacy.grid) ? legacy.grid : 12;
    const nextX = snap ? snapToGrid(x, grid) : x;
    const nextY = snap ? snapToGrid(y, grid) : y;
    const clamped = clampWidgetPosition(widgetEl, panel, nextX, nextY);
    widgetEl.style.left = `${clamped.x}px`;
    widgetEl.style.top = `${clamped.y}px`;
    if (!clampOnly) widgetEl.style.transform = "none";
    return clamped;
}

function clampWidgetPosition(widgetEl, panel, x, y) {
    const margin = 14;
    const taskbar = document.getElementById("taskbar");
    const taskbarSpace = (taskbar?.offsetHeight || 56) + 26;
    const maxX = Math.max(margin, panel.clientWidth - widgetEl.offsetWidth - margin);
    const maxY = Math.max(margin, panel.clientHeight - widgetEl.offsetHeight - taskbarSpace);
    return {
        x: clampNum(x, margin, maxX),
        y: clampNum(y, margin, maxY),
    };
}

function normalizeWidgetEntry(entry, fallbackPos) {
    const base = entry && typeof entry === "object" ? entry : {};
    return {
        x: Number.isFinite(base.x) ? base.x : (fallbackPos?.x ?? 14),
        y: Number.isFinite(base.y) ? base.y : (fallbackPos?.y ?? 14),
        visible: base.visible !== false,
    };
}

function normalizeWidgetMeta(meta) {
    const base = meta && typeof meta === "object" ? meta : {};
    return {
        locked: !!base.locked,
    };
}

function saveWidgetLayout(layout) {
    writeJSON(WIDGET_LAYOUT_KEY, layout);
}

function clampNum(v, min, max) {
    return Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
}

function snapToGrid(v, grid) {
    const step = Math.max(4, Number.isFinite(grid) ? grid : 12);
    return Math.round((Number.isFinite(v) ? v : 0) / step) * step;
}

function pxToNum(v) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 14;
}

function createSystemMonitorWidget() {
    const root = document.createElement("section");
    root.className = "nx-gadget";
    root.id = "gadget-system-monitor";
    root.innerHTML = `
      <div class="nx-gadget-title">${t("monitor_title", "System Monitor")}</div>
      <div class="nx-monitor-grid">
        <div class="nx-monitor-kpi"><span>CPU</span><b id="mon-cpu">--%</b></div>
        <div class="nx-monitor-kpi"><span>RAM</span><b id="mon-ram">--%</b></div>
        <div class="nx-monitor-kpi"><span>NET</span><b id="mon-net">--%</b></div>
      </div>
      <div class="nx-monitor-bars">
        <div class="nx-monitor-bar"><div id="mon-cpu-fill" class="nx-monitor-fill"></div></div>
        <div class="nx-monitor-bar"><div id="mon-ram-fill" class="nx-monitor-fill"></div></div>
        <div class="nx-monitor-bar"><div id="mon-net-fill" class="nx-monitor-fill"></div></div>
      </div>
      <div class="nx-sparkline" id="mon-spark"></div>
    `;

    const cpuEl = root.querySelector("#mon-cpu");
    const ramEl = root.querySelector("#mon-ram");
    const netEl = root.querySelector("#mon-net");
    const cpuFillEl = root.querySelector("#mon-cpu-fill");
    const ramFillEl = root.querySelector("#mon-ram-fill");
    const netFillEl = root.querySelector("#mon-net-fill");
    const sparkEl = root.querySelector("#mon-spark");

    let cpu = 24;
    let ram = 38;
    let net = 14;
    const history = Array.from({ length: 28 }, () => 0);

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function sample() {
        cpu = clamp(Math.round(cpu * 0.7 + (8 + Math.random() * 72) * 0.3), 4, 98);
        ram = clamp(Math.round(ram * 0.82 + (26 + Math.random() * 44) * 0.18), 18, 94);
        net = clamp(Math.round(net * 0.55 + (Math.random() * 96) * 0.45), 1, 99);

        history.push(cpu);
        if (history.length > 28) history.shift();

        cpuEl.textContent = `${cpu}%`;
        ramEl.textContent = `${ram}%`;
        netEl.textContent = `${net}%`;
        cpuFillEl.style.width = `${cpu}%`;
        ramFillEl.style.width = `${ram}%`;
        netFillEl.style.width = `${net}%`;

        sparkEl.innerHTML = history
            .map((v) => `<span style="height:${Math.max(8, v)}%"></span>`)
            .join("");
    }

    sample();
    const timer = setInterval(sample, 1600);
    attachCleanup(root, () => clearInterval(timer));
    return root;
}

function createPomodoroWidget({ notify } = {}) {
    const root = document.createElement("section");
    root.className = "nx-gadget";
    root.id = "gadget-pomodoro";
    root.innerHTML = `
      <div class="nx-gadget-title">${t("pomodoro_title", "Pomodoro")}</div>
      <div class="nx-pomo-time" id="pomo-time">25:00</div>
      <div class="nx-row">
        <span class="nx-badge" id="pomo-mode">${t("focus", "Focus")}</span>
        <span class="muted" id="pomo-state">${t("paused", "Paused")}</span>
      </div>
      <div class="nx-gadget-actions">
        <button class="nx-gadget-action" id="pomo-toggle">${t("start", "Start")}</button>
        <button class="nx-gadget-action" id="pomo-switch">${t("switch", "Switch")}</button>
        <button class="nx-gadget-action" id="pomo-reset">${t("reset", "Reset")}</button>
      </div>
    `;

    const FOCUS_SEC = 25 * 60;
    const BREAK_SEC = 5 * 60;

    const timeEl = root.querySelector("#pomo-time");
    const modeEl = root.querySelector("#pomo-mode");
    const stateEl = root.querySelector("#pomo-state");
    const toggleEl = root.querySelector("#pomo-toggle");
    const switchEl = root.querySelector("#pomo-switch");
    const resetEl = root.querySelector("#pomo-reset");

    const defaults = () => ({ mode: "focus", running: false, remaining: FOCUS_SEC, lastTs: Date.now() });
    const state = readJSON(POMO_KEY, defaults());

    function maxForMode(mode) {
        return mode === "break" ? BREAK_SEC : FOCUS_SEC;
    }

    function save() {
        writeJSON(POMO_KEY, state);
    }

    function fmt(sec) {
        const s = Math.max(0, sec | 0);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }

    function normalize() {
        const now = Date.now();
        if (!state.running) {
            state.lastTs = now;
            return;
        }
        const elapsed = Math.floor((now - (state.lastTs || now)) / 1000);
        if (elapsed <= 0) return;
        state.lastTs = now;
        state.remaining = Math.max(0, state.remaining - elapsed);
        if (state.remaining === 0) {
            state.running = false;
            if (typeof notify === "function") {
                notify({
                    title: "Pomodoro",
                    message: state.mode === "focus" ? t("pomodoro_notify_focus", "Focus block completed.") : t("pomodoro_notify_break", "Break completed."),
                    type: "info",
                });
            }
        }
    }

    function render() {
        normalize();
        const modeText = state.mode === "focus" ? t("focus", "Focus") : t("break", "Break");
        timeEl.textContent = fmt(state.remaining);
        modeEl.textContent = modeText;
        stateEl.textContent = state.running ? t("running", "Running") : t("paused", "Paused");
        toggleEl.textContent = state.running ? t("pause", "Pause") : t("start", "Start");
        save();
    }

    toggleEl.addEventListener("click", () => {
        state.running = !state.running;
        state.lastTs = Date.now();
        render();
    });

    switchEl.addEventListener("click", () => {
        state.mode = state.mode === "focus" ? "break" : "focus";
        state.running = false;
        state.remaining = maxForMode(state.mode);
        state.lastTs = Date.now();
        render();
    });

    resetEl.addEventListener("click", () => {
        state.running = false;
        state.remaining = maxForMode(state.mode);
        state.lastTs = Date.now();
        render();
    });

    render();
    const timer = setInterval(render, 1000);
    attachCleanup(root, () => clearInterval(timer));
    return root;
}

function createTasksWidget() {
    const root = document.createElement("section");
    root.className = "nx-gadget";
    root.id = "gadget-tasks";
    root.innerHTML = `
      <div class="nx-gadget-title">${t("tasks_title", "Tasks")} <span class="muted" id="task-count">(0)</span></div>
      <form class="nx-task-form" id="task-form">
        <input class="nx-input nx-task-input" id="task-input" placeholder="${t("add_task", "Add task...")}" maxlength="90" />
        <button type="submit" class="nx-gadget-btn" title="${t("add", "Add")}">+</button>
      </form>
      <div class="nx-task-list" id="task-list"></div>
    `;

    const formEl = root.querySelector("#task-form");
    const inputEl = root.querySelector("#task-input");
    const listEl = root.querySelector("#task-list");
    const countEl = root.querySelector("#task-count");

    let tasks = readJSON(TASKS_KEY, []);

    function save() {
        writeJSON(TASKS_KEY, tasks);
    }

    function render() {
        const openCount = tasks.filter((t) => !t.done).length;
        countEl.textContent = `(${openCount})`;

        listEl.innerHTML = "";
        if (!tasks.length) {
            listEl.innerHTML = `<div class="muted">${t("no_tasks", "No tasks yet.")}</div>`;
            return;
        }

        for (const task of tasks.slice(0, 9)) {
            const row = document.createElement("label");
            row.className = `nx-task-item${task.done ? " is-done" : ""}`;
            row.innerHTML = `
              <input type="checkbox" ${task.done ? "checked" : ""} />
              <span>${escapeHtml(task.text)}</span>
              <button type="button" class="nx-task-remove" title="${t("remove", "Remove")}">×</button>
            `;

            const check = row.querySelector("input");
            const remove = row.querySelector(".nx-task-remove");
            check.addEventListener("change", () => {
                task.done = check.checked;
                save();
                render();
            });
            remove.addEventListener("click", (e) => {
                e.preventDefault();
                tasks = tasks.filter((t) => t.id !== task.id);
                save();
                render();
            });

            listEl.appendChild(row);
        }
    }

    formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = (inputEl.value || "").trim();
        if (!text) return;
        tasks.unshift({
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            text,
            done: false,
        });
        tasks = tasks.slice(0, 120);
        inputEl.value = "";
        save();
        render();
    });

    render();
    return root;
}

function createCalendarWidget() {
    const root = document.createElement("section");
    root.className = "nx-gadget";
    root.id = "gadget-calendar";
    root.innerHTML = `
      <div class="nx-gadget-title">${t("calendar_title", "Calendar")}</div>
      <div class="nx-cal-head">
        <button class="nx-gadget-btn" id="cal-prev" title="${t("prev_month", "Previous month")}">‹</button>
        <div class="nx-cal-month" id="cal-month">—</div>
        <button class="nx-gadget-btn" id="cal-next" title="${t("next_month", "Next month")}">›</button>
      </div>
      <div class="nx-cal-grid" id="cal-grid"></div>
      <div class="nx-cal-agenda">
        <div class="nx-row">
          <span class="muted">${t("agenda", "Agenda")}</span>
          <span class="nx-badge" id="cal-selected">—</span>
        </div>
        <div id="cal-events" class="nx-task-list"></div>
        <form id="cal-add-form" class="nx-task-form">
          <input id="cal-add-input" class="nx-input nx-task-input" placeholder="${t("add_event", "Add event...")}" maxlength="72" />
          <button class="nx-gadget-btn" type="submit" title="${t("add", "Add")}">+</button>
        </form>
      </div>
    `;

    const monthEl = root.querySelector("#cal-month");
    const gridEl = root.querySelector("#cal-grid");
    const selectedEl = root.querySelector("#cal-selected");
    const eventsEl = root.querySelector("#cal-events");
    const prevEl = root.querySelector("#cal-prev");
    const nextEl = root.querySelector("#cal-next");
    const addFormEl = root.querySelector("#cal-add-form");
    const addInputEl = root.querySelector("#cal-add-input");

    const today = new Date();
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = isoDate(today);
    const eventsMap = readJSON(CAL_KEY, {});

    function save() {
        writeJSON(CAL_KEY, eventsMap);
    }

    function setSelected(dateIso) {
        selected = dateIso;
        selectedEl.textContent = dateIso;
        renderEvents();
        renderGrid();
    }

    function renderEvents() {
        const list = Array.isArray(eventsMap[selected]) ? eventsMap[selected] : [];
        eventsEl.innerHTML = "";
        if (!list.length) {
            eventsEl.innerHTML = `<div class="muted">${t("no_events", "No events.")}</div>`;
            return;
        }
        list.forEach((ev, idx) => {
            const row = document.createElement("div");
            row.className = "nx-cal-event";
            row.innerHTML = `
              <span>${escapeHtml(ev)}</span>
              <button type="button" class="nx-task-remove" title="${t("remove", "Remove")}">×</button>
            `;
            row.querySelector(".nx-task-remove").addEventListener("click", () => {
                eventsMap[selected].splice(idx, 1);
                if (!eventsMap[selected].length) delete eventsMap[selected];
                save();
                renderEvents();
                renderGrid();
            });
            eventsEl.appendChild(row);
        });
    }

    function renderGrid() {
        const year = cursor.getFullYear();
        const month = cursor.getMonth();
        const first = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0).getDate();
        const start = mondayIndex(first.getDay());
        const monthName = cursor.toLocaleDateString(dateLocale(), { month: "long", year: "numeric" });
        monthEl.textContent = monthName;

        const dayNames = [t("mon", "Mon"), t("tue", "Tue"), t("wed", "Wed"), t("thu", "Thu"), t("fri", "Fri"), t("sat", "Sat"), t("sun", "Sun")];
        gridEl.innerHTML = dayNames.map((d) => `<div class="nx-cal-dow">${d}</div>`).join("");

        for (let i = 0; i < start; i++) {
            const pad = document.createElement("div");
            pad.className = "nx-cal-day is-empty";
            gridEl.appendChild(pad);
        }

        const todayIso = isoDate(new Date());
        for (let d = 1; d <= lastDay; d++) {
            const date = new Date(year, month, d);
            const iso = isoDate(date);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "nx-cal-day";
            if (iso === selected) btn.classList.add("is-selected");
            if (iso === todayIso) btn.classList.add("is-today");
            if (Array.isArray(eventsMap[iso]) && eventsMap[iso].length) btn.classList.add("has-events");
            btn.textContent = String(d);
            btn.addEventListener("click", () => setSelected(iso));
            gridEl.appendChild(btn);
        }
    }

    prevEl.addEventListener("click", () => {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
        renderGrid();
    });

    nextEl.addEventListener("click", () => {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        renderGrid();
    });

    addFormEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = (addInputEl.value || "").trim();
        if (!text) return;
        if (!Array.isArray(eventsMap[selected])) eventsMap[selected] = [];
        eventsMap[selected].push(text);
        addInputEl.value = "";
        save();
        renderEvents();
        renderGrid();
    });

    setSelected(selected);
    renderGrid();
    return root;
}

function attachCleanup(root, cleanupFn) {
    const obs = new MutationObserver(() => {
        if (!root.isConnected) {
            cleanupFn();
            obs.disconnect();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });
}

function mondayIndex(jsDay) {
    return (jsDay + 6) % 7;
}

function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // no-op
    }
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

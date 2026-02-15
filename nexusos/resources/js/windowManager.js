// resources/js/windowManager.js
export class WindowManager {
    constructor({ desktopEl, taskbarEl, onChange } = {}) {
        this.desktopEl = desktopEl;
        this.taskbarEl = taskbarEl;
        this.onChange = typeof onChange === "function" ? onChange : () => { };

        this.z = 120;
        this.activeId = null;
        this.windows = new Map(); // id -> { el, taskBtn, state }

        this._onGlobalKeyDown = this._onGlobalKeyDown.bind(this);
        window.addEventListener("keydown", this._onGlobalKeyDown);
    }

    createWindow({
        id,
        title,
        iconText = "■",
        width = 520,
        height = 360,
        x = 80,
        y = 80,
        contentEl,
        minimized = false,
        maximized = false,
        snap = null,
    }) {
        if (this.windows.has(id)) {
            const existing = this.windows.get(id);
            if (existing?.state?.minimized) this.restore(id);
            this.focus(id);
            return existing.el;
        }

        const win = document.createElement("div");
        win.className = "nx-window";
        win.dataset.winId = id;
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
        win.style.transform = `translate(${x}px, ${y}px)`;
        win.style.zIndex = String(++this.z);

        const titlebar = document.createElement("div");
        titlebar.className = "nx-titlebar";
        titlebar.innerHTML = `
      <div class="nx-title-left">
        <span class="nx-icon">${iconText}</span>
        <span class="nx-title">${title}</span>
      </div>
      <div class="nx-title-actions">
        <button class="nx-btn" data-act="min">_</button>
        <button class="nx-btn" data-act="max">▢</button>
        <button class="nx-btn nx-btn-danger" data-act="close">×</button>
      </div>
    `;

        const body = document.createElement("div");
        body.className = "nx-body";
        body.appendChild(contentEl);

        const resizer = document.createElement("div");
        resizer.className = "nx-resize";

        win.appendChild(titlebar);
        win.appendChild(body);
        win.appendChild(resizer);

        const taskBtn = document.createElement("button");
        taskBtn.className = "nx-taskbtn";
        taskBtn.textContent = title;
        taskBtn.addEventListener("click", () => {
            const state = this.windows.get(id)?.state;
            if (!state) return;
            if (state.minimized) this.restore(id);
            this.focus(id);
        });

        this.taskbarEl.appendChild(taskBtn);
        this.desktopEl.appendChild(win);

        this.windows.set(id, {
            el: win,
            taskBtn,
            state: {
                id,
                title,
                iconText,
                minimized: false,
                maximized: false,
                snap: null,
                x,
                y,
                width,
                height,
                restoreRect: { x, y, width, height },
            },
        });

        win.addEventListener("mousedown", () => this.focus(id));

        titlebar.querySelectorAll("button[data-act]").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const act = btn.dataset.act;
                if (act === "close") this.close(id);
                if (act === "min") this.minimize(id);
                if (act === "max") this.toggleMaximize(id);
            });
        });

        this._enableDrag(id, win, titlebar);
        this._enableResize(id, win, resizer);

        if (maximized) this._applyMaximize(id);
        if (snap) this._applySnap(id, snap);
        if (minimized) this.minimize(id);

        this.focus(id);
        this._emitChange();
        return win;
    }

    listWindows() {
        return Array.from(this.windows.entries()).map(([id, { state }]) => ({
            id,
            title: state.title,
            minimized: state.minimized,
            maximized: state.maximized,
            snap: state.snap,
            x: state.x,
            y: state.y,
            width: state.width,
            height: state.height,
        }));
    }

    getSnapshot() {
        return this.listWindows();
    }

    focus(id) {
        const w = this.windows.get(id);
        if (!w) return;
        this.activeId = id;
        w.el.style.zIndex = String(++this.z);

        this.windows.forEach(({ el, taskBtn }, wid) => {
            const active = wid === id;
            el.classList.toggle("is-active", active);
            taskBtn.classList.toggle("is-active", active);
        });

        this._emitChange();
    }

    minimize(id) {
        const w = this.windows.get(id);
        if (!w) return;
        w.state.minimized = true;
        w.el.classList.add("is-minimized");
        this._emitChange();
    }

    restore(id) {
        const w = this.windows.get(id);
        if (!w) return;
        w.state.minimized = false;
        w.el.classList.remove("is-minimized");
        this._emitChange();
    }

    toggleMaximize(id) {
        const w = this.windows.get(id);
        if (!w) return;

        if (!w.state.maximized) {
            this._applyMaximize(id);
        } else {
            this._restoreRect(id);
        }
        this.focus(id);
        this._emitChange();
    }

    snap(id, mode) {
        this._applySnap(id, mode);
        this.focus(id);
        this._emitChange();
    }

    close(id) {
        const w = this.windows.get(id);
        if (!w) return;
        w.el.remove();
        w.taskBtn.remove();
        this.windows.delete(id);

        if (this.activeId === id) {
            this.activeId = null;
            const last = Array.from(this.windows.keys()).at(-1);
            if (last) this.focus(last);
        }

        this._emitChange();
    }

    closeAll() {
        for (const id of Array.from(this.windows.keys())) this.close(id);
    }

    _emitChange() {
        try {
            this.onChange(this.getSnapshot());
        } catch {
            // no-op
        }
    }

    _enableDrag(id, win, handleEl) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let winX = 0;
        let winY = 0;
        let lastPt = null;

        const onDown = (e) => {
            const w = this.windows.get(id);
            if (!w || w.state.maximized) return;

            dragging = true;
            this.focus(id);

            const pt = this._pt(e);
            startX = pt.x;
            startY = pt.y;
            lastPt = pt;

            const t = this._getTranslate(win);
            winX = t.x;
            winY = t.y;

            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
            window.addEventListener("touchmove", onMove, { passive: false });
            window.addEventListener("touchend", onUp);
        };

        const onMove = (e) => {
            if (!dragging) return;
            e.preventDefault();

            const pt = this._pt(e);
            lastPt = pt;
            const dx = pt.x - startX;
            const dy = pt.y - startY;

            const bounds = this.desktopEl.getBoundingClientRect();
            const rect = win.getBoundingClientRect();
            let nx = winX + dx;
            let ny = winY + dy;

            nx = Math.max(-rect.width + 120, Math.min(nx, bounds.width - 120));
            ny = Math.max(0, Math.min(ny, bounds.height - 40));

            win.style.transform = `translate(${nx}px, ${ny}px)`;

            const w = this.windows.get(id);
            if (w) {
                w.state.x = nx;
                w.state.y = ny;
                w.state.snap = null;
                w.state.maximized = false;
                w.el.classList.remove("is-maximized");
            }
        };

        const onUp = () => {
            dragging = false;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onUp);

            if (lastPt) this._snapByEdges(id, lastPt);
            this._syncRectState(id);
            this._emitChange();
        };

        handleEl.addEventListener("mousedown", onDown);
        handleEl.addEventListener("touchstart", onDown, { passive: false });
    }

    _enableResize(id, win, resizer) {
        let resizing = false;
        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;

        const onDown = (e) => {
            const w = this.windows.get(id);
            if (!w || w.state.maximized) return;

            resizing = true;
            this.focus(id);

            const pt = this._pt(e);
            startX = pt.x;
            startY = pt.y;

            const rect = win.getBoundingClientRect();
            startW = rect.width;
            startH = rect.height;

            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
            window.addEventListener("touchmove", onMove, { passive: false });
            window.addEventListener("touchend", onUp);
        };

        const onMove = (e) => {
            if (!resizing) return;
            e.preventDefault();

            const pt = this._pt(e);
            const dw = pt.x - startX;
            const dh = pt.y - startY;

            const minW = 320;
            const minH = 220;
            const maxW = this.desktopEl.clientWidth - 20;
            const maxH = this.desktopEl.clientHeight - 60;

            const nw = Math.max(minW, Math.min(startW + dw, maxW));
            const nh = Math.max(minH, Math.min(startH + dh, maxH));

            win.style.width = `${nw}px`;
            win.style.height = `${nh}px`;

            const w = this.windows.get(id);
            if (w) {
                w.state.width = nw;
                w.state.height = nh;
                w.state.snap = null;
                w.state.maximized = false;
                w.el.classList.remove("is-maximized");
            }
        };

        const onUp = () => {
            resizing = false;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onUp);
            this._syncRectState(id);
            this._emitChange();
        };

        resizer.addEventListener("mousedown", onDown);
        resizer.addEventListener("touchstart", onDown, { passive: false });
    }

    _syncRectState(id) {
        const w = this.windows.get(id);
        if (!w) return;
        const t = this._getTranslate(w.el);
        const rect = w.el.getBoundingClientRect();
        w.state.x = t.x;
        w.state.y = t.y;
        w.state.width = rect.width;
        w.state.height = rect.height;

        if (!w.state.maximized && !w.state.snap) {
            w.state.restoreRect = {
                x: w.state.x,
                y: w.state.y,
                width: w.state.width,
                height: w.state.height,
            };
        }
    }

    _snapByEdges(id, pt) {
        const bounds = this.desktopEl.getBoundingClientRect();
        const margin = 22;

        const nearLeft = pt.x - bounds.left < margin;
        const nearRight = bounds.right - pt.x < margin;
        const nearTop = pt.y - bounds.top < margin;

        if (nearTop && nearLeft) return this._applySnap(id, "left-top");
        if (nearTop && nearRight) return this._applySnap(id, "right-top");
        if (nearTop) return this._applyMaximize(id);
        if (nearLeft) return this._applySnap(id, "left");
        if (nearRight) return this._applySnap(id, "right");
    }

    _getSnapRect(mode) {
        const margin = 14;
        const usableW = this.desktopEl.clientWidth - margin * 2;
        const usableH = this.desktopEl.clientHeight - 98; // taskbar safe area
        const halfW = Math.round(usableW / 2);
        const halfH = Math.round(usableH / 2);

        if (mode === "left") return { x: margin, y: margin, width: halfW, height: usableH };
        if (mode === "right") return { x: margin + halfW, y: margin, width: usableW - halfW, height: usableH };
        if (mode === "top") return { x: margin, y: margin, width: usableW, height: halfH };
        if (mode === "bottom") return { x: margin, y: margin + halfH, width: usableW, height: usableH - halfH };
        if (mode === "left-top") return { x: margin, y: margin, width: halfW, height: halfH };
        if (mode === "left-bottom") return { x: margin, y: margin + halfH, width: halfW, height: usableH - halfH };
        if (mode === "right-top") return { x: margin + halfW, y: margin, width: usableW - halfW, height: halfH };
        if (mode === "right-bottom") return { x: margin + halfW, y: margin + halfH, width: usableW - halfW, height: usableH - halfH };
        return null;
    }

    _applySnap(id, mode) {
        const w = this.windows.get(id);
        if (!w) return;
        const rect = this._getSnapRect(mode);
        if (!rect) return;

        this._captureRestoreRect(id);
        w.state.maximized = false;
        w.state.snap = mode;
        w.el.classList.remove("is-maximized");

        w.el.style.width = `${rect.width}px`;
        w.el.style.height = `${rect.height}px`;
        w.el.style.transform = `translate(${rect.x}px, ${rect.y}px)`;

        this._syncRectState(id);
    }

    _applyMaximize(id) {
        const w = this.windows.get(id);
        if (!w) return;

        this._captureRestoreRect(id);
        w.state.maximized = true;
        w.state.snap = null;
        w.el.classList.add("is-maximized");
        w.el.style.transform = "translate(0px, 0px)";

        this._syncRectState(id);
    }

    _captureRestoreRect(id) {
        const w = this.windows.get(id);
        if (!w) return;
        if (!w.state.maximized && !w.state.snap) {
            this._syncRectState(id);
            w.state.restoreRect = {
                x: w.state.x,
                y: w.state.y,
                width: w.state.width,
                height: w.state.height,
            };
        }
    }

    _restoreRect(id) {
        const w = this.windows.get(id);
        if (!w) return;
        const rr = w.state.restoreRect || { x: 80, y: 80, width: 520, height: 360 };

        w.state.maximized = false;
        w.state.snap = null;
        w.el.classList.remove("is-maximized");
        w.el.style.width = `${rr.width}px`;
        w.el.style.height = `${rr.height}px`;
        w.el.style.transform = `translate(${rr.x}px, ${rr.y}px)`;

        this._syncRectState(id);
    }

    _onGlobalKeyDown(e) {
        if (!e.altKey) return;
        if (!this.activeId || !this.windows.has(this.activeId)) return;

        const id = this.activeId;

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (e.shiftKey) {
                const s = this.windows.get(id)?.state?.snap;
                this.snap(id, s === "left-top" ? "left-bottom" : "left-top");
            } else {
                this.snap(id, "left");
            }
            return;
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (e.shiftKey) {
                const s = this.windows.get(id)?.state?.snap;
                this.snap(id, s === "right-top" ? "right-bottom" : "right-top");
            } else {
                this.snap(id, "right");
            }
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (e.shiftKey) this.snap(id, "top");
            else this._applyMaximize(id);
            this.focus(id);
            this._emitChange();
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (e.shiftKey) this.snap(id, "bottom");
            else this._restoreRect(id);
            this.focus(id);
            this._emitChange();
        }
    }

    _pt(e) {
        if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    _getTranslate(el) {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return { x: m.m41 || 0, y: m.m42 || 0 };
    }
}

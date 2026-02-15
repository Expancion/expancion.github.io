// resources/js/apps/pipelines.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        selected_desc: "interaktivní kitchen-ci pipeline simulátor",
        desc_svickova_main: "Hlavní produkční flow pro svíčkovou.",
        desc_svickova_qa: "QA gate s přísnější kontrolou textury a chuti.",
        desc_dumplings_build: "Build a test kompatibility příloh.",
        desc_menu_release: "Agregace finálního menu a release notes.",
        run: "Běh",
        status: "Status",
        run_pipeline: "Spustit pipeline",
        cancel: "Zrušit",
        reset: "Reset",
        speed: "Rychlost",
        speed_cycle: "Přepnout rychlost",
        select_and_run: "Vyber pipeline a klikni Spustit.",
        percent: "{n}%",
        status_idle: "idle",
        status_running: "running",
        status_passed: "passed",
        status_success: "success",
        status_failed: "failed",
        status_canceled: "canceled",
        speed_normal: "Normální",
        speed_fast: "Rychlá",
        speed_turbo: "Turbo",
        completed: "Pipeline {id} dokončena.",
        finish_ok: "{id} dokončena úspěšně.",
        failed_on: "Pipeline selhala na {stage}.",
        failed_detail: "{stage} failed: texture check threshold exceeded.",
        running_stage: "Běží {stage}...",
        selected_ready: "Vybráno {id}. Klikni Spustit pipeline.",
        reset_ready: "Připraveno.",
        canceled: "Pipeline zrušena.",
        denied_switch: "Zruš běžící pipeline před přepnutím.",
        bottom_fail_inject: "Fail injection připravena pro další QA/Test stage.",
        log_cancel_by_op: "Pipeline zrušena operátorem.",
        log_switch_denied: "Přepnutí zamítnuto během běhu pipeline.",
        log_repo_loaded: "Repozitář načten: {repo}",
        log_selected: "Pipeline vybrána: {id}",
        log_reset: "Pipeline {id} resetována.",
        log_browser_ready: "Prohlížeč repozitáře připraven.",
        log_pipeline_selected: "Vybraná pipeline: {id} ({repo})",
        log_triggered: "Pipeline spuštěna manuálně (běh {run}).",
        log_stage_start: "Start stage: {stage}",
        log_stage_done: "Dokončena stage: {stage}",
        log_injected: "Vynucen fail pro další quality stage.",
        log_speed_mode: "Režim rychlosti přepnut na {mode}.",
        bottom_speed: "Rychlost: {mode}.",
    },
    en: {
        selected_desc: "interactive kitchen-ci pipeline simulator",
        desc_svickova_main: "Main production flow for svickova dish.",
        desc_svickova_qa: "Quality gate with stricter texture and taste checks.",
        desc_dumplings_build: "Build and test side dish compatibility.",
        desc_menu_release: "Aggregate final menu and publish release notes.",
        run: "Run",
        status: "Status",
        run_pipeline: "Run pipeline",
        cancel: "Cancel",
        reset: "Reset",
        speed: "Speed",
        speed_cycle: "Cycle speed",
        select_and_run: "Select a pipeline and click Run.",
        percent: "{n}%",
        status_idle: "idle",
        status_running: "running",
        status_passed: "passed",
        status_success: "success",
        status_failed: "failed",
        status_canceled: "canceled",
        speed_normal: "Normal",
        speed_fast: "Fast",
        speed_turbo: "Turbo",
        completed: "Pipeline {id} completed.",
        finish_ok: "{id} finished successfully.",
        failed_on: "Pipeline failed on {stage}.",
        failed_detail: "{stage} failed: texture check threshold exceeded.",
        running_stage: "Running {stage}...",
        selected_ready: "Selected {id}. Click Run pipeline.",
        reset_ready: "Ready.",
        canceled: "Pipeline canceled.",
        denied_switch: "Cancel running pipeline before switching.",
        bottom_fail_inject: "Failure injection armed for next QA/Test stage.",
        log_cancel_by_op: "Pipeline canceled by operator.",
        log_switch_denied: "Switch denied while pipeline is running.",
        log_repo_loaded: "Repository loaded: {repo}",
        log_selected: "Pipeline selected: {id}",
        log_reset: "Pipeline {id} reset.",
        log_browser_ready: "Repository browser ready.",
        log_pipeline_selected: "Pipeline selected: {id} ({repo})",
        log_triggered: "Pipeline triggered manually (run {run}).",
        log_stage_start: "Stage start: {stage}",
        log_stage_done: "Stage done: {stage}",
        log_injected: "Injected failure for next quality stage.",
        log_speed_mode: "Speed mode set to {mode}.",
        bottom_speed: "Speed: {mode}.",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

function fmt(key, vars = {}, fallback = "") {
    let msg = t(key, fallback);
    for (const [k, v] of Object.entries(vars)) {
        msg = msg.replace(`{${k}}`, String(v));
    }
    return msg;
}

export function openPipelines() {
    const root = document.createElement("div");
    root.className = "nx-pipelines";

    root.innerHTML = `
    <div class="nx-game-top">
      <div>
        <b id="pl-selected">SVICKOVA_MAIN</b>
        <span class="muted" id="pl-selected-desc">${t("selected_desc", "interactive kitchen-ci pipeline simulator")}</span>
      </div>
      <div class="nx-game-stats">
        <span class="nx-badge" id="pl-repo">kitchen/svickova @ recipe/main</span>
        <span class="nx-badge">${t("run", "Run")}: <b id="pl-run">#0000</b></span>
        <span class="nx-badge">${t("status", "Status")}: <b id="pl-status">${t("status_idle", "idle")}</b></span>
      </div>
    </div>

    <div class="nx-pipe-repo">
      <div class="nx-pipe-list" id="pl-list"></div>

      <div class="nx-pipe-main">
        <div class="nx-pipe-toolbar">
          <button class="nx-mini-btn" id="pl-run-btn">${t("run_pipeline", "Run pipeline")}</button>
          <button class="nx-mini-btn" id="pl-cancel-btn">${t("cancel", "Cancel")}</button>
          <button class="nx-mini-btn" id="pl-reset-btn">${t("reset", "Reset")}</button>
          <button class="nx-mini-btn" id="pl-speed-btn" title="${t("speed_cycle", "Cycle speed")}">${t("speed", "Speed")}: ${t("speed_normal", "Normal")}</button>
        </div>

        <div class="nx-pipe-progress">
          <div class="nx-pipe-progress-track">
            <div class="nx-pipe-progress-fill" id="pl-progress"></div>
          </div>
          <span class="muted" id="pl-progress-label">0%</span>
        </div>

        <div class="nx-pipe-grid">
          <div class="nx-pipe-stages" id="pl-stages"></div>
          <div class="nx-pipe-logs" id="pl-logs" aria-live="polite"></div>
        </div>
      </div>
    </div>

    <div class="nx-game-bottom muted" id="pl-bottom">${t("select_and_run", "Select a pipeline and click Run.")}</div>
  `;

    const elSelected = root.querySelector("#pl-selected");
    const elSelectedDesc = root.querySelector("#pl-selected-desc");
    const elRepo = root.querySelector("#pl-repo");
    const elRunId = root.querySelector("#pl-run");
    const elStatus = root.querySelector("#pl-status");
    const elList = root.querySelector("#pl-list");
    const elRunBtn = root.querySelector("#pl-run-btn");
    const elCancelBtn = root.querySelector("#pl-cancel-btn");
    const elResetBtn = root.querySelector("#pl-reset-btn");
    const elSpeedBtn = root.querySelector("#pl-speed-btn");
    const elProgress = root.querySelector("#pl-progress");
    const elProgressLabel = root.querySelector("#pl-progress-label");
    const elStages = root.querySelector("#pl-stages");
    const elLogs = root.querySelector("#pl-logs");
    const elBottom = root.querySelector("#pl-bottom");

    const PIPELINES = [
        {
            id: "SVICKOVA_MAIN",
            repo: "kitchen/svickova",
            branch: "recipe/main",
            desc: "Main production flow for svickova dish.",
            stages: [
                { id: "source.checkout_ingredients", label: "Source: checkout ingredients", ms: 900 },
                { id: "prep.mise_en_place", label: "Prep: mise en place", ms: 1200 },
                { id: "build.sear_beef", label: "Build: sear beef", ms: 1350 },
                { id: "test.slow_cook_vegetables", label: "Test: slow cook vegetables", ms: 1650 },
                { id: "package.blend_cream_sauce", label: "Package: blend cream sauce", ms: 1200 },
                { id: "deploy.plate_and_serve", label: "Deploy: plate and serve", ms: 1000 },
            ],
        },
        {
            id: "SVICKOVA_QA",
            repo: "kitchen/svickova",
            branch: "recipe/qa",
            desc: "Quality gate with stricter texture and taste checks.",
            stages: [
                { id: "source.sync_reference_recipe", label: "Source: sync reference recipe", ms: 840 },
                { id: "prep.calibrate_ingredients", label: "Prep: calibrate ingredients", ms: 1040 },
                { id: "build.prepare_sample_batch", label: "Build: prepare sample batch", ms: 1300 },
                { id: "qa.texture_validation", label: "QA: texture validation", ms: 1700 },
                { id: "qa.taste_validation", label: "QA: taste validation", ms: 1500 },
                { id: "publish.qa_report", label: "Publish: qa report", ms: 900 },
            ],
        },
        {
            id: "DUMPLINGS_BUILD",
            repo: "kitchen/side-dishes",
            branch: "feature/knedlik-ci",
            desc: "Build and test side dish compatibility.",
            stages: [
                { id: "source.checkout_dough_specs", label: "Source: checkout dough specs", ms: 880 },
                { id: "prep.mix_dough", label: "Prep: mix dough", ms: 1180 },
                { id: "build.steam_batch", label: "Build: steam batch", ms: 1320 },
                { id: "test.slice_consistency", label: "Test: slice consistency", ms: 1420 },
                { id: "package.portioning", label: "Package: portioning", ms: 960 },
            ],
        },
        {
            id: "MENU_RELEASE",
            repo: "kitchen/menu",
            branch: "release/weekend",
            desc: "Aggregate final menu and publish release notes.",
            stages: [
                { id: "source.collect_dish_artifacts", label: "Source: collect dish artifacts", ms: 700 },
                { id: "build.compose_menu_bundle", label: "Build: compose menu bundle", ms: 1100 },
                { id: "qa.review_allergens", label: "QA: review allergens", ms: 1400 },
                { id: "publish.release_menu", label: "Publish: release menu", ms: 1000 },
            ],
        },
    ];

    const statusText = {
        queued: t("status_idle", "idle"),
        running: t("status_running", "running"),
        passed: t("status_passed", "passed"),
        failed: t("status_failed", "failed"),
        canceled: t("status_canceled", "canceled"),
    };
    const SPEEDS = [
        { label: t("speed_normal", "Normal"), mult: 1 },
        { label: t("speed_fast", "Fast"), mult: 0.7 },
        { label: t("speed_turbo", "Turbo"), mult: 0.45 },
    ];

    const runCounter = new Map(PIPELINES.map((p) => [p.id, 0]));
    let selected = PIPELINES[0];
    let speedIndex = 0;
    let pipelineStatus = "idle";
    let stageIndex = -1;
    let timer = null;
    let activeStage = null;
    let forceFailNext = false;
    const stageStates = new Map();

    function getStages() {
        return selected?.stages || [];
    }

    function ts() {
        const d = new Date();
        return d.toLocaleTimeString([], { hour12: false });
    }

    function appendLog(level, msg) {
        const row = document.createElement("div");
        row.className = "nx-pipe-log-row";
        row.innerHTML = `<span class="nx-pipe-log-time">${ts()}</span><span class="nx-pipe-log-lvl">${level}</span><span>${escapeHtml(msg)}</span>`;
        elLogs.appendChild(row);
        elLogs.scrollTop = elLogs.scrollHeight;
    }

    function setBottom(msg) {
        elBottom.textContent = msg;
    }

    function setStatus(next) {
        pipelineStatus = next;
        const display = {
            idle: t("status_idle", "idle"),
            running: t("status_running", "running"),
            success: t("status_success", "success"),
            failed: t("status_failed", "failed"),
            canceled: t("status_canceled", "canceled"),
            passed: t("status_passed", "passed"),
        };
        elStatus.textContent = display[next] || next;
        elStatus.className = `nx-pipe-status is-${next}`;
    }

    function renderSelectedInfo() {
        if (!selected) return;
        elSelected.textContent = selected.id;
        const descKey = `desc_${selected.id.toLowerCase()}`;
        elSelectedDesc.textContent = t(descKey, selected.desc || t("selected_desc", "interactive kitchen-ci pipeline simulator"));
        elRepo.textContent = `${selected.repo} @ ${selected.branch}`;
        const runId = runCounter.get(selected.id) || 0;
        elRunId.textContent = `#${String(runId).padStart(4, "0")}`;
    }

    function clearTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function currentSpeed() {
        return SPEEDS[speedIndex] || SPEEDS[0];
    }

    function renderSpeedButton() {
        const cur = currentSpeed();
        elSpeedBtn.textContent = `${t("speed", "Speed")}: ${cur.label}`;
    }

    function queueStages() {
        stageStates.clear();
        getStages().forEach((s) => stageStates.set(s.id, "queued"));
    }

    function computePercent() {
        const stages = getStages();
        if (!stages.length) return 0;
        const passed = stages.reduce((n, s) => n + (stageStates.get(s.id) === "passed" ? 1 : 0), 0);
        const running = stageIndex >= 0 && stageIndex < stages.length && stageStates.get(stages[stageIndex].id) === "running" ? 0.5 : 0;
        return Math.round(((passed + running) / stages.length) * 100);
    }

    function renderProgress() {
        const pct = computePercent();
        elProgress.style.width = `${pct}%`;
        elProgressLabel.textContent = fmt("percent", { n: pct }, `${pct}%`);
    }

    function badgeClass(state) {
        if (state === "passed") return "ok";
        if (state === "failed" || state === "canceled") return "bad";
        if (state === "running") return "warn";
        return "";
    }

    function renderStages() {
        elStages.innerHTML = "";
        getStages().forEach((stage, idx) => {
            const state = stageStates.get(stage.id) || "queued";
            const row = document.createElement("div");
            row.className = "nx-pipe-stage";
            row.innerHTML = `
        <div class="nx-row">
          <span><b>${idx + 1}.</b> ${escapeHtml(stage.id)}</span>
          <span class="nx-badge ${badgeClass(state)}">${statusText[state]}</span>
        </div>
        <div class="muted">${escapeHtml(stage.label)}</div>
      `;
            elStages.appendChild(row);
        });
        renderProgress();
    }

    function renderList() {
        elList.innerHTML = "";
        PIPELINES.forEach((pipe) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `nx-pipe-item${pipe.id === selected.id ? " is-active" : ""}`;
            btn.disabled = pipelineStatus === "running";
            btn.innerHTML = `
        <div class="nx-pipe-item-title">${escapeHtml(pipe.id)}</div>
        <div class="nx-pipe-item-meta muted">${escapeHtml(pipe.repo)}</div>
        <div class="nx-pipe-item-meta muted">${escapeHtml(pipe.branch)}</div>
      `;
            btn.addEventListener("click", () => selectPipeline(pipe.id));
            elList.appendChild(btn);
        });
    }

    function setControls() {
        const running = pipelineStatus === "running";
        elRunBtn.disabled = running;
        elCancelBtn.disabled = !running;
        elResetBtn.disabled = running;
        elSpeedBtn.disabled = false;
        renderList();
    }

    function stageWillFail(stage) {
        const isGate = /test|qa|quality/i.test(stage.id);
        if (forceFailNext && isGate) {
            forceFailNext = false;
            return true;
        }
        if (!isGate) return false;
        return Math.random() < 0.12;
    }

    function finishSuccess() {
        clearTimer();
        setStatus("success");
        stageIndex = getStages().length;
        renderStages();
        setControls();
        setBottom(fmt("completed", { id: selected.id }, `Pipeline ${selected.id} completed.`));
        appendLog("OK", fmt("finish_ok", { id: selected.id }, `${selected.id} finished successfully.`));
    }

    function finishFail(stage) {
        clearTimer();
        setStatus("failed");
        stageStates.set(stage.id, "failed");
        renderStages();
        setControls();
        setBottom(fmt("failed_on", { stage: stage.id }, `Pipeline failed on ${stage.id}.`));
        appendLog("FAIL", fmt("failed_detail", { stage: stage.id }, `${stage.id} failed: texture check threshold exceeded.`));
    }

    function runStage(idx) {
        if (!root.isConnected) return;
        if (pipelineStatus !== "running") return;
        const stages = getStages();
        if (idx >= stages.length) {
            finishSuccess();
            return;
        }

        const stage = stages[idx];
        activeStage = stage.id;
        stageIndex = idx;
        stageStates.set(stage.id, "running");
        renderStages();

        appendLog("INFO", fmt("log_stage_start", { stage: stage.id }, `Stage start: ${stage.id}`));
        setBottom(fmt("running_stage", { stage: stage.id }, `Running ${stage.id}...`));

        const delay = Math.max(150, Math.floor(stage.ms * currentSpeed().mult));

        timer = setTimeout(() => {
            if (!root.isConnected || pipelineStatus !== "running") return;

            if (stageWillFail(stage)) {
                finishFail(stage);
                return;
            }

            stageStates.set(stage.id, "passed");
            appendLog("OK", fmt("log_stage_done", { stage: stage.id }, `Stage done: ${stage.id}`));
            runStage(idx + 1);
        }, delay);
    }

    function runPipeline() {
        if (!selected) return;
        clearTimer();
        runCounter.set(selected.id, (runCounter.get(selected.id) || 0) + 1);
        stageIndex = -1;
        activeStage = null;
        queueStages();
        renderStages();

        renderSelectedInfo();
        setStatus("running");
        setControls();
        elLogs.innerHTML = "";
        appendLog("INFO", fmt("log_pipeline_selected", { id: selected.id, repo: selected.repo }, `Pipeline selected: ${selected.id} (${selected.repo})`));
        appendLog("INFO", fmt("log_triggered", { run: elRunId.textContent }, `Pipeline triggered manually (run ${elRunId.textContent}).`));
        runStage(0);
    }

    function cancelPipeline() {
        if (pipelineStatus !== "running") return;
        clearTimer();
        if (activeStage) stageStates.set(activeStage, "canceled");
        setStatus("canceled");
        renderStages();
        setControls();
        setBottom(t("canceled", "Pipeline canceled."));
        appendLog("WARN", t("log_cancel_by_op", "Pipeline canceled by operator."));
    }

    function selectPipeline(id) {
        if (pipelineStatus === "running") {
            setBottom(t("denied_switch", "Cancel running pipeline before switching."));
            appendLog("WARN", t("log_switch_denied", "Switch denied while pipeline is running."));
            return;
        }
        const next = PIPELINES.find((p) => p.id === id);
        if (!next) return;
        selected = next;
        clearTimer();
        stageIndex = -1;
        activeStage = null;
        forceFailNext = false;
        setStatus("idle");
        queueStages();
        renderSelectedInfo();
        renderStages();
        renderList();
        setControls();
        elLogs.innerHTML = "";
        appendLog("INFO", fmt("log_repo_loaded", { repo: selected.repo }, `Repository loaded: ${selected.repo}`));
        appendLog("INFO", fmt("log_selected", { id: selected.id }, `Pipeline selected: ${selected.id}`));
        setBottom(fmt("selected_ready", { id: selected.id }, `Selected ${selected.id}. Click Run pipeline.`));
    }

    function resetPipeline() {
        if (pipelineStatus === "running") return;
        clearTimer();
        setStatus("idle");
        stageIndex = -1;
        activeStage = null;
        forceFailNext = false;
        queueStages();
        renderStages();
        setControls();
        renderSelectedInfo();
        appendLog("INFO", fmt("log_reset", { id: selected.id }, `Pipeline ${selected.id} reset.`));
        setBottom(t("reset_ready", "Ready."));
    }

    function loadDefaultPipeline() {
        queueStages();
        renderSelectedInfo();
        renderStages();
        renderList();
        setControls();
        appendLog("INFO", t("log_browser_ready", "Repository browser ready."));
        appendLog("INFO", fmt("selected_ready", { id: selected.id }, `Selected ${selected.id}. Click Run pipeline.`));
        setBottom(fmt("selected_ready", { id: selected.id }, `Selected ${selected.id}. Click Run pipeline.`));
    }

    function onListDblClick() {
        if (pipelineStatus === "running") return;
        runPipeline();
    }

    function onStageDblClick() {
        if (pipelineStatus !== "running") return;
        forceFailNext = true;
        appendLog("INFO", t("log_injected", "Injected failure for next quality stage."));
        setBottom(t("bottom_fail_inject", "Failure injection armed for next QA/Test stage."));
    }

    function onSpeedClick() {
        speedIndex = (speedIndex + 1) % SPEEDS.length;
        renderSpeedButton();
        appendLog("INFO", fmt("log_speed_mode", { mode: currentSpeed().label }, `Speed mode set to ${currentSpeed().label}.`));
        if (pipelineStatus !== "running") {
            setBottom(fmt("bottom_speed", { mode: currentSpeed().label }, `Speed: ${currentSpeed().label}.`));
        }
    }

    elRunBtn.addEventListener("click", runPipeline);
    elCancelBtn.addEventListener("click", cancelPipeline);
    elResetBtn.addEventListener("click", resetPipeline);
    elSpeedBtn.addEventListener("click", onSpeedClick);

    elList.addEventListener("dblclick", onListDblClick);
    elStages.addEventListener("dblclick", onStageDblClick);

    const observer = new MutationObserver(() => {
        if (!root.isConnected) {
            clearTimer();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setStatus("idle");
    renderSpeedButton();
    loadDefaultPipeline();

    return root;
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

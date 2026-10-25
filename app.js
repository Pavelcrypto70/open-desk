(() => {
  const STORAGE_KEY = "opsdesk.v1";
  const SETTINGS_KEY = "opsdesk.settings.v1";
  const SENT_KEY = "opsdesk.sentPings.v1";
  const ACTIVE_COL_KEY = "opsdesk.activeCol.v1";
  const TAB_SHORT = {
    "trade-master": "TM",
    "tg-hub": "TG",
    promo: "Ads",
    "ru-hub": "RU",
    "sys-learn": "Sys",
    edgebot: "Edge",
  };
  const COL_ORDER = ["trade-master", "tg-hub", "promo", "ru-hub", "sys-learn", "edgebot"];

  /** @type {any} */
  let state = null;
  /** @type {{ botToken: string, chatId: string, browserNotify: boolean, botNotify: boolean }} */
  let settings = loadSettings();
  /** @type {Record<string, number>} */
  let sentPings = loadSent();
  let activeColId = sessionStorage.getItem(ACTIVE_COL_KEY) || "";

  const el = {
    board: document.getElementById("board"),
    colTabs: document.getElementById("colTabs"),
    pingStrip: document.getElementById("pingStrip"),
    taskModal: document.getElementById("taskModal"),
    settingsModal: document.getElementById("settingsModal"),
    taskForm: document.getElementById("taskForm"),
    settingsForm: document.getElementById("settingsForm"),
    toast: document.getElementById("toast"),
    fColumn: document.getElementById("fColumn"),
    fTrack: document.getElementById("fTrack"),
    btnDelete: document.getElementById("btnDelete"),
    importFile: document.getElementById("importFile"),
    moreSheet: document.getElementById("moreSheet"),
    fabAdd: document.getElementById("fabAdd"),
  };

  function uid(prefix = "t") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { browserNotify: true, botNotify: false, botToken: "", chatId: "", ...JSON.parse(raw) };
    } catch (_) {}
    return { botToken: "", chatId: "", browserNotify: true, botNotify: false };
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadSent() {
    try {
      return JSON.parse(localStorage.getItem(SENT_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveSent() {
    localStorage.setItem(SENT_KEY, JSON.stringify(sentPings));
  }

  function makePromoColumn(extraTasks = []) {
    return {
      id: "promo",
      title: "Реклама и продвижение",
      accent: "rose",
      essence:
        "Трафик и воронка в продукт / хаб: Shorts, Reels, посевы, креативы, UTM, бюджет. Не путать с ежедневным комьюнити в Telegram-хабе.",
      tracks: [
        {
          id: "content-ads",
          title: "Контент / креативы",
          tasks: [
            ...extraTasks,
            {
              id: "promo-2",
              title: "Собрать пачку креативов (обложки / хуки / CTA)",
              notes: "Форматы 9:16 и квадрат. Один оффер — одна ссылка с UTM.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
          ],
        },
        {
          id: "channels",
          title: "Каналы / посевы",
          tasks: [
            {
              id: "promo-3",
              title: "Список каналов / блогеров для посева (EN+PT+RU)",
              notes: "Цена, охват, формат интеграции. Без спама.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
            {
              id: "promo-4",
              title: "UTM + трекинг кликов до хаба / стора",
              notes: "Один дашборд: откуда пришли и что конвертнулось.",
              status: "open",
              priority: 2,
              telegramPing: null,
            },
          ],
        },
      ],
    };
  }

  function reorderColumns(cols) {
    const byId = Object.fromEntries(cols.map((c) => [c.id, c]));
    const ordered = [];
    for (const id of COL_ORDER) {
      if (byId[id]) ordered.push(byId[id]);
    }
    for (const c of cols) {
      if (!COL_ORDER.includes(c.id)) ordered.push(c);
    }
    return ordered;
  }

  function migrateState(state) {
    if (!state?.columns?.length) return state;
    const tm = state.columns.find((c) => c.id === "trade-master");
    const hubTrack = tm?.tracks?.find((t) => t.id === "hub");
    const hasTgCol = state.columns.some((c) => c.id === "tg-hub");
    if (hubTrack && !hasTgCol) {
      tm.tracks = tm.tracks.filter((t) => t.id !== "hub");
      if (tm.essence && tm.essence.includes("Telegram-сообщество")) {
        tm.essence =
          "Flutter-курс криптотрейдинга: уроки, paper, журнал, сторы. Web: pavelcrypto70.github.io. Репо: trading_education_app.";
      }
      const tmIdx = state.columns.findIndex((c) => c.id === "trade-master");
      state.columns.splice(tmIdx + 1, 0, {
        id: "tg-hub",
        title: "Telegram-хаб",
        accent: "sky",
        essence:
          "Desk Club / Academy: seed-посты, ежедневный ритм, домашки. Каналы: @Desk_Club, @academy_trading_club, @trade_master_homework.",
        tracks: [{ id: "hub", title: "Комьюнити", tasks: hubTrack.tasks || [] }],
      });
    }

    const tg = state.columns.find((c) => c.id === "tg-hub");
    const movedAds = [];
    if (tg?.tracks) {
      for (const track of tg.tracks) {
        const keep = [];
        for (const task of track.tasks || []) {
          if (task.id === "tm-hub-4" || /shorts|reels|реклам|продвижен/i.test(task.title || "")) {
            movedAds.push(task);
          } else {
            keep.push(task);
          }
        }
        track.tasks = keep;
      }
    }

    if (!state.columns.some((c) => c.id === "promo")) {
      const promo = makePromoColumn(
        movedAds.length
          ? movedAds
          : [
              {
                id: "promo-1",
                title: "3 Shorts/Reels → github.io + пост в @Desk_Club",
                notes: "Цель: 10 платящих в первый месяц; 5 друзей на trial feedback.",
                status: "open",
                priority: 1,
                telegramPing: null,
              },
            ]
      );
      if (movedAds.length) {
        const contentTrack = promo.tracks.find((t) => t.id === "content-ads");
        if (contentTrack) {
          const ids = new Set(movedAds.map((t) => t.id));
          contentTrack.tasks = [
            ...movedAds,
            ...contentTrack.tasks.filter((t) => !ids.has(t.id) && t.id !== "promo-1"),
          ];
        }
      }
      state.columns.push(promo);
    } else if (movedAds.length) {
      const promo = state.columns.find((c) => c.id === "promo");
      const track = promo.tracks?.[0] || promo.tracks?.find((t) => t.id === "content-ads");
      if (track) {
        const have = new Set((track.tasks || []).map((t) => t.id));
        for (const t of movedAds) {
          if (!have.has(t.id)) track.tasks.unshift(t);
        }
      }
    }

    state.columns = reorderColumns(state.columns);
    state.version = Math.max(Number(state.version) || 1, 3);
    return state;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.columns?.length) return migrateState(parsed);
      }
    } catch (_) {}
    return bootstrapFromSeed();
  }

  function bootstrapFromSeed() {
    const seed = clone(window.DESK_SEED);
    seed.savedAt = new Date().toISOString();
    return seed;
  }

  function save() {
    state.savedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.toast.classList.remove("show"), 2200);
  }

  function findTask(taskId) {
    for (const col of state.columns) {
      for (const track of col.tracks) {
        const task = track.tasks.find((t) => t.id === taskId);
        if (task) return { col, track, task };
      }
    }
    return null;
  }

  function countOpen(col) {
    return col.tracks.reduce((n, tr) => n + tr.tasks.filter((t) => t.status !== "done").length, 0);
  }

  function countDone(col) {
    return col.tracks.reduce((n, tr) => n + tr.tasks.filter((t) => t.status === "done").length, 0);
  }

  function formatWhen(isoOrLocal) {
    if (!isoOrLocal) return "без даты";
    const d = new Date(isoOrLocal);
    if (Number.isNaN(d.getTime())) return String(isoOrLocal);
    return d.toLocaleString("ru-RU", {
      timeZone: "Asia/Tomsk",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }) + " · Томск";
  }

  function toLocalInputValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fromLocalInputValue(val) {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  function pingStatus(ping) {
    if (!ping?.at) return ping?.note ? "due" : null;
    const t = new Date(ping.at).getTime();
    if (Number.isNaN(t)) return "due";
    return t <= Date.now() ? "overdue" : "due";
  }

  function allPings() {
    const items = [];
    for (const col of state.columns) {
      for (const track of col.tracks) {
        for (const task of track.tasks) {
          if (task.status === "done") continue;
          if (!task.telegramPing?.at && !task.telegramPing?.note) continue;
          items.push({ col, track, task, ping: task.telegramPing });
        }
      }
    }
    items.sort((a, b) => {
      const ta = a.ping.at ? new Date(a.ping.at).getTime() : Infinity;
      const tb = b.ping.at ? new Date(b.ping.at).getTime() : Infinity;
      return ta - tb;
    });
    return items;
  }

  function renderPingStrip() {
    const items = allPings().filter((x) => x.ping.at || x.ping.note).slice(0, 12);
    el.pingStrip.classList.toggle("has-items", items.length > 0);
    el.pingStrip.innerHTML = items
      .map(({ task, ping }) => {
        const st = pingStatus(ping) || "due";
        return `<button type="button" class="ping-chip ${st}" data-edit="${task.id}">
          <span class="when">${ping.at ? formatWhen(ping.at) : "заметка"}</span>
          <span class="what">${escapeHtml(ping.note || task.title)}</span>
        </button>`;
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTaskCard(task) {
    const done = task.status === "done";
    const prio = Number(task.priority) || 3;
    const ping = task.telegramPing;
    const st = ping ? pingStatus(ping) : null;
    const pingBtn =
      ping && (ping.at || ping.note)
        ? `<button type="button" class="tg-badge ${st || ""}" data-edit="${task.id}" title="${escapeHtml(ping.note || "")}">✈ ${ping.at ? formatWhen(ping.at) : "TG"}</button>`
        : "";

    return `<article class="task ${done ? "done" : ""}" data-id="${task.id}">
      <div class="task-row">
        <button type="button" class="check" data-toggle="${task.id}" aria-label="Отметить">${done ? "✓" : ""}</button>
        <div class="task-main">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.notes ? `<div class="task-notes">${escapeHtml(task.notes)}</div>` : ""}
          <div class="task-foot">
            <span class="prio p${prio}">P${prio}</span>
            ${pingBtn}
            <div class="task-actions">
              <button type="button" class="btn icon small" data-edit="${task.id}" title="Изменить">✎</button>
            </div>
          </div>
        </div>
      </div>
    </article>`;
  }

  function ensureActiveCol() {
    if (!state.columns.some((c) => c.id === activeColId)) {
      activeColId = state.columns[0]?.id || "";
    }
    if (activeColId) sessionStorage.setItem(ACTIVE_COL_KEY, activeColId);
  }

  function setActiveCol(id) {
    if (!state.columns.some((c) => c.id === id)) return;
    activeColId = id;
    sessionStorage.setItem(ACTIVE_COL_KEY, id);
    applyActiveCol();
    renderColTabs();
  }

  function applyActiveCol() {
    el.board.dataset.activeCol = activeColId;
    el.board.querySelectorAll(".column").forEach((node) => {
      node.classList.toggle("is-active", node.dataset.col === activeColId);
    });
  }

  function renderColTabs() {
    ensureActiveCol();
    el.colTabs.hidden = false;
    el.colTabs.innerHTML = state.columns
      .map((col) => {
        const openN = countOpen(col);
        const short = TAB_SHORT[col.id] || col.title.slice(0, 4);
        const on = col.id === activeColId ? "is-active" : "";
        return `<button type="button" class="col-tab ${on}" data-col-tab="${col.id}" data-accent="${col.accent}" aria-pressed="${col.id === activeColId}">
          <span class="col-tab-name">${escapeHtml(short)}</span>
          <span class="col-tab-count">${openN}</span>
        </button>`;
      })
      .join("");
  }

  function render() {
    ensureActiveCol();
    el.board.innerHTML = state.columns
      .map((col) => {
        const openN = countOpen(col);
        const doneN = countDone(col);
        const tracksHtml = col.tracks
          .map((track) => {
            const open = track.tasks
              .filter((t) => t.status !== "done")
              .sort((a, b) => (a.priority || 9) - (b.priority || 9));
            const done = track.tasks.filter((t) => t.status === "done");
            return `<section class="track" data-track="${track.id}">
              <div class="track-head">
                <div class="track-title">${escapeHtml(track.title)}</div>
                <button type="button" class="btn small" data-add="${col.id}:${track.id}">+</button>
              </div>
              <div class="task-list">
                ${
                  open.length
                    ? open.map(renderTaskCard).join("")
                    : `<div class="empty-hint">Нет текущих — добавь задачу</div>`
                }
              </div>
              ${
                done.length
                  ? `<details class="done-fold"><summary>Закрытые · ${done.length}</summary>
                      <div class="task-list">${done.map(renderTaskCard).join("")}</div>
                    </details>`
                  : ""
              }
            </section>`;
          })
          .join("");

        const active = col.id === activeColId ? "is-active" : "";
        return `<section class="column ${active}" data-accent="${col.accent}" data-col="${col.id}">
          <div class="col-head">
            <div class="col-head-row">
              <div>
                <h2 class="col-title">${escapeHtml(col.title)}</h2>
                <div class="col-meta">${openN} открыто · ${doneN} закрыто</div>
              </div>
              <button type="button" class="btn small desktop-only" data-add="${col.id}:">+ задача</button>
            </div>
            <p class="essence" contenteditable="true" data-essence="${col.id}" spellcheck="true">${escapeHtml(col.essence)}</p>
          </div>
          <div class="col-body">${tracksHtml}</div>
        </section>`;
      })
      .join("");

    el.board.dataset.activeCol = activeColId;
    renderColTabs();
    renderPingStrip();
  }

  function openMore() {
    el.moreSheet.hidden = false;
    document.getElementById("btnMore")?.setAttribute("aria-expanded", "true");
  }
  function closeMore() {
    el.moreSheet.hidden = true;
    document.getElementById("btnMore")?.setAttribute("aria-expanded", "false");
  }

  function shiftActiveCol(delta) {
    const idx = state.columns.findIndex((c) => c.id === activeColId);
    if (idx < 0) return;
    const next = state.columns[(idx + delta + state.columns.length) % state.columns.length];
    setActiveCol(next.id);
  }

  function fillColumnSelect(selectedCol, selectedTrack) {
    el.fColumn.innerHTML = state.columns
      .map((c) => `<option value="${c.id}" ${c.id === selectedCol ? "selected" : ""}>${escapeHtml(c.title)}</option>`)
      .join("");
    fillTrackSelect(selectedCol || state.columns[0]?.id, selectedTrack);
  }

  function fillTrackSelect(colId, selectedTrack) {
    const col = state.columns.find((c) => c.id === colId);
    const tracks = col?.tracks || [];
    el.fTrack.innerHTML = tracks
      .map((t) => `<option value="${t.id}" ${t.id === selectedTrack ? "selected" : ""}>${escapeHtml(t.title)}</option>`)
      .join("");
  }

  function openTaskModal(opts = {}) {
    const { taskId, columnId, trackId } = opts;
    const existing = taskId ? findTask(taskId) : null;
    document.getElementById("taskModalTitle").textContent = existing ? "Изменить задачу" : "Новая задача";
    el.btnDelete.hidden = !existing;

    const colId = existing?.col.id || columnId || activeColId || state.columns[0].id;
    const trId = existing?.track.id || trackId || state.columns.find((c) => c.id === colId)?.tracks[0]?.id;
    fillColumnSelect(colId, trId);

    document.getElementById("fId").value = existing?.task.id || "";
    document.getElementById("fTitle").value = existing?.task.title || "";
    document.getElementById("fNotes").value = existing?.task.notes || "";
    document.getElementById("fPriority").value = String(existing?.task.priority || 2);
    document.getElementById("fStatus").value = existing?.task.status || "open";
    document.getElementById("fPingAt").value = toLocalInputValue(existing?.task.telegramPing?.at);
    document.getElementById("fPingNote").value = existing?.task.telegramPing?.note || "";

    el.taskModal.classList.add("open");
    document.getElementById("fTitle").focus();
  }

  function closeTaskModal() {
    el.taskModal.classList.remove("open");
  }

  function openSettings() {
    document.getElementById("sToken").value = settings.botToken || "";
    document.getElementById("sChat").value = settings.chatId || "";
    document.getElementById("sBrowser").checked = !!settings.browserNotify;
    document.getElementById("sBot").checked = !!settings.botNotify;
    el.settingsModal.classList.add("open");
  }

  function closeSettings() {
    el.settingsModal.classList.remove("open");
  }

  async function sendTelegram(text) {
    if (!settings.botToken || !settings.chatId) {
      throw new Error("Нет token или chat_id");
    }
    const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.description || `HTTP ${res.status}`);
    }
    return data;
  }

  async function maybeNotifyBrowser(title, body) {
    if (!settings.browserNotify || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body, tag: "opsdesk-ping" });
    }
  }

  async function checkDuePings() {
    const now = Date.now();
    for (const { col, task, ping } of allPings()) {
      if (!ping?.at) continue;
      const t = new Date(ping.at).getTime();
      if (Number.isNaN(t) || t > now) continue;
      const key = `${task.id}:${ping.at}`;
      if (sentPings[key]) continue;

      const text = `⏰ Томский завод · ${col.title}\n${task.title}\n${ping.note || ""}\n(${formatWhen(ping.at)})`.trim();
      try {
        await maybeNotifyBrowser("Томский завод · пинг", `${col.title}: ${ping.note || task.title}`);
        if (settings.botNotify) await sendTelegram(text);
        sentPings[key] = now;
        saveSent();
      } catch (err) {
        console.warn("ping failed", err);
      }
    }
  }

  document.getElementById("btnAdd").addEventListener("click", () => openTaskModal());
  document.getElementById("btnSettings").addEventListener("click", openSettings);
  document.getElementById("btnCancel").addEventListener("click", closeTaskModal);
  document.getElementById("btnSettingsCancel").addEventListener("click", closeSettings);

  el.fabAdd?.addEventListener("click", () => openTaskModal({ columnId: activeColId }));
  document.getElementById("btnMore")?.addEventListener("click", openMore);
  document.getElementById("btnMoreClose")?.addEventListener("click", closeMore);
  el.moreSheet?.addEventListener("click", (e) => {
    if (e.target === el.moreSheet) closeMore();
  });

  function wireReset(btn) {
    btn?.addEventListener("click", () => {
      closeMore();
      if (!confirm("Сбросить дашборд к seed из репозиториев? Локальные правки пропадут.")) return;
      state = bootstrapFromSeed();
      save();
      render();
      toast("Seed загружен");
    });
  }
  wireReset(document.getElementById("btnReset"));
  wireReset(document.getElementById("btnResetM"));

  document.getElementById("btnExportM")?.addEventListener("click", () => {
    closeMore();
    document.getElementById("btnExport").click();
  });
  document.getElementById("btnImportM")?.addEventListener("click", () => {
    closeMore();
    el.importFile.click();
  });

  el.colTabs.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-col-tab]");
    if (tab) setActiveCol(tab.dataset.colTab);
  });

  {
    let x0 = 0;
    let y0 = 0;
    let tracking = false;
    el.board.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        tracking = true;
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
      },
      { passive: true }
    );
    el.board.addEventListener(
      "touchend",
      (e) => {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - x0;
        const dy = t.clientY - y0;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        shiftActiveCol(dx < 0 ? 1 : -1);
      },
      { passive: true }
    );
  }

  el.taskModal.addEventListener("click", (e) => {
    if (e.target === el.taskModal) closeTaskModal();
  });
  el.settingsModal.addEventListener("click", (e) => {
    if (e.target === el.settingsModal) closeSettings();
  });

  el.fColumn.addEventListener("change", () => fillTrackSelect(el.fColumn.value));

  el.board.addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle], [data-edit], [data-add]");
    if (!t) return;
    if (t.dataset.toggle) {
      const found = findTask(t.dataset.toggle);
      if (!found) return;
      found.task.status = found.task.status === "done" ? "open" : "done";
      save();
      render();
      return;
    }
    if (t.dataset.edit) {
      openTaskModal({ taskId: t.dataset.edit });
      return;
    }
    if (t.dataset.add) {
      const [columnId, trackId] = t.dataset.add.split(":");
      openTaskModal({ columnId, trackId: trackId || undefined });
    }
  });

  el.board.addEventListener("focusout", (e) => {
    const node = e.target.closest("[data-essence]");
    if (!node) return;
    const col = state.columns.find((c) => c.id === node.dataset.essence);
    if (!col) return;
    const next = node.textContent.trim();
    if (next !== col.essence) {
      col.essence = next;
      save();
      toast("Суть направления сохранена");
    }
  });

  el.pingStrip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-edit]");
    if (btn) openTaskModal({ taskId: btn.dataset.edit });
  });

  el.taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("fId").value || uid("task");
    const columnId = el.fColumn.value;
    const trackId = el.fTrack.value;
    const title = document.getElementById("fTitle").value.trim();
    if (!title) return;

    const payload = {
      id,
      title,
      notes: document.getElementById("fNotes").value.trim(),
      status: document.getElementById("fStatus").value,
      priority: Number(document.getElementById("fPriority").value) || 2,
      telegramPing: {
        at: fromLocalInputValue(document.getElementById("fPingAt").value),
        note: document.getElementById("fPingNote").value.trim() || null,
      },
    };
    if (!payload.telegramPing.at && !payload.telegramPing.note) {
      payload.telegramPing = null;
    }

    const existing = findTask(id);
    if (existing) {
      existing.track.tasks = existing.track.tasks.filter((t) => t.id !== id);
    }
    const col = state.columns.find((c) => c.id === columnId);
    const track = col?.tracks.find((t) => t.id === trackId);
    if (!track) {
      toast("Нет потока");
      return;
    }
    track.tasks.unshift(payload);
    save();
    closeTaskModal();
    render();
    toast(existing ? "Обновлено" : "Добавлено");
  });

  el.btnDelete.addEventListener("click", () => {
    const id = document.getElementById("fId").value;
    const found = findTask(id);
    if (!found) return;
    if (!confirm("Удалить задачу?")) return;
    found.track.tasks = found.track.tasks.filter((t) => t.id !== id);
    save();
    closeTaskModal();
    render();
    toast("Удалено");
  });

  el.settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    settings.botToken = document.getElementById("sToken").value.trim();
    settings.chatId = document.getElementById("sChat").value.trim();
    settings.browserNotify = document.getElementById("sBrowser").checked;
    settings.botNotify = document.getElementById("sBot").checked;
    saveSettings();
    if (settings.browserNotify && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    closeSettings();
    toast("Настройки Telegram сохранены");
  });

  document.getElementById("btnTestTg").addEventListener("click", async () => {
    settings.botToken = document.getElementById("sToken").value.trim();
    settings.chatId = document.getElementById("sChat").value.trim();
    try {
      await sendTelegram("Томский завод ✓ тест. Если видишь это — пинги дойдут.");
      toast("Тест отправлен");
    } catch (err) {
      toast(`Ошибка: ${err.message}`);
    }
  });

  document.getElementById("btnExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `opsdesk-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Экспорт готов");
  });

  document.getElementById("btnImport").addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", async () => {
    const file = el.importFile.files?.[0];
    el.importFile.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.columns?.length) throw new Error("Нет columns");
      state = data;
      save();
      render();
      toast("Импорт ок");
    } catch (err) {
      toast(`Импорт не вышел: ${err.message}`);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTaskModal();
      closeSettings();
      closeMore();
    }
  });

  state = loadState();
  save();
  render();
  checkDuePings();
  setInterval(checkDuePings, 60_000);
  setInterval(renderPingStrip, 30_000);
})();

(function () {
  "use strict";

  const CONFIG = {
    url: "https://cli-04-jovana-guimarases.frontlabstudio.workers.dev",
    cooldownHoras: 1,
    timeoutMs: 1200,
    heartbeatIntervalMs: 30000, // Pulso a cada 30 segundos
  };

  const pageLoadTime = Date.now();

  // NOVO: Gerenciamento de Sessão (Identidade Única)
  const getSessionId = () => {
    let sid = sessionStorage.getItem("fl_session_id");
    if (!sid) {
      sid =
        "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
      sessionStorage.setItem("fl_session_id", sid);
    }
    return sid;
  };
  const SESSION_ID = getSessionId();

  const getUTMs = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "organico",
      utm_medium: params.get("utm_medium") || "none",
      utm_campaign: params.get("utm_campaign") || "none",
    };
  };

  // Empacotador de dados (Mais limpo e reutilizável)
  const buildPayload = (coluna, eventType) => {
    return JSON.stringify({
      [coluna]: 1,
      event_type: eventType,
      session_id: SESSION_ID, // Anexa a identidade em TUDO
      ...getUTMs(),
      device: /Mobile|Android|iP(ad|hone)/i.test(navigator.userAgent)
        ? "Mobile"
        : "Desktop",
      referrer: document.referrer || "direto",
      page: window.location.pathname,
      time_on_page_sec: Math.round((Date.now() - pageLoadTime) / 1000),
    });
  };

  // ========================================================
  // NOVO MOTOR: O BATIMENTO CARDÍACO (HEARTBEAT)
  // ========================================================
  setInterval(() => {
    // Só envia o pulso se o usuário estiver focado na página (aba ativa)
    if (document.visibilityState === "visible") {
      fetch(CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildPayload("heartbeat", "heartbeat"),
        keepalive: true,
      }).catch(() => null);
    }
  }, CONFIG.heartbeatIntervalMs);

  // DISPARA O 'PAGE_VIEW' ASSIM QUE O SITE CARREGA
  window.addEventListener("load", () => {
    const storageKey = `fl_track_page_view`;
    const tempoBloqueioMs = CONFIG.cooldownHoras * 60 * 60 * 1000;
    let lastView = parseInt(localStorage.getItem(storageKey), 10) || 0;
    const now = Date.now();

    if (now - lastView < tempoBloqueioMs) return;

    try {
      localStorage.setItem(storageKey, now.toString());
      fetch(CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildPayload("page_view", "page_view"),
        keepalive: true,
      }).catch(() => null);
    } catch (e) {}
  });

  // MANTÉM OS CLIQUES NOS BOTÕES INTACTOS
  document.addEventListener("click", async function (e) {
    const target = e.target.closest('[data-track="true"]');
    if (!target) return;

    const coluna = target.getAttribute("data-coluna");
    const href = target.getAttribute("href");
    const isBlank = target.getAttribute("target") === "_blank";

    if (!coluna) return;

    const isModifiedEvent =
      e.ctrlKey || e.shiftKey || e.metaKey || e.button === 1 || isBlank;
    const ehLinkValido =
      href && href !== "#" && !href.startsWith("javascript:");

    if (!isModifiedEvent && ehLinkValido) e.preventDefault();

    const liberarNavegacao = () => {
      if (!isModifiedEvent && ehLinkValido) window.location.href = href;
    };

    const tempoBloqueioMs = CONFIG.cooldownHoras * 60 * 60 * 1000;
    const storageKey = `fl_track_${coluna}`;
    let lastClick = parseInt(localStorage.getItem(storageKey), 10) || 0;
    const now = Date.now();

    if (now - lastClick < tempoBloqueioMs) {
      liberarNavegacao();
      return;
    }

    try {
      localStorage.setItem(storageKey, now.toString());

      const fetchPromise = fetch(CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildPayload(coluna, "click"),
        keepalive: true,
      }).catch(() => null);

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(null), CONFIG.timeoutMs),
      );

      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
    } finally {
      liberarNavegacao();
    }
  });
})();

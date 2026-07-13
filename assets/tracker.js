(function () {
  "use strict";

  const CONFIG = {
    url: "https://cli-04-jovana-guimarases.frontlabstudio.workers.dev",
    cooldownHoras: 1,
    timeoutMs: 1200,
  };

  // Marca quando a página terminou de carregar
  const pageLoadTime = Date.now();

  // Função para pegar as UTMs da URL
  const getUTMs = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "organico",
      utm_medium: params.get("utm_medium") || "none",
      utm_campaign: params.get("utm_campaign") || "none"
    };
  };

  document.addEventListener("click", async function (e) {
    const target = e.target.closest('[data-track="true"]');
    if (!target) return;

    const coluna = target.getAttribute("data-coluna");
    const href = target.getAttribute("href");
    const isBlank = target.getAttribute("target") === "_blank";

    if (!coluna) return;

    const isModifiedEvent = e.ctrlKey || e.shiftKey || e.metaKey || e.button === 1 || isBlank;
    const ehLinkValido = href && href !== "#" && !href.startsWith("javascript:");

    if (!isModifiedEvent && ehLinkValido) {
      e.preventDefault();
    }

    const liberarNavegacao = () => {
      if (!isModifiedEvent && ehLinkValido) {
        window.location.href = href;
      }
    };

    const tempoBloqueioMs = CONFIG.cooldownHoras * 60 * 60 * 1000;
    const storageKey = `fl_track_${coluna}`;
    let lastClick = 0;

    try {
      lastClick = parseInt(localStorage.getItem(storageKey), 10) || 0;
    } catch (error) {
      console.warn("[Tracker] Erro local.");
    }

    const now = Date.now();
    if (now - lastClick < tempoBloqueioMs) {
      liberarNavegacao();
      return;
    }

    try {
      localStorage.setItem(storageKey, now.toString());
      
      const utms = getUTMs();
      
      // MONTANDO O NOVO PACOTE DE DADOS RICOS
      const payload = JSON.stringify({ 
        [coluna]: 1,
        ...utms,
        device: /Mobile|Android|iP(ad|hone)/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        referrer: document.referrer || "direto",
        page: window.location.pathname,
        time_on_page_sec: Math.round((now - pageLoadTime) / 1000)
      });

      const fetchPromise = fetch(CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => null); // Silencia erros de rede para não sujar o console

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(null), CONFIG.timeoutMs) // Resolve null em vez de Error
      );

      await Promise.race([fetchPromise, timeoutPromise]);
      
    } catch (err) {
      // Falha silenciosa total
    } finally {
      liberarNavegacao();
    }
  });
})();
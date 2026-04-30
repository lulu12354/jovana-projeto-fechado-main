v(function () {
  // ==========================================
  // 1. DADOS DO CLIENTE (MUDE APENAS AQUI)
  // ==========================================
  const CONFIG = {
    url: "https://cli-04-jovana-guimarases.frontlabstudio.workers.dev",
    cooldownHoras: 1,
  };

  // ==========================================
  // 2. MOTOR RASTREADOR BLINDADO (OTIMIZADO)
  // ==========================================
  document.addEventListener("click", function (e) {
    const target = e.target.closest('[data-track="true"]');
    if (!target) return;

    const coluna = target.getAttribute("data-coluna");
    const href = target.getAttribute("href");
    const isBlank = target.getAttribute("target") === "_blank";

    if (!coluna) return;

    // VERIFICAÇÃO DE TECLAS MODIFICADORAS (Protege o Ctrl+Click, Shift+Click, Middle Click)
    const isModifiedEvent =
      e.ctrlKey || e.shiftKey || e.metaKey || e.button === 1 || isBlank;
    const ehLinkValido = href && !href.startsWith("#");

    // Só previne o evento se for um clique normal na mesma guia e for um link válido
    if (!isModifiedEvent && ehLinkValido) {
      e.preventDefault();
    }

    const tempoBloqueioMs = CONFIG.cooldownHoras * 60 * 60 * 1000;
    const storageKey = `fl_track_${coluna}`;
    const lastClick = localStorage.getItem(storageKey);
    const now = Date.now();

    // FUNÇÃO DE NAVEGAÇÃO IMEDIATA (Hoisting)
    const liberarNavegacao = () => {
      if (!isModifiedEvent && ehLinkValido) {
        window.location.href = href;
      }
    };

    // Verifica o Cooldown
    if (lastClick && now - parseInt(lastClick) < tempoBloqueioMs) {
      console.log(`[Frontlab] Cooldown ativo (${CONFIG.cooldownHoras}h).`);
      liberarNavegacao();
      return;
    }

    // Atualiza Cooldown
    localStorage.setItem(storageKey, now.toString());

    // DISPARO "FIRE AND FORGET" (Garante performance 100%)
    // Não usamos await para não bloquear a thread principal nem o redirecionamento.
    // O keepalive cuida do envio em background enquanto a página descarrega.
    fetch(CONFIG.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [coluna]: 1 }),
      keepalive: true,
    }).catch(() => {
      // Falha silenciosa para não poluir o console do cliente
    });

    // Redireciona o usuário IMEDIATAMENTE (Sensação de click instantâneo)
    liberarNavegacao();
  });
})();

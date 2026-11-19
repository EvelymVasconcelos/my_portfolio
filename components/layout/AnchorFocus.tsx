"use client";

import { useEffect } from "react";

/**
 * Ao seguir um link de âncora (#about, #research…), leva o foco para o título da seção (`aria-labelledby`, com
 * `tabindex=-1`). Assim o leitor de tela anuncia onde a pessoa chegou e o próximo Tab continua dali, em vez de
 * voltar ao cabeçalho. Não rola a página: a rolagem é a do próprio navegador.
 */
export function AnchorFocus() {
  useEffect(() => {
    const onHashChange = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      const titleId = target.getAttribute("aria-labelledby");
      const title = titleId ? document.getElementById(titleId) : null;
      (title ?? target).focus({ preventScroll: true });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}

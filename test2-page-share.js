(() => {
  "use strict";

  const TEXT = {
    share: "Compartilhar",
    whatsapp: "WhatsApp",
    email: "E-mail",
    download: "Baixar imagem",
    copy: "Copiar dados",
    close: "Fechar",
  };

  const $ = (selector, root = document) => root.querySelector(selector);

  function visible(element) {
    if (!element || element.hidden) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function cleanText(root) {
    return (root?.innerText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter(
        (line) =>
          !/^↗?\s*(compartilhar.*|whatsapp|e-mail|baixar imagem|copiar dados|fechar|gerar relatório|imprimir.*pdf)$/i.test(
            line,
          ),
      )
      .slice(0, 300)
      .join("\n");
  }

  function pageRoot(source) {
    if (source?.id === "monthlyReport" || source?.closest?.("#monthlyReport"))
      return $("#monthlyReport");
    if (
      source?.id === "t2SuperDashboardV2" ||
      source?.closest?.("#t2SuperDashboardV2")
    )
      return (
        $("#t2SuperDashboardV2 .t2v2-content") || $("#t2SuperDashboardV2")
      );
    if (source?.closest?.('[data-screen-panel="home"]')) {
      return (
        $("#t2SuperDashboardV2 .t2v2-content") ||
        $('[data-screen-panel="home"]')
      );
    }
    return (
      source?.closest?.(
        "#t2ContractPayments,#t2OwnerPayouts,.app-screen,.t2-card,section",
      ) || $("main.container")
    );
  }

  function overviewRoot() {
    return (
      $("#t2SuperDashboardV2 .t2v2-content") ||
      [...document.querySelectorAll('[data-screen-panel="home"]')].find(
        visible,
      ) ||
      $('[data-screen-panel="home"]')
    );
  }

  function safeName(title) {
    return String(title || "Pagina")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");
  }

  function copyControlState(source, clone) {
    const sourceControls = source.querySelectorAll(
      "input,select,textarea,details",
    );
    const cloneControls = clone.querySelectorAll(
      "input,select,textarea,details",
    );
    sourceControls.forEach((control, index) => {
      const copy = cloneControls[index];
      if (!copy) return;
      if (control instanceof HTMLInputElement) {
        copy.setAttribute("value", control.value);
        if (control.checked) copy.setAttribute("checked", "checked");
        else copy.removeAttribute("checked");
      } else if (control instanceof HTMLTextAreaElement) {
        copy.textContent = control.value;
      } else if (control instanceof HTMLSelectElement) {
        [...copy.options].forEach((option, optionIndex) => {
          if (optionIndex === control.selectedIndex)
            option.setAttribute("selected", "selected");
          else option.removeAttribute("selected");
        });
      } else if (control instanceof HTMLDetailsElement) {
        if (control.open) copy.setAttribute("open", "open");
        else copy.removeAttribute("open");
      }
    });
  }

  function copyComputedStyles(source, clone) {
    const sourceNodes = [source, ...source.querySelectorAll("*")];
    const cloneNodes = [clone, ...clone.querySelectorAll("*")];
    sourceNodes.forEach((node, index) => {
      const copy = cloneNodes[index];
      if (!copy) return;
      const style = getComputedStyle(node);
      for (let styleIndex = 0; styleIndex < style.length; styleIndex += 1) {
        const property = style[styleIndex];
        try {
          copy.style.setProperty(
            property,
            style.getPropertyValue(property),
            style.getPropertyPriority(property),
          );
        } catch {}
      }
    });
  }

  function prepareClone(source) {
    const clone = source.cloneNode(true);
    copyControlState(source, clone);
    copyComputedStyles(source, clone);
    clone
      .querySelectorAll(
        "#t2V2Sponsor,#t2FloatingSponsor,#t2UniversalShareModal,.t2-overview-sharebar,.t2-page-sharebar,.t2-support,.stay-share-modal,[data-share-capture-hide]",
      )
      .forEach((element) => element.remove());
    clone
      .querySelectorAll("#t2V2Share,#t2V2Report")
      .forEach((element) => element.remove());
    clone.querySelectorAll("*").forEach((element) => {
      if (element.hidden || element.style.display === "none") element.remove();
    });
    clone.querySelectorAll(".t2v2-donut,.t2-pro-donut").forEach((donut) => {
      const hole = document.createElement("i");
      hole.setAttribute("aria-hidden", "true");
      hole.style.cssText =
        "position:absolute;inset:30px;background:#fff;border-radius:50%;display:block;z-index:0";
      donut.prepend(hole);
    });
    clone.style.setProperty("margin", "0", "important");
    clone.style.setProperty("max-width", "none", "important");
    clone.style.setProperty("height", "auto", "important");
    clone.style.setProperty("max-height", "none", "important");
    clone.style.setProperty("overflow", "visible", "important");
    return clone;
  }

  async function capturePage(title, source) {
    const root = pageRoot(source) || source;
    if (!root) throw new Error("NO_SHARE_ROOT");
    if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
    const rect = root.getBoundingClientRect();
    const width = Math.max(
      760,
      Math.ceil(root.scrollWidth || rect.width || 1000),
    );
    const height = Math.min(
      14000,
      Math.max(560, Math.ceil(root.scrollHeight || rect.height || 760)),
    );
    const clone = prepareClone(root);
    clone.style.setProperty("width", `${width}px`, "important");

    const wrapper = document.createElement("div");
    wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    wrapper.style.cssText = `width:${width + 56}px;min-height:${height + 112}px;background:#eef1f8;padding:28px;box-sizing:border-box;font-family:Arial,sans-serif`;
    const paper = document.createElement("div");
    paper.style.cssText =
      "background:#fff;border:1px solid #dbe2ea;border-radius:22px;padding:22px;box-sizing:border-box;overflow:visible";
    const brand = document.createElement("div");
    brand.textContent = "STAY IN CONTROL";
    brand.style.cssText =
      "font:900 20px Arial,sans-serif;color:#4f46e5;margin:0 0 6px";
    const heading = document.createElement("div");
    heading.textContent = title;
    heading.style.cssText =
      "font:900 30px Arial,sans-serif;color:#172033;margin:0 0 16px";
    paper.append(brand, heading, clone);
    wrapper.append(paper);

    const serialized = new XMLSerializer().serializeToString(wrapper);
    const totalWidth = width + 56;
    const totalHeight = height + 112;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
    const svgUrl = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    try {
      const image = await new Promise((resolve, reject) => {
        const item = new Image();
        item.onload = () => resolve(item);
        item.onerror = () => reject(new Error("IMAGE_RENDER_FAILED"));
        item.src = svgUrl;
      });
      const maxPixels = 14_000_000;
      const scale = Math.min(
        1.7,
        2400 / totalWidth,
        Math.sqrt(maxPixels / (totalWidth * totalHeight)),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(totalWidth * scale));
      canvas.height = Math.max(1, Math.round(totalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#eef1f8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 0.96),
      );
      if (!blob) throw new Error("PNG_FAILED");
      return new File([blob], `Stay-in-Control-${safeName(title)}.png`, {
        type: "image/png",
      });
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  function download(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function canShareFile(file) {
    if (!navigator.share) return false;
    try {
      return !navigator.canShare || navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }

  async function nativeShare(file, title, text) {
    if (!canShareFile(file)) return false;
    await navigator.share({ title, text, files: [file] });
    return true;
  }

  async function copyImage(file) {
    if (!navigator.clipboard?.write || !window.ClipboardItem) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
    return true;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }

  async function shareWhatsApp(file, title, text, note) {
    if (canShareFile(file)) {
      note.textContent = "Escolha o WhatsApp para enviar a imagem.";
      await nativeShare(file, title, text);
      return;
    }
    const popup = window.open("about:blank", "_blank");
    let copied = false;
    try {
      copied = await copyImage(file);
    } catch {}
    if (!copied) download(file);
    const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (popup) popup.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
    note.textContent = copied
      ? "Imagem copiada. No WhatsApp, escolha a conversa e cole com Ctrl+V."
      : "Imagem baixada. No WhatsApp, escolha a conversa e anexe o arquivo.";
  }

  async function shareEmail(file, title, text, note) {
    if (canShareFile(file)) {
      note.textContent = "Escolha o aplicativo de e-mail para enviar a imagem.";
      await nativeShare(file, title, text);
      return;
    }
    download(file);
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `Stay in Control — ${title}`,
    )}&body=${encodeURIComponent(
      `${text}\n\nA imagem do painel foi baixada para ser anexada.`,
    )}`;
    note.textContent =
      "E-mail aberto. Anexe a imagem que acabou de ser baixada.";
  }

  function installCss() {
    if ($("#t2UniversalShareCss")) return;
    const style = document.createElement("style");
    style.id = "t2UniversalShareCss";
    style.textContent = `
      .t2-overview-sharebar{display:flex;justify-content:flex-start;margin:0 0 12px}
      .t2-share-modal{position:fixed;inset:0;z-index:2147483600;background:rgba(31,41,55,.78);display:grid;place-items:center;padding:16px;box-sizing:border-box}
      .t2-share-card{width:min(980px,97vw);max-height:96dvh;overflow:auto;background:#fff;border-radius:18px;padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.4);box-sizing:border-box}
      .t2-share-card h3{margin:0 0 12px;color:#172033;font-size:20px}
      .t2-share-preview-wrap{background:#e5e7eb;border-radius:12px;padding:12px;display:flex;justify-content:center;min-height:180px}
      .t2-share-preview{display:block;max-width:100%;max-height:62vh;object-fit:contain;background:#fff;box-shadow:0 3px 14px rgba(0,0,0,.22)}
      .t2-share-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}
      .t2-share-actions .button{min-height:48px;border-radius:10px;font-weight:800;white-space:normal}
      .t2-share-primary{background:#5b21d1!important;color:#fff!important}
      .t2-share-whatsapp{background:#128c4b!important;color:#fff!important}
      .t2-share-note{text-align:center;color:#667085;font-size:12px;min-height:18px;margin-top:8px}
      @media(max-width:720px){.t2-share-modal{align-items:start;padding:8px}.t2-share-card{width:100%;max-height:calc(100dvh - 16px);padding:12px}.t2-share-actions{grid-template-columns:1fr 1fr}.t2-share-preview{max-height:50vh}.t2-overview-sharebar button{width:100%}}
    `;
    document.head.append(style);
  }

  async function openShare(title, text, source) {
    installCss();
    $("#t2UniversalShareModal")?.remove();
    const root = pageRoot(source) || overviewRoot();
    const bodyText = text || cleanText(root);
    const modal = document.createElement("div");
    modal.id = "t2UniversalShareModal";
    modal.className = "t2-share-modal";
    modal.innerHTML = `
      <section class="t2-share-card" role="dialog" aria-modal="true" aria-labelledby="t2ShareTitle">
        <h3 id="t2ShareTitle"></h3>
        <div class="t2-share-preview-wrap"><img class="t2-share-preview" alt="Prévia da página para compartilhar"></div>
        <div class="t2-share-actions"></div>
        <div class="t2-share-note" role="status">Preparando a imagem completa da página…</div>
      </section>`;
    $("#t2ShareTitle", modal).textContent = `${TEXT.share} — ${title}`;
    document.body.append(modal);
    const preview = $(".t2-share-preview", modal);
    const actions = $(".t2-share-actions", modal);
    const note = $(".t2-share-note", modal);
    let file;
    let previewUrl = "";
    try {
      file = await capturePage(title, root);
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      note.textContent =
        "Página completa pronta, com os filtros, números, gráficos e tabela visíveis.";
    } catch (error) {
      console.error("[Stay share capture]", error);
      note.textContent =
        "Não foi possível preparar a imagem desta página agora.";
    }

    const button = (label, className, action) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `button ${className}`;
      item.textContent = label;
      item.disabled = !file && label !== TEXT.close && label !== TEXT.copy;
      item.onclick = async () => {
        item.disabled = true;
        try {
          await action();
        } catch (error) {
          if (error?.name !== "AbortError")
            note.textContent =
              "Não foi possível concluir este compartilhamento.";
        } finally {
          item.disabled = false;
        }
      };
      return item;
    };

    const share = button(TEXT.share, "t2-share-primary", async () => {
      if (await nativeShare(file, title, bodyText)) return;
      download(file);
      note.textContent =
        "Este navegador não possui o menu de compartilhamento. A imagem foi baixada.";
    });
    const whatsapp = button(TEXT.whatsapp, "t2-share-whatsapp", () =>
      shareWhatsApp(file, title, bodyText, note),
    );
    const email = button(TEXT.email, "button-secondary", () =>
      shareEmail(file, title, bodyText, note),
    );
    const downloadButton = button(
      TEXT.download,
      "button-secondary",
      () => {
        download(file);
        note.textContent = "Imagem baixada.";
      },
    );
    const copy = button(TEXT.copy, "button-secondary", async () => {
      await copyText(`${title}\n\n${bodyText}`);
      note.textContent = "Dados copiados.";
    });
    const close = button(TEXT.close, "button-secondary", () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      modal.remove();
    });
    actions.append(share, whatsapp, email, downloadButton, copy, close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close.click();
    });
  }

  function titleFor(button, root) {
    if (root?.id === "monthlyReport") return "Relatório financeiro";
    if (
      root?.closest?.('[data-screen-panel="home"]') ||
      root === overviewRoot()
    )
      return "Visão geral";
    if (root?.id === "t2ContractPayments")
      return "Pagamentos, recebimentos e repasses";
    if (root?.id === "t2OwnerPayouts") return "Repasses ao proprietário";
    return (button?.textContent || "Compartilhar")
      .replace(/^↗\s*/, "")
      .trim();
  }

  function standardizeShareButtons() {
    if (document.documentElement.dataset.t2ShareStandard === "4") return;
    document.documentElement.dataset.t2ShareStandard = "4";
    document.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("button,a");
        if (!button || button.closest("#t2UniversalShareModal")) return;
        const label = (button.textContent || "").trim();
        if (
          !/compartilhar/i.test(label) ||
          /whatsapp|imagem|dados/i.test(label)
        )
          return;
        const root = pageRoot(button);
        if (!root) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openShare(titleFor(button, root), cleanText(root), root);
      },
      true,
    );
  }

  function installOverviewButton() {
    const home = overviewRoot();
    if (!home || $("#t2V2Share") || $(".t2-overview-sharebar", home)) return;
    const bar = document.createElement("div");
    bar.className = "t2-overview-sharebar";
    bar.innerHTML =
      '<button type="button" class="button button-secondary">↗ Compartilhar</button>';
    home.prepend(bar);
  }

  function approvedShare(event) {
    const detail = event?.detail || {};
    const root = pageRoot(detail.element) || overviewRoot();
    openShare(
      detail.title || "Compartilhar",
      detail.text || cleanText(root),
      root,
    );
  }

  function boot() {
    installCss();
    window.Test2Share = {
      open: openShare,
      imageFile: capturePage,
      cleanText,
      overviewRoot,
    };
    standardizeShareButtons();
    installOverviewButton();
    window.addEventListener("stay:approved-share", approvedShare);
    window.addEventListener("stay:unified-navigation", () =>
      requestAnimationFrame(installOverviewButton),
    );
    window.addEventListener("stay:scope-change", () =>
      requestAnimationFrame(installOverviewButton),
    );
    [400, 1000, 2000].forEach((delay) =>
      setTimeout(installOverviewButton, delay),
    );
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();

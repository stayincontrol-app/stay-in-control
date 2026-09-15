(() => {
  "use strict";
  const SCOPE = "stay-home-scope-v1";
  const read = (k, f) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null") || f;
    } catch {
      return f;
    }
  };
  function scope() {
    return window.__stayHomeScope || read(SCOPE, {}) || {};
  }
  function syncOwnerPayout() {
    const form = document.querySelector("#t2OwnerPayouts form.t2op-form");
    if (!form) return false;
    const s = scope(),
      owner = form.elements.owner,
      property = form.elements.property;
    if (!owner || !property) return false;
    const ownerSpecific = s.owner && s.owner !== "all";
    if (ownerSpecific) {
      let match =
        [...owner.options].find((o) => String(o.value) === String(s.owner)) ||
        [...owner.options].find(
          (o) => o.textContent.trim() === String(s.owner),
        );
      if (!match && Array.isArray(s.propertyIds) && s.propertyIds.length) {
        for (const o of owner.options) {
          owner.value = o.value;
          owner.dispatchEvent(new Event("change", { bubbles: true }));
          if (
            [...property.options].some((p) =>
              s.propertyIds.map(String).includes(String(p.value)),
            )
          ) {
            match = o;
            break;
          }
        }
      }
      if (match) {
        owner.value = match.value;
        owner.dispatchEvent(new Event("change", { bubbles: true }));
        [...owner.options].forEach((o) => {
          o.hidden = o.value !== match.value;
        });
        owner.disabled = true;
      }
    } else {
      [...owner.options].forEach((o) => (o.hidden = false));
      owner.disabled = false;
    }
    const ids = new Set((s.propertyIds || []).map(String));
    if (ids.size) {
      [...property.options].forEach((o) => {
        o.hidden = !ids.has(String(o.value));
      });
      const wanted =
        s.property && s.property !== "all" ? String(s.property) : "";
      if (
        wanted &&
        [...property.options].some(
          (o) => String(o.value) === wanted && !o.hidden,
        )
      )
        property.value = wanted;
      else {
        const first = [...property.options].find((o) => !o.hidden);
        if (first) property.value = first.value;
      }
    }
    return true;
  }
  function watchOnce(rootSelector, apply) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    if (apply()) return;
    const obs = new MutationObserver(() => {
      if (apply()) obs.disconnect();
    });
    obs.observe(root, { childList: true, subtree: true });
  }
  function sync() {
    watchOnce("#monthlyReport", syncOwnerPayout);
  }
  window.addEventListener("stay:scope-change", sync);
  window.addEventListener("stay:unified-navigation", (e) => {
    if (e.detail?.route === "reports") sync();
  });
  window.addEventListener("pageshow", sync);
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", sync, { once: true });
  else sync();
})();

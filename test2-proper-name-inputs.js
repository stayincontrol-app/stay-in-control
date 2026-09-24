(() => {
  "use strict";

  // Name and address fields are created on several screens after navigation.
  // Delegated events also cover modals that were not present at page load.
  const unwanted = /(?:e-?mail|username|login|usuário|usuario|senha|password|cpf|cnpj|documento|document|passaporte|passport|telefone|phone|celular|whatsapp|site|website|url|link|pix|iban|conta|account|api|token|chave|key|código|codigo|code|número|numero|number|cep|zip|postal|valor|amount|price|preço|preco|data|date|filtro|filter|busca|search|referência|referencia|reference|id\b)/i;
  const names = /(?:nome|name|nombre|prénom|prenom|apellido|surname|sobrenome|proprietário|proprietario|owner|inquilino|tenant|hóspede|hospede|guest|pessoa|person|animal|pet|cachorro|gato|cidade|city|ciudad|ville|stadt|città|citta|rua|street|calle|endereço|endereco|address|adresse|bairro|neighborhood|quartier|estado|state|província|provincia|province|país|pais|country)/i;
  const particles = new Set([
    "da", "de", "do", "das", "dos", "e", "of", "the", "and",
    "del", "di", "du", "des", "la", "le", "les", "y",
  ]);

  function appliesTo(input) {
    if (!input || input.tagName !== "INPUT" || !["", "text"].includes(input.type)) return false;
    if (input.disabled || input.readOnly || input.dataset.autocapitalize === "off") return false;
    const autocomplete = (input.getAttribute("autocomplete") || "").toLowerCase();
    if (/^(name|given-name|family-name|additional-name|street-address|address-line[123]|address-level[12]|country-name)$/.test(autocomplete)) return true;
    const field = input.closest("label, .field, .form-field, .t2-field, .t2pmv2-field, .t2om-field");
    const label = [
      ...(input.labels || []),
      ...(field?.querySelectorAll("label, legend") || []),
    ].map((el) => el.textContent || "").join(" ");
    const description = [input.id, input.name, input.getAttribute("placeholder"), input.getAttribute("aria-label"), label]
      .filter(Boolean).join(" ");
    return names.test(description) && !unwanted.test(description);
  }

  function format(value, language = document.documentElement.lang || "pt-BR") {
    let wordNumber = 0;
    return value.replace(/\p{L}[\p{L}\p{M}]*/gu, (word) => {
      const minor = wordNumber++ > 0 && particles.has(word.toLocaleLowerCase(language));
      if (minor && word === word.toLocaleLowerCase(language)) return word;
      return word[0].toLocaleUpperCase(language) + word.slice(1);
    });
  }

  function update(input) {
    if (!appliesTo(input)) return;
    input.setAttribute("autocapitalize", "words");
    const before = input.value;
    const after = format(before);
    if (after === before) return;
    const start = input.selectionStart, end = input.selectionEnd;
    input.value = after;
    if (start !== null && end !== null) {
      try {
        input.setSelectionRange(format(before.slice(0, start)).length, format(before.slice(0, end)).length);
      } catch {}
    }
  }

  document.addEventListener("focusin", (event) => {
    if (appliesTo(event.target)) event.target.setAttribute("autocapitalize", "words");
  });
  document.addEventListener("input", (event) => {
    if (!event.isComposing) update(event.target);
  });
  document.addEventListener("change", (event) => update(event.target));
  document.addEventListener("compositionend", (event) => update(event.target));
})();

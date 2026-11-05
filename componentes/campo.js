function Campo(id, etiqueta, tipo = 'text') {
  return `<label class="campo">${etiqueta}
    <input id="${id}" type="${tipo}">
    <small class="error" id="error-${id}"></small>
  </label>`;
}


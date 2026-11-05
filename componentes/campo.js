function Campo(id, etiqueta, tipo = 'text', opciones = {}) {
  const atributos = [
    `type="${tipo}"`,
    `id="${id}"`,
    `name="${id}"`,
    'required',
    `aria-describedby="error-${id}"`
  ];

  if (tipo === 'number') {
    atributos.push('min="0"', 'step="any"', 'inputmode="decimal"');
  }
  if (opciones.maxlength) atributos.push(`maxlength="${opciones.maxlength}"`);
  if (opciones.pattern) atributos.push(`pattern="${opciones.pattern}"`);
  if (opciones.inputmode) atributos.push(`inputmode="${opciones.inputmode}"`);
  if (opciones.placeholder) atributos.push(`placeholder="${opciones.placeholder}"`);

  return `<label class="campo" for="${id}">${etiqueta}
    <input ${atributos.join(' ')}>
    <small class="error" id="error-${id}"></small>
  </label>`;
}

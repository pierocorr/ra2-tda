const REQUISITOS_EMPRESA = {
  capacidadDeudaMinima: 1,
  patrimonioOro: 100000,
  patrimonioPlatino: 500000
};

const camposEmpresa = ['razon-social', 'ruc', 'deuda', 'patrimonio', 'capacidad'];

document.getElementById('app').innerHTML = `
  <header class="encabezado">
    <p class="etiqueta">Sistema de evaluación</p>
    <h1>Tarjeta de crédito para empresa</h1>
    <p>Ingresa la información de tu empresa para revisar su elegibilidad.</p>
    <nav><a href="../app1/">Evaluar una persona natural</a></nav>
  </header>
  ${Tarjeta('Datos de la empresa', `
    <div class="rejilla">
      ${Campo('razon-social', 'Nombre / Razón social')}
      ${Campo('ruc', 'RUC (11 dígitos)', 'text', { maxlength: 11, pattern: '[0-9]{11}', inputmode: 'numeric' })}
      ${Campo('deuda', 'Deuda (S/)', 'number')}
      ${Campo('patrimonio', 'Patrimonio (S/)', 'number')}
      ${Campo('capacidad', 'Capacidad de pago (S/)', 'number')}
    </div>
    <div class="acciones">
      ${Boton('Verificar elegibilidad', 'verificarEmpresa()')}
      ${Boton('Limpiar', 'limpiarEmpresa()', 'secundario')}
    </div>
  `)}
  <div id="resultado" aria-live="polite">
    ${Tarjeta('Resultado de la verificación', '<p>Completa todos los campos y selecciona “Verificar elegibilidad”.</p>')}
  </div>
  <div id="tarjetas-disponibles" aria-live="polite"></div>
`;

function valor(id) {
  return document.getElementById(id).value.trim();
}

function mostrarError(id, mensaje) {
  document.getElementById(`error-${id}`).textContent = mensaje;
}

function leerMonto(id, etiqueta) {
  const texto = valor(id);
  if (!texto) {
    mostrarError(id, 'Este campo es obligatorio.');
    return null;
  }
  if (Number(texto) < 0) {
    mostrarError(id, 'El monto no puede ser negativo.');
    return null;
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(texto) || !Number.isFinite(Number(texto))) {
    mostrarError(id, `Ingresa un monto válido para ${etiqueta}.`);
    return null;
  }
  return Number(texto);
}

function tarjetasEmpresa(patrimonio) {
  const niveles = [
    { nombre: 'Clásica', minimo: 0, detalle: 'Una opción para las operaciones cotidianas de tu empresa.' },
    { nombre: 'Oro', minimo: REQUISITOS_EMPRESA.patrimonioOro, detalle: 'Beneficios adicionales para empresas con mayor patrimonio.' },
    { nombre: 'Platino / Black', minimo: REQUISITOS_EMPRESA.patrimonioPlatino, detalle: 'Una categoría premium para empresas con alto patrimonio.' }
  ];
  return niveles
    .filter(nivel => patrimonio >= nivel.minimo)
    .map(nivel => Tarjeta(nivel.nombre, `<p>${nivel.detalle}</p>${nivel.minimo ? `<p class="umbral">Patrimonio requerido: S/ ${nivel.minimo.toLocaleString('es-PE')}</p>` : ''}`))
    .join('');
}

function mostrarResultadoEmpresa(apto, motivos, patrimonio) {
  const estado = apto ? 'APTO' : 'NO APTO';
  const clase = apto ? 'estado-apto' : 'estado-no-apto';
  const lista = motivos.map(motivo => `<li>${motivo}</li>`).join('');
  document.getElementById('resultado').innerHTML = Tarjeta(
    'Resultado de la verificación',
    `<p class="estado ${clase}">${estado}</p><ul>${lista}</ul>`
  );
  document.getElementById('tarjetas-disponibles').innerHTML = Tarjeta(
    'Tarjetas disponibles',
    apto
      ? `<div class="rejilla tarjetas">${tarjetasEmpresa(patrimonio)}</div>`
      : '<p>No hay tarjetas disponibles porque no se cumplen los requisitos.</p>'
  );
}

function verificarEmpresa() {
  camposEmpresa.forEach(id => mostrarError(id, ''));
  const errores = [];

  if (!valor('razon-social')) {
    mostrarError('razon-social', 'Este campo es obligatorio.');
    errores.push('El nombre o razón social es obligatorio.');
  }

  const ruc = valor('ruc');
  if (!ruc) {
    mostrarError('ruc', 'Este campo es obligatorio.');
    errores.push('El RUC es obligatorio.');
  } else if (!/^\d{11}$/.test(ruc)) {
    mostrarError('ruc', 'El RUC debe tener exactamente 11 dígitos.');
    errores.push('El RUC debe tener exactamente 11 dígitos.');
  }

  const deuda = leerMonto('deuda', 'deuda');
  const patrimonio = leerMonto('patrimonio', 'patrimonio');
  const capacidad = leerMonto('capacidad', 'capacidad de pago');
  if (deuda === null) errores.push('Revisa el monto de deuda.');
  if (patrimonio === null) errores.push('Revisa el monto de patrimonio.');
  if (capacidad === null) errores.push('Revisa la capacidad de pago.');

  if (errores.length) {
    mostrarResultadoEmpresa(false, [...new Set(errores)], 0);
    return;
  }

  const motivos = [];
  if (patrimonio <= deuda) {
    motivos.push('El patrimonio debe ser mayor que la deuda.');
  }
  if (capacidad < deuda * REQUISITOS_EMPRESA.capacidadDeudaMinima) {
    motivos.push(`La capacidad de pago debe cubrir al menos ${REQUISITOS_EMPRESA.capacidadDeudaMinima * 100}% de la deuda.`);
  }
  const apto = motivos.length === 0;
  if (apto) {
    motivos.push('Cumples los requisitos de identificación, patrimonio y capacidad de pago.');
  }
  mostrarResultadoEmpresa(apto, motivos, patrimonio);
}

function limpiarEmpresa() {
  camposEmpresa.forEach(id => {
    document.getElementById(id).value = '';
    mostrarError(id, '');
  });
  document.getElementById('resultado').innerHTML = Tarjeta(
    'Resultado de la verificación',
    '<p>Completa todos los campos y selecciona “Verificar elegibilidad”.</p>'
  );
  document.getElementById('tarjetas-disponibles').innerHTML = '';
}

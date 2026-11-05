const REQUISITOS_PERSONA = {
  ingresoMinimo: 1500,
  limiteDeuda: 0.4,
  ingresoOro: 5000,
  ingresoPlatino: 10000
};

const camposPersona = [
  'nombres', 'apellidos', 'dni', 'emision', 'caducidad',
  'digito', 'ocupacion', 'ingresos', 'deudas'
];

document.getElementById('app').innerHTML = `
  <header class="encabezado">
    <p class="etiqueta">Sistema de evaluación</p>
    <h1>Tarjeta de crédito para persona natural</h1>
    <p>Completa tus datos para conocer tu resultado y las tarjetas disponibles.</p>
    <nav><a href="../app2/">Evaluar una empresa</a></nav>
  </header>
  ${Tarjeta('Datos personales y financieros', `
    <div class="rejilla">
      ${Campo('nombres', 'Nombres')}
      ${Campo('apellidos', 'Apellidos')}
      ${Campo('dni', 'DNI (8 dígitos)', 'text', { maxlength: 8, pattern: '[0-9]{8}', inputmode: 'numeric' })}
      ${Campo('digito', 'Dígito de verificación (1 dígito)', 'text', { maxlength: 1, pattern: '[0-9]', inputmode: 'numeric' })}
      ${Campo('emision', 'Fecha de emisión del DNI', 'date')}
      ${Campo('caducidad', 'Fecha de caducidad del DNI', 'date')}
      ${Campo('ocupacion', 'Ocupación')}
      ${Campo('ingresos', 'Ingresos mensuales (S/)', 'number')}
      ${Campo('deudas', 'Deudas (S/)', 'number')}
    </div>
    <div class="acciones">
      ${Boton('Verificar elegibilidad', 'verificarPersona()')}
      ${Boton('Limpiar', 'limpiarPersona()', 'secundario')}
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

function tarjetasPersona(ingresos) {
  const niveles = [
    { nombre: 'Clásica', minimo: REQUISITOS_PERSONA.ingresoMinimo, detalle: 'Una opción práctica para tus compras cotidianas.' },
    { nombre: 'Oro', minimo: REQUISITOS_PERSONA.ingresoOro, detalle: 'Beneficios adicionales para un mayor nivel de ingresos.' },
    { nombre: 'Platino / Black', minimo: REQUISITOS_PERSONA.ingresoPlatino, detalle: 'Una categoría premium para ingresos altos.' }
  ];
  return niveles
    .filter(nivel => ingresos >= nivel.minimo)
    .map(nivel => Tarjeta(nivel.nombre, `<p>${nivel.detalle}</p><p class="umbral">Ingreso requerido: S/ ${nivel.minimo.toLocaleString('es-PE')} mensuales</p>`))
    .join('');
}

function mostrarResultadoPersona(apto, motivos, ingresos) {
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
      ? `<div class="rejilla tarjetas">${tarjetasPersona(ingresos)}</div>`
      : '<p>No hay tarjetas disponibles porque no se cumplen los requisitos.</p>'
  );
}

function verificarPersona() {
  camposPersona.forEach(id => mostrarError(id, ''));
  const errores = [];

  ['nombres', 'apellidos', 'ocupacion'].forEach(id => {
    if (!valor(id)) {
      mostrarError(id, 'Este campo es obligatorio.');
      errores.push('Completa todos los datos obligatorios.');
    }
  });

  const dni = valor('dni');
  if (!dni) {
    mostrarError('dni', 'Este campo es obligatorio.');
    errores.push('El DNI es obligatorio.');
  } else if (!/^\d{8}$/.test(dni)) {
    mostrarError('dni', 'El DNI debe tener exactamente 8 dígitos.');
    errores.push('El DNI debe tener exactamente 8 dígitos.');
  }

  const digito = valor('digito');
  if (!digito) {
    mostrarError('digito', 'Este campo es obligatorio.');
    errores.push('El dígito de verificación es obligatorio.');
  } else if (!/^\d$/.test(digito)) {
    mostrarError('digito', 'Ingresa un solo dígito.');
    errores.push('El dígito de verificación debe contener un solo número.');
  }

  const emision = valor('emision');
  const caducidad = valor('caducidad');
  const hoy = new Date();
  const hoyLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  if (!emision) {
    mostrarError('emision', 'Selecciona la fecha de emisión.');
    errores.push('La fecha de emisión es obligatoria.');
  } else if (emision > hoyLocal) {
    mostrarError('emision', 'La fecha de emisión no puede ser futura.');
    errores.push('La fecha de emisión no puede ser futura.');
  }
  if (!caducidad) {
    mostrarError('caducidad', 'Selecciona la fecha de caducidad.');
    errores.push('La fecha de caducidad es obligatoria.');
  } else if (caducidad <= hoyLocal || (emision && caducidad <= emision)) {
    mostrarError('caducidad', 'Debe ser posterior a hoy y a la fecha de emisión.');
    errores.push('El DNI debe estar vigente y caducar después de su fecha de emisión.');
  }

  const ingresos = leerMonto('ingresos', 'ingresos mensuales');
  const deudas = leerMonto('deudas', 'deudas');
  if (ingresos === null) errores.push('Revisa el monto de ingresos mensuales.');
  if (deudas === null) errores.push('Revisa el monto de deudas.');

  if (errores.length) {
    mostrarResultadoPersona(false, [...new Set(errores)], 0);
    return;
  }

  const motivos = [];
  if (ingresos <= REQUISITOS_PERSONA.ingresoMinimo) {
    motivos.push(`Los ingresos mensuales deben ser mayores a S/ ${REQUISITOS_PERSONA.ingresoMinimo.toLocaleString('es-PE')}.`);
  }
  if (deudas >= ingresos * REQUISITOS_PERSONA.limiteDeuda) {
    motivos.push(`Las deudas deben ser menores al ${REQUISITOS_PERSONA.limiteDeuda * 100}% de los ingresos.`);
  }
  const apto = motivos.length === 0;
  if (apto) {
    motivos.push('Cumples los requisitos de identidad, vigencia del DNI, ingresos y nivel de deuda.');
  }
  mostrarResultadoPersona(apto, motivos, ingresos);
}

function limpiarPersona() {
  camposPersona.forEach(id => {
    document.getElementById(id).value = '';
    mostrarError(id, '');
  });
  document.getElementById('resultado').innerHTML = Tarjeta(
    'Resultado de la verificación',
    '<p>Completa todos los campos y selecciona “Verificar elegibilidad”.</p>'
  );
  document.getElementById('tarjetas-disponibles').innerHTML = '';
}

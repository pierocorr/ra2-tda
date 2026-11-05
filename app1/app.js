let clics = 0;
 
function contar() {
  clics++;
  document.getElementById('contador').textContent = 'Clics: ' + clics;
}
function reiniciar() {
  clics = 0;
  document.getElementById('contador').textContent = 'Clics: 0';
}
 
document.getElementById('app').innerHTML = `
  <h1>Nivel 1: componentes</h1>
  ${Tarjeta('Registro', `
    ${Campo('nombres', 'Nombres', 'text')}
    ${Campo('apellidos', 'Apellidos', 'text')}
    ${Campo('telefono', 'Teléfono', 'text')}
    ${Boton('Guardar', 'guardar()')}
  `)}
`;


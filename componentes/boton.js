function Boton(texto, accion, tipo=''){
    return `<button class="boton ${tipo}" onclick="${accion}">${texto}</button>`;
}

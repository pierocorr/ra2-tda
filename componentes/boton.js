function Boton(texto, accion, tipo=''){
    return `<button type="button" class="boton ${tipo}" onclick="${accion}">${texto}</button>`;
}

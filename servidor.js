const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = __dirname;
const puerto = Number(process.env.PORT) || 3000;
const tipos = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript'
};

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Método no permitido.');
  }

  let ruta;
  try {
    ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end('La dirección solicitada no es válida.');
  }

  if (ruta === '/') ruta = '/app1/';
  if (ruta.endsWith('/')) ruta += 'index.html';

  const archivo = path.resolve(raiz, `.${ruta}`);
  const rutaRaiz = raiz.endsWith(path.sep) ? raiz : raiz + path.sep;
  if (archivo !== raiz && !archivo.startsWith(rutaRaiz)) {
    res.writeHead(403);
    return res.end('Acceso denegado.');
  }

  fs.readFile(archivo, (error, datos) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('No se encontró el recurso solicitado.');
    }

    const extension = path.extname(archivo);
    res.writeHead(200, {
      'Content-Type': `${tipos[extension] || 'application/octet-stream'}; charset=utf-8`
    });
    res.end(req.method === 'HEAD' ? undefined : datos);
  });
}).listen(puerto, () => console.log(`Abre http://localhost:${puerto}/`));

const http = require('http');
const fs = require('fs');
const tipos = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
 
http.createServer((req, res) => {
  const ruta = '.' + (req.url.endsWith('/') ? req.url + 'index.html' : req.url);
  fs.readFile(ruta, (error, datos) => {
    if (error) { res.writeHead(404); return res.end('No encontrado: ' + ruta); }
    const extension = ruta.slice(ruta.lastIndexOf('.'));
    res.writeHead(200, { 'Content-Type': (tipos[extension] || 'text/plain') + '; charset=utf-8' });
    res.end(datos);
  });
}).listen(3000, () => console.log('Abre http://localhost:3000/app1/'));

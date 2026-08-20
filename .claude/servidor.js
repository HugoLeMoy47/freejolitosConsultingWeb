// Servidor estático de desarrollo. Imita a Cloudflare Pages: /servicios → servicios.html
// Vive en .claude/ porque Pages ignora los directorios que empiezan con punto.
// Sin dependencias. Arrancar con:  node .claude/servidor.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const PUERTO = Number(process.argv[2]) || 4321;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (ruta.endsWith("/")) ruta += "index.html";

    let archivo = path.join(RAIZ, ruta);
    // Nada fuera de la raíz del sitio.
    if (!archivo.startsWith(RAIZ)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403");
      return;
    }
    // URL limpia: /servicios → servicios.html
    if (!path.extname(archivo) && fs.existsSync(archivo + ".html")) archivo += ".html";

    fs.readFile(archivo, (err, datos) => {
      if (err) {
        console.log(`404 ${ruta}`);
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404</h1>");
        return;
      }
      // Añadir cabeceras de seguridad útiles en el servidor de desarrollo
      // (no sustituye las políticas que deban aplicarse en el edge/producción).
      res.writeHead(200, {
        "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream",
        // Sin esto Chrome cachea el CSS y no se ven los cambios durante dev.
        "Cache-Control": "no-store, must-revalidate",
        // Hardening básico para desarrollo local — ajustar según producción.
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "DENY",
        "Permissions-Policy": "interest-cohort=()",
        "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self';",
      });
      res.end(datos);
    });
  })
  .listen(PUERTO, () => console.log(`Freejolitos en http://localhost:${PUERTO}`));


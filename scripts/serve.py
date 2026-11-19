#!/usr/bin/env python3
"""
Servidor de desarrollo local para Freejolitos Consultores.
Soporta URLs limpias (sin .html) como en Cloudflare Pages:
  /como-trabajo -> como-trabajo.html
  /servicios    -> servicios.html
"""
import http.server
import socketserver
import os
import sys

PORT = 8088

class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Primero obtenemos la ruta normal
        translated = super().translate_path(path)
        # Si no existe y con .html sí existe, usamos esa
        if not os.path.exists(translated) and os.path.exists(translated + ".html"):
            return translated + ".html"
        return translated

def run():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(repo_root)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanUrlHandler) as httpd:
        print(f"\n[OK] Servidor Freejolitos corriendo en: http://localhost:{PORT}")
        print("  - URLs limpias activas (p.ej. /como-trabajo, /servicios, /productos)")
        print("  - Presiona Ctrl+C para detenerlo.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")

if __name__ == "__main__":
    run()

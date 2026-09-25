# Dantel Davetiye — Copyright (c) 2026 livvaa. Tüm hakları saklıdır.
# 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile korunur. Yazılı izin olmadan
# kopyalanamaz, uyarlanamaz, başka ad ya da alan adıyla yayımlanamaz.
# All rights reserved. Ayrıntılar / Details: LICENSE
"""Davetiyeyi yerel sunucuda açar.

Kullanım:  python serve.py          (varsayılan port 8000)
           python serve.py 8080     (başka port)
"""
import functools
import http.server
import socket
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    # Windows kayıt defterindeki hatalı MIME eşleşmelerine (ör. .js -> text/plain) güvenmemek için
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".svg": "image/svg+xml",
        ".mp3": "audio/mpeg",
    }

    def end_headers(self):
        # Dosyada yapılan değişiklikler sayfa yenilenince hemen görünsün
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def lan_ip():
    """Aynı ağdaki telefondan açmak için bilgisayarın yerel IP adresi."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # paket gönderilmez, yalnızca arayüz seçilir
            return s.getsockname()[0]
    except OSError:
        return None


def main():
    handler = functools.partial(Handler, directory=str(ROOT))
    try:
        httpd = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler)
    except OSError:
        sys.exit(f"{PORT} portu kullanımda. Başka bir port deneyin: python serve.py 8080")

    url = f"http://localhost:{PORT}/"
    print(f"Davetiye yayında: {url}")
    ip = lan_ip()
    if ip:
        print(f"Aynı Wi-Fi'daki telefondan: http://{ip}:{PORT}/")
    print("Durdurmak için Ctrl+C")
    webbrowser.open(url)

    with httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu durduruldu.")


if __name__ == "__main__":
    main()

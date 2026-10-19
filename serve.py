"""Serve the static site with the exact routes declared in vercel.json."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
ROUTES = {item["source"]: item["destination"] for item in json.loads((ROOT / "vercel.json").read_text())["rewrites"]}

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.rewrite()
        super().do_GET()

    def do_HEAD(self):
        self.rewrite()
        super().do_HEAD()

    def rewrite(self):
        parsed = urlsplit(self.path)
        self.path = ROUTES.get(parsed.path, parsed.path)
        if parsed.query:
            self.path += "?" + parsed.query

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(ROOT)))
    print(f"Serving Familia Naves on port {args.port}", flush=True)
    server.serve_forever()

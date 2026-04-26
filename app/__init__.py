from pathlib import Path

server_app = Path(__file__).resolve().parent.parent / "server" / "app"
__path__.append(str(server_app))

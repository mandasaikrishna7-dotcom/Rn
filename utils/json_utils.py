import json
from pathlib import Path


def read_json(path):
    """Read a JSON file, transparently handling UTF-8 BOM if present.

    Uses ``utf-8-sig`` encoding: it behaves identically to ``utf-8`` for
    normal files but silently strips the leading BOM character (U+FEFF) that
    Windows tools (e.g. Notepad, Excel) sometimes prepend.  Returns None if
    the file does not exist or cannot be parsed.
    """
    p = Path(path)
    if not p.exists():
        return None
    try:
        with open(p, "r", encoding="utf-8-sig") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        import logging
        logging.getLogger(__name__).error(
            "JSON parse error in %s: %s", p, exc
        )
        return None

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "outputs"
INTERMEDIATE_DIR = OUTPUT_DIR / "intermediate"
SOURCE_REGISTRY_PATH = BASE_DIR / "config" / "source_registry.json"

# Runtime directories must exist: the FastAPI app mounts /outputs as static
# files and the state store persists under outputs/user_state.
for _dir in (OUTPUT_DIR, INTERMEDIATE_DIR, OUTPUT_DIR / "user_state"):
    _dir.mkdir(parents=True, exist_ok=True)

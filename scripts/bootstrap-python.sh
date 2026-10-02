#!/usr/bin/env bash
# Git Bash on Windows x86_64. Project-only Python; no global PATH/registry changes.
set -euo pipefail

task_script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
task_root="$(cd -- "$task_script_dir/.." && pwd)"
cd -- "$task_root"

case "$(uname -s)" in
  MINGW*|MSYS*) ;;
  *) printf '%s\n' 'Use Git Bash on Windows x86_64, or the pinned Linux Docker image.' >&2; exit 1 ;;
esac
if [[ "$(uname -m)" != 'x86_64' ]]; then
  printf '%s\n' 'This bootstrap supports Windows x86_64 only.' >&2
  exit 1
fi
if ! command -v uv >/dev/null 2>&1; then
  printf '%s\n' 'uv 0.12.5 is required. Open a new Git Bash after installing uv.' >&2
  exit 1
fi

task_uv_version="$(uv --version | tr -d '\r')"
case "$task_uv_version" in
  'uv 0.12.5'|'uv 0.12.5 '*) ;;
  *) printf '%s\n' 'uv 0.12.5 is required; do not upgrade the global installation automatically.' >&2; exit 1 ;;
esac

task_version="$(tr -d '\r\n' < .python-version)"
task_python_exe="$task_root/.tools/python/cpython-$task_version-windows-x86_64-none/python.exe"
task_metadata='https://raw.githubusercontent.com/astral-sh/uv/7e9d252e37065168cd3ed8419bb31da512133604/crates/uv-python/download-metadata.json'
if [[ ! -f "$task_python_exe" ]]; then
  uv python install "$task_version" --install-dir .tools/python --no-bin --no-registry \
    --python-downloads-json-url "$task_metadata"
fi
task_actual_version="$("$task_python_exe" --version | tr -d '\r')"
if [[ "$task_actual_version" != "Python $task_version" ]]; then
  printf '%s\n' 'The project Python interpreter does not match .python-version.' >&2
  exit 1
fi
uv sync --locked --python "$(cygpath -w "$task_python_exe")"
printf 'Project Python ready: %s\n' "$task_actual_version"

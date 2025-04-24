#!/bin/bash
set -ouex pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" > /dev/null 2>&1; pwd -P)"
TEMP_DIR="$SCRIPT_DIR/.temp"

if [[ -e "$TEMP_DIR" ]]; then
  rm -rf "$TEMP_DIR"
fi

mkdir "$TEMP_DIR"

arch="x64"
pkg="bun-linux-$arch"
repo="oven-sh/bun"
bin="bun"

file="$pkg.zip"
url="https://github.com/$repo/releases/latest/download/$file"

file_path="$TEMP_DIR/$file"
bin_path="$TEMP_DIR/$pkg/$bin"
out_path="/usr/bin/$bin"

wget -qO "$file_path" "$url"
unzip -qod "$TEMP_DIR" "$file_path"
chmod +x "$bin_path"
mv "$bin_path" "$out_path"

BUN="$out_path"

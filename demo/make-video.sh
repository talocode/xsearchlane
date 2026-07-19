#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

python3 gen-architecture.py
python3 gen-frames.py

# Concatenate frames in scene order into one mp4
list=$(mktemp)
trap 'rm -f "$list"' EXIT

# Collect frames sorted by scene then index
find frames -name 'scene*.png' | sort > "$list.files"
# ffmpeg concat needs a special list if we use image2 pattern — use pattern sequence via filter

# Rename into sequential %06d for ffmpeg
seqdir=$(mktemp -d)
trap 'rm -rf "$seqdir" "$list" "$list.files"' EXIT
i=0
while IFS= read -r f; do
  printf -v name '%06d.png' "$i"
  ln -sf "$(pwd)/$f" "$seqdir/$name"
  i=$((i + 1))
done < "$list.files"

echo "Encoding $i frames..."
ffmpeg -y -hide_banner -loglevel error \
  -framerate 30 \
  -i "$seqdir/%06d.png" \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -preset medium \
  -movflags +faststart \
  xsearchlane-demo.mp4

ls -lh xsearchlane-demo.mp4 architecture.png
echo "OK"

#!/usr/bin/env bash
# Used during image build and from preferRpmfusionBaseurlOverMetalink. Later
# rpm-ostree layers can reinstall rpmfusion release RPMs and restore metalink
# .repo files; a final build step re-runs this so client upgrades work.
set -euo pipefail

echo "RPM Fusion: preferring baseurl over metalink (empty metalink in the wild)."

for f in /etc/yum.repos.d/rpmfusion-*.repo; do
  [ -e "$f" ] || continue
  if ! grep -q "^#baseurl=http://download1.rpmfusion.org/" "$f" 2>/dev/null; then
    continue
  fi
  sed -i \
    -e "s/^metalink=/#metalink=/" \
    -e "s|^#baseurl=http://download1.rpmfusion.org/|baseurl=https://download1.rpmfusion.org/|" \
    "$f"
done

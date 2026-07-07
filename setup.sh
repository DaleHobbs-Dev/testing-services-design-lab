#!/usr/bin/env bash
# Installs optional headless-browser testing tooling for this repo.
#
# The site itself has zero dependencies -- open index.html or serve the
# folder with any static file server and it works. This script is only
# needed if you want to run automated Playwright checks against it.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "==> Installing npm dependencies (Playwright)..."
npm install

echo "==> Downloading the Playwright Chromium browser..."
npx playwright install chromium

echo "==> Installing Chromium's system libraries..."
if npx playwright install-deps chromium 2>/tmp/pw-install-deps.log; then
    echo "==> System libraries installed via apt (sudo)."
else
    echo "==> No sudo access available -- downloading the required .deb packages"
    echo "    without installing them system-wide (Debian/Ubuntu only)."

    LIBS_DIR="$(pwd)/.local-deps"
    mkdir -p "$LIBS_DIR/debs" "$LIBS_DIR/extracted"

    PACKAGES="libnspr4 libnss3 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 \
libcups2t64 libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 \
libxfixes3 libxrandr2 libpango-1.0-0 libcairo2 libatspi2.0-0t64 \
libxshmfence1 libx11-xcb1"

    (cd "$LIBS_DIR/debs" && apt-get download $PACKAGES)

    for deb in "$LIBS_DIR"/debs/*.deb; do
        dpkg-deb -x "$deb" "$LIBS_DIR/extracted"
    done

    LIB_PATH="$LIBS_DIR/extracted/usr/lib/x86_64-linux-gnu"
    echo "export LD_LIBRARY_PATH=\"$LIB_PATH:\${LD_LIBRARY_PATH:-}\"" > "$LIBS_DIR/env.sh"

    echo ""
    echo "==> System libraries extracted locally to .local-deps/ (nothing installed system-wide)."
    echo "==> Before running any headless browser script, load them with:"
    echo "        source .local-deps/env.sh"
fi

echo ""
echo "==> Done. Verify Chromium launches with:"
echo "        node -e \"require('playwright').chromium.launch({args:['--no-sandbox']}).then(b=>b.close()).then(()=>console.log('Chromium OK'))\""

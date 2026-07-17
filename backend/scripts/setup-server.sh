#!/usr/bin/env bash
# Initial server setup for the NexTB API (Node.js + systemd).
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/nextb-web}"
API_DIR="$REPO_DIR/backend"

echo "==> Install Node.js 22 (if missing)..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Clone or update repository..."
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone https://github.com/rocristoi/nextb-web.git "$REPO_DIR"
else
  git -C "$REPO_DIR" pull --ff-only
fi

echo "==> Install dependencies..."
cd "$REPO_DIR"
npm ci
npm run gtfs:prepare --workspace=backend || true

echo "==> Configure environment..."
if [ ! -f "$API_DIR/.env" ]; then
  cp "$API_DIR/.env.example" "$API_DIR/.env"
  echo "Edit $API_DIR/.env with your secrets before starting the API."
fi

if [ -f "$API_DIR/deploy/systemd/nextb-api.service" ]; then
  echo "==> Install systemd unit..."
  echo "  Update User= and WorkingDirectory= in deploy/systemd/nextb-api.service if needed."
  sudo cp "$API_DIR/deploy/systemd/nextb-api.service" /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable nextb-api
fi

echo "Done. Next steps:"
echo "  1. Edit $API_DIR/.env"
echo "  2. sudo systemctl start nextb-api"
echo "  3. Point your reverse proxy at http://127.0.0.1:8080"

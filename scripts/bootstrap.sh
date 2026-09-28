#!/usr/bin/env bash
# One-time setup: generates the native iOS/Android projects with the official RN
# CLI, keeps our src/ + App.tsx, and installs dependencies.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f package.json ]; then
  echo "Already bootstrapped (package.json exists). Run: npm install"
  exit 0
fi

npx @react-native-community/cli@latest init TripareDogBreeds --directory .rn-template --skip-git-init

for f in android ios package.json app.json index.js babel.config.js metro.config.js tsconfig.json \
         Gemfile .watchmanconfig .prettierrc .eslintrc.js jest.config.js .gitignore; do
  if [ -e ".rn-template/$f" ] && [ ! -e "$f" ]; then cp -R ".rn-template/$f" "$f"; fi
done
rm -rf .rn-template

npm install \
  @react-native-async-storage/async-storage \
  @react-native-community/netinfo \
  zustand \
  @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  @d11/react-native-fast-image

if [ "$(uname)" = "Darwin" ]; then
  (cd ios && (bundle install && bundle exec pod install || pod install))
fi
echo "Done. Next: cp .env.example .env && npm run ios   (or npm run android)"

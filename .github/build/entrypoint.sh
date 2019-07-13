#!/bin/sh

echo "Build hexo blog"

git submodule update --init --recursive

yarn
yarn build

cd public
remote_repo="https://${CO_USER}:${CO_TOKEN}@${CO_REF}.git" && \
git init && \
git config user.name "${CO_USER}" && \
git config user.email "${CO_EMAIL}" && \
git add . && \
git commit -m "GitHub Actions 自动部署" && \
git push --force --quiet $remote_repo master:master && \
cd ../
echo "👍 DEPLOY SUCCESS!"

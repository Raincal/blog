#!/bin/sh

echo "[Custom] Build hexo blog"

git submodule update --init --recursive

cp .custom/_firebase.yml source/_data

yarn

yarn build
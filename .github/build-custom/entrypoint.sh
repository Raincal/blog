#!/bin/sh

echo "[Custom] Build hexo blog"

cp .custom/_firebase.yml source/_data

yarn

yarn build
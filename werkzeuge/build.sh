#!/bin/sh
# Builds the standalone page (with web-app manifest + icons) from goetterwacht.html
# usage: ./build.sh <version>  -> Goetterwacht_v<version>.html and ../goetterwacht-repo/index.html
V="$1"
{ printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-180.png">\n'
  printf '<meta name="theme-color" content="#070b12">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Götterwacht">\n'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
  cat goetterwacht.html; printf '\n</body>\n</html>\n'; } > "Goetterwacht_v$V.html"
cp "Goetterwacht_v$V.html" ../goetterwacht-repo/index.html
cp goetterwacht.html ../goetterwacht-repo/quelle-claude-artifact.html

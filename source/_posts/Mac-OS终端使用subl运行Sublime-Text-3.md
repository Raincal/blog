---
title: Mac OS终端使用subl运行Sublime Text 3
urlname: launch-sublime-text-from-command-line
date: 2015-05-09 05:49:56
tags: [macOS, Sublime, Editor]
---
1.添加link
``` bash
ln -s /Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl
```

2.编辑PATH
``` bash
vim ~/.bash_profile
```

3.添加PATH
``` bash
export PATH=/usr/local/bin:$PATH
```

``` bash
esc -> shift + : -> wq保存退出
```

4.应用
``` bash
source ~/.bash_profile
```
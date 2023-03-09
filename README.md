## Overview

AlliumWorks is a development platform for Allium.

**NOTE:** This repo was uploaded from a fairly old branch and may not currently work with Node versions later than Node.js 12.x

## Building

Currently, the build process is rather hacky.

The [Allium](https://github.com/dclipp/allium) and [yfs](http://github.com/dclipp/yfs) projects must be cloned in the parent directory.

The directory layout should look something like this:

```
+-- allium
    | ...
+-- alliumworks <-- run from here
    | archiver
    | cm4a-v2
    | debugger
    | platform
    | shell-ui
    | shell2
    | web-ide
    | ...
+-- yfs
    | ...
```

First, build the `allium` project using instructions provided in that repo.

Then, build the `alliumworks` repo by running the following command from the `alliumworks` directory:
- [*nix] `sh build-all`
- [Windows] `type build-all | cmd`

Note that you do not have to manually build `yfs` because it is included in the build script.

## Demo

Visit https://allium.works/wide/ to see an alpha version of the `web-ide` live (last release: 05/03/21)

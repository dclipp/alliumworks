# Build & Integration

1. Execute `npm run pkgbuild`
2. In the target package, install with `npm i <path to cm4a-v2>`
3. The `dist/index.js` file should be referenced by the target package as a page script
4. All of the stylesheets in `styles` should be imported by the target package (i.e. as `link` elements or raw CSS)
5. The module also includes a declaration file for type hints

# Process Overview

1. `webpack`
    - Entry point: `cmodule.js`
    - Packages `src/*` and `ext/*` as a minified browser module exposing variable `cm4a_v2`:
        - `cm4a_v2_Type.CModule`
        - `cm4a_v2_Type.Tracer`
    - Output written to `dist/index.js`
2. Copy files
    - Copies declaration file `surface.d.ts` to `dist/index.d.ts`

- Declaration (`surface.d.ts`) must be manually edited when adding new public features
- When styles are updated, they must also be manually updated in all target packages

Test with `index2.html`
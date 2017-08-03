# Swagger TypeScript Interface Generator

This is a small VSCode extension to generate TS interfaces from the swagger specification. It will generate all the interfaces and put them in `Swagger.ts` file in your working directory.

## Requirements

Apart from TypeScript, the extension requires the following libraries to work:
- [Immutable](https://facebook.github.io/immutable-js) : `npm install --save immutable`

Though there are other dependencies, the extension takes care of them for you.

## Current Limitations

Currently, the generation of interfaces only goes one level deep. I'm working on full recursive implementation. Contributions are welcome!


**Enjoy!**
declare module '*.png' {
    const content: never;
    export default content;
}

interface Window {
    game: import('pixi.js').Application;
}

// import { Emitter, Group } from '@armathai/spe';
import { Clock, PerspectiveCamera, TextureLoader, Vector3, WebGLRenderer } from 'three';

import Stats from 'stats.js';
import { SceneBase } from './scene-base';
import { FountainScene } from './scenes/fountain-scene';

new (class {
    private _loader: TextureLoader;
    private _renderer: WebGLRenderer;
    private _camera: PerspectiveCamera;
    private _scene: SceneBase;
    private _clock: Clock;
    private _stats: Stats;

    public constructor() {
        this._initialize();
    }

    private _initialize = async (): Promise<void> => {
        this._initThreeApp();
        this._onResize();

        // LISTENERS
        window.addEventListener('resize', this._onResize, false);

        setTimeout(this._animate, 0);
    };

    private _initThreeApp = async (): Promise<void> => {
        // LOADER
        this._loader = new TextureLoader();

        // RENDERER
        this._renderer = new WebGLRenderer({
            // canvas: document.getElementById('game_canvas') as HTMLCanvasElement;,
            alpha: false,
            antialias: false,
            precision: 'highp',
            powerPreference: 'high-performance',
        });
        document.body.appendChild(this._renderer.domElement);
        this._renderer.setPixelRatio(window.devicePixelRatio);

        // CAMERA
        this._camera = new PerspectiveCamera(75, 1, 0.1, 10000);
        this._camera.lookAt(new Vector3(0, 0, 0));

        // SCENE
        this._scene = new FountainScene(this._loader, this._camera, this._renderer);

        // CLOCK
        this._clock = new Clock();

        // STATS
        this._stats = new Stats();
        this._stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this._stats.dom);
    };

    private _onResize = (): void => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(w, h);
    };

    private _animate = (): void => {
        requestAnimationFrame(this._animate);
        this._scene.update(this._clock.getDelta());
        this._renderer.render(this._scene, this._camera);
        this._stats.update();
    };
})();

// import { Emitter, Group } from '@armathai/spe';
import { Clock, Color, PerspectiveCamera, Scene, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three';

import { Emitter, Group } from '@armathai/spe';
import Stats from 'stats.js';
import smokeParticle from '../assets/smoke-particle.png';

new (class {
    private _loader: TextureLoader;
    private _renderer: WebGLRenderer;
    private _camera: PerspectiveCamera;
    private _scene: Scene;
    private _clock: Clock;
    private _stats: Stats;
    private _texture: Texture;

    private _particleGroup: Group;

    public constructor() {
        this._initialize();
    }

    private _initialize = async (): Promise<void> => {
        this._initThreeApp();
        this._onResize();

        // LISTENERS
        window.addEventListener('resize', this._onResize, false);

        await this._loadAssets();
        this._initParticles();

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
        this._camera = new PerspectiveCamera(75, 1, 1, 1000);
        // this._camera.position.set(0, 12, 14);
        this._camera.lookAt(new Vector3(0, 0, 0));

        // SCENE
        this._scene = new Scene();

        // CLOCK
        this._clock = new Clock();

        // STATS
        this._stats = new Stats();
        this._stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this._stats.dom);
    };

    private _loadAssets = async (): Promise<void> => {
        this._texture = await this._loader.loadAsync(smokeParticle);
    };

    private _initParticles = (): void => {
        this._particleGroup = new Group({
            texture: {
                value: this._texture,
            },
        });

        const emitter = new Emitter({
            maxAge: {
                value: 2,
            },
            position: {
                value: new Vector3(0, 0, -50),
                spread: new Vector3(0, 0, 0),
            },
            acceleration: {
                value: new Vector3(0, -10, 0),
                spread: new Vector3(10, 0, 10),
            },
            velocity: {
                value: new Vector3(0, 25, 0),
                spread: new Vector3(10, 7.5, 10),
            },
            color: {
                value: [new Color('white'), new Color('red')],
            },
            size: {
                value: 1,
            },
            particleCount: 2000,
        });

        this._particleGroup.addEmitter(emitter);
        this._scene.add(this._particleGroup.mesh);
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
        this._particleGroup.tick(this._clock.getDelta());
        this._renderer.render(this._scene, this._camera);
        this._stats.update();
    };
})();

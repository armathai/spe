import { Group } from '@armathai/spe';
import { Camera, Scene, TextureLoader, WebGLRenderer } from 'three';

export class SceneBase extends Scene {
    protected particleGroup: Group;

    public constructor(
        protected loader: TextureLoader,
        protected camera: Camera,
        protected renderer: WebGLRenderer,
    ) {
        super();
        this.init();
    }

    public update(dt?: number): void {
        this.particleGroup?.tick(dt);
    }

    protected async init(): Promise<void> {
        await this.loadAssets();
        this.initParticles();
    }

    protected async loadAssets(): Promise<void> {
        // Load assets here
    }

    protected initParticles(): void {
        // Init Particles here
    }
}

import { Emitter, Group } from '@armathai/spe';
import { Distribution } from '@armathai/spe/dist/types';
import { BoxGeometry, Fog, Mesh, MeshBasicMaterial, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class FogScene extends SceneBase {
    private _smokeTexture: Texture;

    public update(dt: number): void {
        super.update(dt);
        const now = Date.now() * 0.0005;
        this.camera.position.x = Math.cos(now) * 50;
        this.camera.position.y = Math.sin(now) * 45;
        this.camera.position.z = Math.sin(now) * 50;
        this.camera.lookAt(this.position);
    }

    protected async init(): Promise<void> {
        await super.init();

        this.fog = new Fog(0x000000, 40, 70);

        const box = new Mesh(new BoxGeometry(20, 20, 20), new MeshBasicMaterial({ wireframe: true, color: 0xffffff }));
        this.add(box);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected initParticles(): void {
        this.particleGroup = new Group({
            texture: {
                value: this._smokeTexture,
            },
            fog: true,
            pixelRatio: this.renderer.getPixelRatio(),
        });
        const emitter = new Emitter({
            type: Distribution.box,
            maxAge: { value: 2 },
            position: {
                value: new Vector3(0, 0, 0),
                spread: new Vector3(20, 20, 20),
            },
            particleCount: 20000,
            isStatic: true,
        });
        this.particleGroup.addEmitter(emitter);
        this.add(this.particleGroup.mesh);
    }
}

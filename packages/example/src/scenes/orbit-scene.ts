import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class OrbitScene extends SceneBase {
    private _smokeTexture: Texture;

    protected async init(): Promise<void> {
        await super.init();
        this.camera.position.z = 50;
        this.camera.lookAt(this.position);

        const box = new Mesh(new BoxGeometry(20, 40, 20), new MeshBasicMaterial({ wireframe: true }));
        this.add(box);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected initParticles(): void {
        this.particleSystem = new ParticleSystem({
            texture: {
                value: this._smokeTexture,
            },
            pixelRatio: this.renderer.getPixelRatio(),
        });
        const emitter = new ParticleEmitter({
            maxAge: {
                value: 5,
            },
            position: {
                value: new Vector3(5, -20, 0),
            },
            velocity: {
                value: new Vector3(0, 5, 0),
            },
            acceleration: {
                spread: new Vector3(1, 0, 0),
            },
            color: {
                value: [new Color('white'), new Color('red')],
            },
            size: {
                value: 1,
            },
            rotation: {
                axis: new Vector3(0, 1, 0),
                angle: Math.PI * 10,
                center: new Vector3(0, 0, 0),
            },
            particleCount: 1000,
            direction: -1,
        });

        this.particleSystem.addEmitter(emitter);
        this.add(this.particleSystem.mesh);
    }
}

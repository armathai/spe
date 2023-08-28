import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import GUI from 'lil-gui';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';
``;
export class ActiveMultiplierScene extends SceneBase {
    private _smokeTexture: Texture;
    private _emitter: ParticleEmitter;

    protected async init(): Promise<void> {
        await super.init();
        this.camera.position.z = 50;
        this.camera.lookAt(this.position);

        this.initGUI();
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
                value: 2,
            },
            position: {
                value: new Vector3(0, 0, 0),
                spread: new Vector3(0, 0, 0),
            },

            acceleration: {
                value: new Vector3(0, -10, 0),
                spread: new Vector3(10, 0, 10),
            },

            velocity: {
                value: new Vector3(0, 15, 0),
                spread: new Vector3(10, 7.5, 10),
            },

            color: {
                value: [new Color('white'), new Color('red')],
            },

            size: {
                value: 1,
            },

            particleCount: 2000,
            activeMultiplier: 1,
        });
        this.particleSystem.addEmitter((this._emitter = emitter));
        this.add(this.particleSystem.mesh);
    }

    protected initGUI(): void {
        const gui = new GUI();
        const emitterFolder = gui.addFolder('Emitter Settings');

        emitterFolder.add(this._emitter, 'activeMultiplier', 0, 1, 0.01).onChange(() => {
            // this._updateMaterial();
        });
    }
}

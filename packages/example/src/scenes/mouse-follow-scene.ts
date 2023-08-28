import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { Color, PerspectiveCamera, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class MouseFollowScene extends SceneBase {
    private _smokeTexture: Texture;
    private _emitter: Emitter;
    private _mouseVector: Vector3 = new Vector3();

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected async init(): Promise<void> {
        await super.init();

        this.camera.position.z = 50;

        document.addEventListener(
            'mousemove',
            (e) => {
                this._mouseVector.set(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1,
                    0.5,
                );

                this._mouseVector.unproject(this.camera);
                this._emitter.position.value = this._emitter.position.value.set(
                    this._mouseVector.x * (this.camera as PerspectiveCamera).fov,
                    this._mouseVector.y * (this.camera as PerspectiveCamera).fov,
                    0,
                );
            },
            false,
        );
    }

    protected initParticles(): void {
        this.particleSystem = new ParticleSystem({
            texture: {
                value: this._smokeTexture,
            },
            pixelRatio: this.renderer.getPixelRatio(),
        });
        const emitter = new ParticleEmitter({
            maxAge: { value: 3 },
            position: {
                value: new Vector3(0, 0, 0),
            },

            acceleration: {
                value: new Vector3(0, -5, 0),
                spread: new Vector3(5, 0, 5),
            },

            velocity: {
                value: new Vector3(0, 10, 0),
            },

            color: {
                value: [new Color(0.5, 0.5, 0.5), new Color()],
                spread: new Vector3(1, 1, 1),
            },
            size: {
                value: [5, 0],
            },

            particleCount: 1500,
        });
        this.particleSystem.addEmitter((this._emitter = emitter));
        this.add(this.particleSystem.mesh);
    }
}

import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { Distribution } from '@armathai/three-particles/dist/types';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class AddRemoveEmitterTestScene extends SceneBase {
    private _smokeTexture: Texture;

    public update(dt?: number): void {
        super.update(dt);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected async init(): Promise<void> {
        await super.init();
        // const now = Date.now() * 0.001;
        this.camera.position.z = 35;
        this.camera.lookAt(this.position);
    }

    protected initParticles(): void {
        this.particleSystem = new ParticleSystem({
            texture: {
                value: this._smokeTexture,
            },
            pixelRatio: this.renderer.getPixelRatio(),
        });

        const emitters: ParticleEmitter[] = [];

        for (let i = 1; i < 2; ++i) {
            const emitter = new ParticleEmitter({
                type: 1,
                maxAge: {
                    value: 1,
                },
                position: {
                    value: new Vector3(-50 + i * 25, 0, 0),
                    radius: 5,
                    spread: new Vector3(3, 3, 3), // i === 1 ? new Vector3(3, 3, 3) : undefined,
                },
                velocity: {
                    value: new Vector3(3, 3, 3),
                    distribution: Distribution.disc,
                },
                color: {
                    value: [new Color('white'), new Color('red')],
                },
                size: {
                    value: 1,
                },
                // particleCount: 10,
                particleCount: 3 - i,
            });

            emitters.push(emitter);
            this.particleSystem.addEmitter(emitter);
        }

        // setTimeout(() => {
        //     // this.particleGroup.removeEmitter(emitters[0]);
        //     const emitter = new ParticleEmitter({
        //         type: 1,
        //         maxAge: {
        //             value: 1,
        //         },
        //         position: {
        //             value: new Vector3(-50 + 2 * 25, 0, 0),
        //             radius: 5,
        //             spread: new Vector3(3, 3, 3), // i === 1 ? new Vector3(3, 3, 3) : undefined,
        //         },
        //         velocity: {
        //             value: new Vector3(3, 3, 3),
        //             distribution: Distribution.disc,
        //         },
        //         color: {
        //             value: [new Color('white'), new Color('red')],
        //         },
        //         size: {
        //             value: 1,
        //         },
        //         particleCount: 1,
        //     });
        //     this.particleGroup.addEmitter(emitter);
        // }, 3200);

        // setTimeout(() => {
        //     // this.particleGroup.addEmitter(emitters[0]);
        // }, 5000);

        this.add(this.particleSystem.mesh);
    }
}

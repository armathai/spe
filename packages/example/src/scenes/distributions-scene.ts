import { Emitter, Group } from '@armathai/spe';
import { Distribution } from '@armathai/spe/dist/types';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class DistributionsScene extends SceneBase {
    private _smokeTexture: Texture;

    public update(dt?: number): void {
        super.update(dt);
        const now = Date.now() * 0.001;
        this.camera.position.x = Math.sin(now) * 75;
        this.camera.position.z = Math.cos(now) * 75;
        this.camera.lookAt(this.position);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected initParticles(): void {
        this.particleGroup = new Group({
            texture: {
                value: this._smokeTexture,
            },
            // pixelRatio: this.renderer.getPixelRatio(),
        });

        const emitters: Emitter[] = [];

        // General distributions.
        for (let i = 1; i < 4; ++i) {
            const emitter = new Emitter({
                type: i,
                maxAge: {
                    value: 1,
                },
                position: {
                    value: new Vector3(-50 + i * 25, 40, 0),
                    radius: 5,
                    spread: new Vector3(3, 3, 3),
                },

                color: {
                    value: [new Color('white'), new Color('red')],
                },

                size: {
                    value: 1,
                },
                isStatic: true,
                particleCount: 250,
            });

            emitters.push(emitter);
            this.particleGroup.addEmitter(emitter);
        }

        // Spread clamping.
        for (let i = 1; i < 4; ++i) {
            const emitter = new Emitter({
                type: i,
                maxAge: {
                    value: 1,
                },
                position: {
                    value: new Vector3(-50 + i * 25, 20, 0),
                    radius: 4,
                    spread: new Vector3(5, 5, 5),
                    spreadClamp: new Vector3(2, 2, 2),
                },

                color: {
                    value: [new Color('white'), new Color('red')],
                },

                size: {
                    value: 1,
                },
                isStatic: true,

                particleCount: 500,
            });

            emitters.push(emitter);
            this.particleGroup.addEmitter(emitter);
        }

        // Spherical velocity distributions.
        for (let i = 1; i < 4; ++i) {
            const emitter = new Emitter({
                type: i,
                maxAge: {
                    value: 1,
                },
                position: {
                    value: new Vector3(-50 + i * 25, 0, 0),
                    radius: 5,
                    spread: i === 1 ? new Vector3(3, 3, 3) : undefined,
                },

                velocity: {
                    value: new Vector3(3, 3, 3),
                    distribution: Distribution.sphere,
                },

                color: {
                    value: [new Color('white'), new Color('red')],
                },

                size: {
                    value: 1,
                },

                particleCount: 250,
            });

            emitters.push(emitter);
            this.particleGroup.addEmitter(emitter);
        }

        // Disc velocity distributions.
        for (let i = 1; i < 4; ++i) {
            const emitter = new Emitter({
                type: i,
                maxAge: {
                    value: 1,
                },
                position: {
                    value: new Vector3(-50 + i * 25, -20, 0),
                    radius: 5,
                    spread: i === 1 ? new Vector3(3, 3, 3) : undefined,
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

                particleCount: 250,
            });

            emitters.push(emitter);
            this.particleGroup.addEmitter(emitter);
        }

        // Box velocity distributions.
        for (let i = 1; i < 4; ++i) {
            const emitter = new Emitter({
                type: i,
                maxAge: {
                    value: 1,
                },
                position: {
                    value: new Vector3(-50 + i * 25, -40, 0),
                    radius: 5,
                    spread: i === 1 ? new Vector3(3, 3, 3) : undefined,
                },

                velocity: {
                    value: new Vector3(3, 3, 3),
                    distribution: Distribution.box,
                },

                color: {
                    value: [new Color('white'), new Color('red')],
                },

                size: {
                    value: 1,
                },

                particleCount: 250,
            });

            emitters.push(emitter);
            this.particleGroup.addEmitter(emitter);
        }

        // setTimeout(() => {
        //     this.particleGroup.removeEmitter(emitters[5]);
        // }, 1000);

        console.warn(this.particleGroup);

        this.add(this.particleGroup.mesh);
    }
}

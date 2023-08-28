import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

function getRandomNumber(base): number {
    return Math.random() * base - base / 2;
}

function getRandomColor(): Color {
    const c = new Color();
    c.setRGB(Math.random(), Math.random(), Math.random());
    return c;
}

export class MultipleEmittersScene extends SceneBase {
    private _smokeTexture: Texture;
    private _numEmitters = 120;

    public update(dt?: number): void {
        super.update(dt);
        const now = Date.now() * 0.0005;
        this.camera.position.x = Math.sin(now) * 500;
        this.camera.position.z = Math.cos(now) * 500;
        this.camera.lookAt(this.position);
    }

    protected async init(): Promise<void> {
        await super.init();
        this.camera.position.z = 200;
        this.camera.lookAt(this.position);
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

        for (let i = 0; i < this._numEmitters; ++i) {
            const emitter = new ParticleEmitter({
                maxAge: {
                    value: 5,
                },
                type: (Math.random() * 4) | 0,
                position: {
                    value: new Vector3(getRandomNumber(200), getRandomNumber(200), getRandomNumber(200)),
                },

                acceleration: {
                    value: new Vector3(getRandomNumber(-2), getRandomNumber(-2), getRandomNumber(-2)),
                },

                velocity: {
                    value: new Vector3(getRandomNumber(5), getRandomNumber(5), getRandomNumber(5)),
                },

                rotation: {
                    axis: new Vector3(getRandomNumber(1), getRandomNumber(1), getRandomNumber(1)),
                    angle: Math.random() * Math.PI,
                    center: new Vector3(getRandomNumber(100), getRandomNumber(100), getRandomNumber(100)),
                },

                wiggle: {
                    value: Math.random() * 20,
                },

                drag: {
                    value: Math.random(),
                },

                color: {
                    value: [getRandomColor(), getRandomColor()],
                },
                size: {
                    value: [0, 2 + Math.random() * 10, 0],
                },

                particleCount: 100,

                opacity: {
                    value: [0, 1, 0],
                },
            });

            this.particleSystem.addEmitter(emitter);
        }

        this.add(this.particleSystem.mesh);
    }
}

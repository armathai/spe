import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { Distribution } from '@armathai/three-particles/dist/types';
import { AdditiveBlending, BoxGeometry, Color, Mesh, MeshBasicMaterial, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

function rand(size): number {
    return size * Math.random() - size / 2;
}

export class PoolScene extends SceneBase {
    private _smokeTexture: Texture;
    private _pos = new Vector3();
    private _emitterConfig = {
        type: Distribution.sphere,
        position: {
            spread: new Vector3(10),
            radius: 1,
        },
        velocity: {
            value: new Vector3(100),
        },
        size: {
            value: [30, 0],
        },
        opacity: {
            value: [1, 0],
        },
        color: {
            value: [new Color('yellow'), new Color('red')],
        },
        particleCount: 100,
        alive: true,
        duration: 0.05,
        maxAge: {
            value: 0.5,
        },
    };

    public update(dt?: number): void {
        super.update(dt);

        const now = Date.now() * 0.0007;

        this.camera.position.set(Math.sin(now) * 500, 0, Math.cos(now) * 500);
        this.camera.lookAt(this.position);
    }

    protected async init(): Promise<void> {
        await super.init();

        this.camera.position.z = 200;

        const referenceCube = new Mesh(
            new BoxGeometry(300, 300, 300),
            new MeshBasicMaterial({
                wireframe: true,
                opacity: 0.1,
                transparent: true,
                color: 0xffffff,
            }),
        );
        this.add(referenceCube);

        // Add a mousedown listener. When mouse is clicked, a new explosion will be created.
        document.addEventListener('mousedown', this._createExplosion, false);

        // Do the same for a keydown event
        document.addEventListener('keydown', this._createExplosion, false);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected initParticles(): void {
        this.particleSystem = new ParticleSystem({
            texture: {
                value: this._smokeTexture,
            },
            blending: AdditiveBlending,
            pixelRatio: this.renderer.getPixelRatio(),
        });

        this.particleSystem.addPool(10, this._emitterConfig, false);
        const emitter = new ParticleEmitter({
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
        this.particleSystem.addEmitter(emitter);
        this.add(this.particleSystem.mesh);
    }

    private _createExplosion(): void {
        const num = 150;
        this.particleSystem.triggerPoolEmitter(1, this._pos.set(rand(num), rand(num), rand(num)));
    }
}

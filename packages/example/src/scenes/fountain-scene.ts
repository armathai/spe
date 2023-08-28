import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class FountainScene extends SceneBase {
    private _smokeTexture: Texture;

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
}

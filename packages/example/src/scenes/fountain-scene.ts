import { Emitter, Group } from '@armathai/spe';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class FountainScene extends SceneBase {
    private _smokeTexture: Texture;

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected initParticles(): void {
        this.particleGroup = new Group({
            texture: {
                value: this._smokeTexture,
            },
        });
        const emitter = new Emitter({
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
        this.particleGroup.addEmitter(emitter);
        this.add(this.particleGroup.mesh);
    }
}

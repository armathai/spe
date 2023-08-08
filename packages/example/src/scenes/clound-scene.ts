import { Emitter, Group } from '@armathai/spe';
import { Color, Fog, NormalBlending, Texture, Vector3 } from 'three';
import cloudParticle from '../../assets/cloud-particle.png';
import { SceneBase } from '../scene-base';

export class CloudScene extends SceneBase {
    private _cloudTexture: Texture;

    protected async init(): Promise<void> {
        await super.init();

        this.renderer.setClearColor(0x42c7ff);
        this.fog = new Fog(this.renderer.getClearColor(new Color()), 20, 0);
    }

    protected async loadAssets(): Promise<void> {
        this._cloudTexture = await this.loader.loadAsync(cloudParticle);
    }

    protected initParticles(): void {
        this.particleGroup = new Group({
            texture: {
                value: this._cloudTexture,
            },
            blending: NormalBlending,
            fog: true,
            pixelRatio: this.renderer.getPixelRatio(),
        });
        const emitter = new Emitter({
            particleCount: 750,
            maxAge: {
                value: 3,
            },
            position: {
                value: new Vector3(0, -15, -50),
                spread: new Vector3(100, 30, 100),
            },
            velocity: {
                value: new Vector3(0, 0, 30),
            },
            wiggle: {
                spread: 10,
            },
            size: {
                value: 75 * this.renderer.getPixelRatio(),
                spread: 50 * this.renderer.getPixelRatio(),
            },
            opacity: {
                value: [0, 1, 0],
            },
            color: {
                value: new Color(1, 1, 1),
                spread: new Vector3(0.1, 0.1, 0.1),
            },
            angle: {
                value: [0, Math.PI * 0.125],
            },
        });
        this.particleGroup.addEmitter(emitter);
        this.add(this.particleGroup.mesh);
    }
}

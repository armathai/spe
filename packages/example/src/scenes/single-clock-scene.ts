import { Emitter, Group } from '@armathai/spe';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class SingleClockScene extends SceneBase {
    private _smokeTexture: Texture;

    private _secondHand: Emitter;
    private _date: Date;

    public update(_dt: number): void {
        super.update();

        if (this._date) {
            this._date.setTime(Date.now());

            const seconds = this._date.getSeconds();
            const fullRotation = Math.PI * 2;
            const secondAngle = (seconds / 60) * fullRotation;

            if (secondAngle !== this._secondHand.rotation.angle) {
                this._secondHand.rotation.angle = secondAngle;
            }
        }

        const now = Date.now() * 0.001;
        this.camera.position.x = Math.sin(now) * 75;
        this.camera.position.z = Math.cos(now) * 75;
        this.camera.lookAt(this.position);
    }

    protected async init(): Promise<void> {
        await super.init();

        this._date = new Date(Date.now());

        this.camera.position.z = 40;
        this.camera.lookAt(this.position);

        const catchUpSeconds = this._date.getSeconds();
        this._secondHand && (this._secondHand.rotation.angle = (catchUpSeconds / 60) * Math.PI * 2);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
    }

    protected initParticles(): void {
        this.particleGroup = new Group({
            texture: {
                value: this._smokeTexture,
            },
            pixelRatio: this.renderer.getPixelRatio(),
        });

        this._secondHand = new Emitter({
            particleCount: 500,
            maxAge: {
                value: 2,
            },
            position: {
                value: new Vector3(0, 5, 0),
            },
            size: {
                value: [0, 1],
            },
            color: {
                value: [new Color(0, 0, 1), new Color(1, 1, 0), new Color(1, 0, 0)],
            },
            opacity: {
                value: 1,
            },
            rotation: {
                axis: new Vector3(0, 0, 1),
                angle: 0,
                static: false,
                center: new Vector3(),
            },
            direction: -1,
        });

        this.particleGroup.addEmitter(this._secondHand);

        this.add(this.particleGroup.mesh);
    }
}

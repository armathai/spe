import { Emitter, Group } from '@armathai/spe';
import { Color, Texture, Vector3 } from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import { SceneBase } from '../scene-base';

export class ClockScene extends SceneBase {
    private _smokeTexture: Texture;

    private _secondHand: Emitter;
    private _minuteHand: Emitter;
    private _hourHand: Emitter;
    private _date: Date;

    public update(_dt: number): void {
        super.update();

        if (this._date) {
            this._date.setTime(Date.now());

            const seconds = this._date.getSeconds();
            const minutes = this._date.getMinutes();
            const hours = this._date.getHours() % 12;
            const fullRotation = Math.PI * 2;
            const secondAngle = (seconds / 60) * fullRotation;
            const minuteAngle = (minutes / 60) * fullRotation;
            const hourAngle = (hours / 12) * fullRotation;

            if (secondAngle !== this._secondHand.rotation.angle) {
                this._secondHand.rotation.angle = secondAngle;
            }

            if (minuteAngle !== this._minuteHand.rotation.angle) {
                this._minuteHand.rotation.angle = minuteAngle;
            }

            if (hourAngle !== this._hourHand.rotation.angle) {
                this._hourHand.rotation.angle = hourAngle;
            }
        }
    }

    protected async init(): Promise<void> {
        await super.init();

        this._date = new Date(Date.now());

        this.camera.position.z = 40;
        this.camera.lookAt(this.position);

        // Prerender...
        const catchUpSeconds = this._date.getSeconds();
        const catchUpMinutes = this._date.getMinutes();
        const catchUpHours = this._date.getHours() % 12;

        this._secondHand && (this._secondHand.rotation.angle = (catchUpSeconds / 60) * Math.PI * 2);
        this._minuteHand && (this._minuteHand.rotation.angle = (catchUpMinutes / 60) * Math.PI * 2);
        this._hourHand && (this._hourHand.rotation.angle = (catchUpHours / 12) * Math.PI * 2);
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
        this._minuteHand = new Emitter({
            particleCount: 500,
            maxAge: {
                value: 2,
            },
            position: {
                value: new Vector3(0, 7.5, 0),
            },
            size: {
                value: [0, 2],
            },
            color: {
                value: [new Color(0, 0, 1), new Color(0, 1, 0), new Color(0, 1, 1)],
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
        this._hourHand = new Emitter({
            particleCount: 500,
            maxAge: {
                value: 2,
            },
            position: {
                value: new Vector3(0, 10, 0),
            },
            size: {
                value: [0, 4],
            },
            color: {
                value: new Color(0.5, 0.25, 0.9),
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
        this.particleGroup.addEmitter(this._minuteHand);
        this.particleGroup.addEmitter(this._hourHand);
        this.add(this.particleGroup.mesh);
    }
}

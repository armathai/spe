import { Emitter, Group } from '@armathai/spe';
import { Distribution } from '@armathai/spe/dist/types';
import {
    AdditiveBlending,
    Color,
    Mesh,
    MeshStandardMaterial,
    NormalBlending,
    PlaneGeometry,
    PointLight,
    PointLightHelper,
    Texture,
    Vector2,
    Vector3,
} from 'three';
import smokeParticle from '../../assets/smoke-particle.png';
import spriteExplosion from '../../assets/sprite-explosion.png';
import { SceneBase } from '../scene-base';

export class ExplosionScene extends SceneBase {
    private _smokeTexture: Texture;
    private _spriteExplosionTexture: Texture;
    private _shockWaveGroup: Group;

    public update(dt: number): void {
        super.update(dt);
        this._shockWaveGroup?.tick(dt);

        const now = Date.now() * 0.001;
        this.camera.position.x = Math.sin(now) * 100;
        this.camera.position.z = Math.cos(now) * 100;
        this.camera.lookAt(this.position);
    }

    protected async loadAssets(): Promise<void> {
        this._smokeTexture = await this.loader.loadAsync(smokeParticle);
        this._spriteExplosionTexture = await this.loader.loadAsync(spriteExplosion);
    }

    protected async init(): Promise<void> {
        await super.init();

        const floor = new Mesh(
            new PlaneGeometry(1000, 1000, 1, 1),
            new MeshStandardMaterial({
                color: 0xaaaaaa,
            }),
        );

        floor.position.y = -10;
        floor.rotation.x = Math.PI * -0.5;
        this.add(floor);

        const light = new PointLight(0xffffff, 500, 500);
        light.position.set(0, 20, 0);
        this.add(light);

        const helper = new PointLightHelper(light, 3);
        this.add(helper);

        this.camera.position.y = 40;
        this.camera.position.z = 100;
        this.camera.lookAt(this.position);
    }

    protected initParticles(): void {
        this.particleGroup = new Group({
            texture: {
                value: this._spriteExplosionTexture,
                frames: new Vector2(5, 5),
                loop: 1,
            },
            depthTest: true,
            depthWrite: false,
            blending: AdditiveBlending,
            scale: 600,
            pixelRatio: this.renderer.getPixelRatio(),
        });

        this._shockWaveGroup = new Group({
            texture: {
                value: this._smokeTexture,
            },
            depthTest: false,
            depthWrite: true,
            blending: NormalBlending,
            pixelRatio: this.renderer.getPixelRatio(),
        });

        const shockWave = new Emitter({
            particleCount: 200,
            type: Distribution.disc,
            position: {
                radius: 5,
                spread: new Vector3(5),
            },
            maxAge: {
                value: 2,
                spread: 0,
            },
            // duration: 1,
            activeMultiplier: 2000,

            velocity: {
                value: new Vector3(40),
            },
            rotation: {
                axis: new Vector3(1, 0, 0),
                angle: Math.PI * 0.5,
                static: true,
            },
            size: { value: 2 },
            color: {
                value: [new Color(0.4, 0.2, 0.1), new Color(0.2, 0.2, 0.2)],
            },
            opacity: { value: [0.5, 0.2, 0] },
        });

        const debris = new Emitter({
            particleCount: 100,
            type: Distribution.sphere,
            position: {
                radius: 0.1,
            },
            maxAge: {
                value: 2,
            },
            // duration: 2,
            activeMultiplier: 40,

            velocity: {
                value: new Vector3(100),
            },
            acceleration: {
                value: new Vector3(0, -20, 0),
                distribution: Distribution.box,
            },
            size: { value: 2 },
            drag: {
                value: 1,
            },
            color: {
                value: [new Color(1, 1, 1), new Color(1, 1, 0), new Color(1, 0, 0), new Color(0.4, 0.2, 0.1)],
            },
            opacity: { value: [0.4, 0] },
        });

        const fireball = new Emitter({
            particleCount: 20,
            type: Distribution.sphere,
            position: {
                radius: 1,
            },
            maxAge: { value: 2 },
            // duration: 1,
            activeMultiplier: 20,
            velocity: {
                value: new Vector3(10),
            },
            size: { value: [20, 100] },
            color: {
                value: [new Color(0.5, 0.1, 0.05), new Color(0.2, 0.2, 0.2)],
            },
            opacity: { value: [0.5, 0.35, 0.1, 0] },
        });

        const mist = new Emitter({
            particleCount: 50,
            position: {
                spread: new Vector3(10, 10, 10),
                distribution: Distribution.sphere,
            },
            maxAge: { value: 2 },
            // duration: 1,
            activeMultiplier: 2000,
            velocity: {
                value: new Vector3(8, 3, 10),
                distribution: Distribution.sphere,
            },
            size: { value: 40 },
            color: {
                value: new Color(0.2, 0.2, 0.2),
            },
            opacity: { value: [0, 0, 0.2, 0] },
        });

        const flash = new Emitter({
            particleCount: 50,
            position: { spread: new Vector3(5, 5, 5) },
            velocity: {
                spread: new Vector3(30),
                distribution: Distribution.sphere,
            },
            size: { value: [2, 20, 20, 20] },
            maxAge: { value: 2 },
            activeMultiplier: 2000,
            opacity: { value: [0.5, 0.25, 0, 0] },
        });

        this.particleGroup.addEmitter(fireball).addEmitter(flash);
        this._shockWaveGroup.addEmitter(debris).addEmitter(mist).addEmitter(shockWave);

        this.add(this.particleGroup.mesh);
        this.add(this._shockWaveGroup.mesh);
    }
}

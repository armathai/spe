import { Emitter, Group } from '@armathai/spe';
import { BoxGeometry, Color, Fog, Mesh, MeshMatcapMaterial, NormalBlending, Texture, Vector3 } from 'three';
import cloudParticle from '../../assets/cloud-particle.png';
import { SceneBase } from '../scene-base';

export class CloudMovesScene extends SceneBase {
    private _cloudTexture: Texture;

    protected async init(): Promise<void> {
        await super.init();

        this.camera.position.z += 200;
        this.camera.position.y += 50;
        this.renderer.setClearColor(0x42c7ff);
        this.fog = new Fog(this.renderer.getClearColor(new Color()), 20, 0);
        const box = new Mesh(new BoxGeometry(10, 10, 10), new MeshMatcapMaterial({ color: new Color('#ff0000') }));
        box.position.z = -15;

        setInterval(() => {
            if (this.camera.position.y > 10) this.camera.position.y -= 0.1;
            if (this.camera.position.z > 20) this.camera.position.z -= 0.3;
        }, 10);

        this.add(box);
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
            hasPerspective: false,
        });
        const emitter = new Emitter({
            particleCount: 1,
            maxAge: {
                value: 20,
            },
            position: {
                value: new Vector3(0, 0, 0),
                // spread: new Vector3(100, 30, 100),
            },
            // velocity: {
            //     value: new Vector3(0, 0, 30),
            // },
            // wiggle: {
            //     spread: 10,
            // },
            size: {
                value: 15,
                // spread: 50 * this.renderer.getPixelRatio(),
            },
            // opacity: {
            //     value: [0, 1, 0],
            // },
            // color: {
            //     value: new Color(1, 1, 1),
            //     spread: new Vector3(0.1, 0.1, 0.1),
            // },
            // angle: {
            //     value: [0, Math.PI * 0.125],
            // },
            isStatic: true,
        });

        this.particleGroup.addEmitter(emitter);
        this.add(this.particleGroup.mesh);
    }
}

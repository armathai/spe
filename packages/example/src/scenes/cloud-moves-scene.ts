import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { BoxGeometry, Color, Mesh, MeshMatcapMaterial, NormalBlending, Texture, Vector3 } from 'three';
import cloudParticle from '../../assets/cloud-particle.png';
import { SceneBase } from '../scene-base';

export class CloudMovesScene extends SceneBase {
    private _cloudTexture: Texture;
    private _box: Mesh;

    public update(dt?: number): void {
        super.update(dt);
        if (this.camera.position.y > 10) this.camera.position.y -= 0.1;
        if (this.camera.position.z > 20) this.camera.position.z -= 0.3;
    }

    protected async init(): Promise<void> {
        await super.init();

        this.camera.position.z += 200;
        this.camera.position.y += 50;
        this.renderer.setClearColor(0x42c7ff);

        this._box = new Mesh(new BoxGeometry(10, 10, 10), new MeshMatcapMaterial({ color: new Color('#ff0000') }));
        this._box.position.z = -25;
        this.add(this._box);
    }

    protected async loadAssets(): Promise<void> {
        this._cloudTexture = await this.loader.loadAsync(cloudParticle);
    }

    protected initParticles(): void {
        this.particleSystem = new ParticleSystem({
            texture: {
                value: this._cloudTexture,
            },
            blending: NormalBlending,
            pixelRatio: this.renderer.getPixelRatio(),
            hasPerspective: true,
        });
        const emitter = new ParticleEmitter({
            particleCount: 1,
            maxAge: {
                value: 1,
            },
            position: {
                value: new Vector3(0, 0, 0),
            },
            size: {
                value: 15,
            },
            isStatic: true,
        });

        this.particleSystem.addEmitter(emitter);
        this.add(this.particleSystem.mesh);
    }
}

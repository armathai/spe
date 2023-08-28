/* eslint-disable @typescript-eslint/naming-convention */
import { ParticleEmitter, ParticleSystem } from '@armathai/three-particles';
import { Distribution } from '@armathai/three-particles/dist/types';
import GUI from 'lil-gui';
import { Texture, Vector2, Vector3 } from 'three';
import spriteFlame from '../../assets/sprite-flame.jpg';
import { SceneBase } from '../scene-base';

export class RuntimeChangingScene extends SceneBase {
    private _spriteFlameTexture: Texture;
    private _emitter: ParticleEmitter;

    protected async init(): Promise<void> {
        await super.init();

        this.camera.position.z = 50;
        this.camera.position.y = 0;
        this.camera.lookAt(this.position);

        this.initGUI();
    }

    protected async loadAssets(): Promise<void> {
        this._spriteFlameTexture = await this.loader.loadAsync(spriteFlame);
    }

    protected initParticles(): void {
        this.particleSystem = new ParticleSystem({
            texture: {
                value: this._spriteFlameTexture,
                frames: new Vector2(8, 4),
                loop: 2,
            },
            pixelRatio: this.renderer.getPixelRatio(),
            depthTest: true,
            scale: window.innerHeight / 2.0,
        });
        const emitter = new ParticleEmitter({
            particleCount: 200,
            maxAge: {
                value: 2,
                spread: 0,
            },
            position: {
                value: new Vector3(0, 0, 0),
                spread: new Vector3(10, 0, 0),
                spreadClamp: new Vector3(0, 0, 0),
                distribution: Distribution.box,
                randomize: false,
            },
            radius: {
                value: 5,
                spread: 0,
                scale: new Vector3(1, 1, 1),
                spreadClamp: new Vector3(2, 2, 2),
            },
            velocity: {
                value: new Vector3(0, 0, 0),
                spread: new Vector3(0, 0, 0),
                randomize: false,
            },
            acceleration: {
                value: new Vector3(0, 0, 0),
                spread: new Vector3(0, 0, 0),
                randomize: false,
            },
            drag: {
                value: 0.5,
                spread: 0,
            },
            wiggle: {
                value: 0,
                spread: 0,
            },
            rotation: {
                axis: new Vector3(0, 1, 0),
                axisSpread: new Vector3(0, 0, 0),
                angle: 0, // radians
                angleSpread: 0, // radians
                static: false,
                center: new Vector3(0, 0, 0),
            },
            size: {
                value: 20,
                spread: 0,
            },
            opacity: {
                value: 0.02,
            },
            angle: {
                value: 0,
                spread: 0,
            },
        });
        this.particleSystem.addEmitter((this._emitter = emitter));
        this.add(this.particleSystem.mesh);
    }

    protected initGUI(): void {
        const gui = new GUI({ closeFolders: true });
        const vec3Components = ['x', 'y', 'z'];
        let i;

        const groupFolder = gui.addFolder('Group Settings');

        groupFolder.add(this.particleSystem, 'textureLoop', 1, 10, 1).onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'blending', 0, 5, 1).onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'colorize').onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'hasPerspective').onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'transparent').onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'alphaTest', 0, 1, 0.1).onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'depthWrite').onChange(() => {
            this._updateMaterial();
        });
        groupFolder.add(this.particleSystem, 'depthTest').onChange(() => {
            this._updateMaterial();
        });

        const emitterFolder = gui.addFolder('Emitter Settings');
        const positionFolder = emitterFolder.addFolder('Position');
        const positionValue = positionFolder.addFolder('Value');
        const positionSpread = positionFolder.addFolder('Spread');
        const positionSpreadClamp = positionFolder.addFolder('Spread Clamp');

        for (i = 0; i < vec3Components.length; ++i) {
            positionValue
                .add(this._emitter.position.value, vec3Components[i], -100, 100)
                .listen()
                .onChange(() => {
                    this._emitter.position.value = this._emitter.position.value;
                });
            positionSpread
                .add(this._emitter.position.spread, vec3Components[i], -100, 100)
                .listen()
                .onChange(() => {
                    this._emitter.position.spread = this._emitter.position.spread;
                });
            positionSpreadClamp
                .add(this._emitter.position.spreadClamp, vec3Components[i], -50, 50)
                .listen()
                .onChange(() => {
                    this._emitter.position.spreadClamp = this._emitter.position.spreadClamp;
                });
        }

        positionFolder.add(this._emitter.position, '_radius', 0, 50).name('radius').listen();
        positionFolder.add(this._emitter.position, '_randomize').name('randomize').listen();

        const velocityFolder = emitterFolder.addFolder('Velocity');
        const velocityValue = velocityFolder.addFolder('Value');
        const velocitySpread = velocityFolder.addFolder('Spread');

        for (i = 0; i < vec3Components.length; ++i) {
            velocityValue
                .add(this._emitter.velocity.value, vec3Components[i], -50, 50)
                .listen()
                .onChange(() => {
                    this._emitter.velocity.value = this._emitter.velocity.value;
                });
            velocitySpread
                .add(this._emitter.velocity.spread, vec3Components[i], -50, 50)
                .listen()
                .onChange(() => {
                    this._emitter.velocity.spread = this._emitter.velocity.spread;
                });
        }
        velocityFolder.add(this._emitter.velocity, '_randomize').listen();

        const accelerationFolder = emitterFolder.addFolder('Acceleration');
        const accelerationValue = accelerationFolder.addFolder('Value');
        const accelerationSpread = accelerationFolder.addFolder('Spread');

        for (i = 0; i < vec3Components.length; ++i) {
            accelerationValue
                .add(this._emitter.acceleration.value, vec3Components[i], -50, 50)
                .listen()
                .onChange(() => {
                    this._emitter.acceleration.value = this._emitter.acceleration.value;
                });
            accelerationSpread
                .add(this._emitter.acceleration.spread, vec3Components[i], -50, 50)
                .listen()
                .onChange(() => {
                    this._emitter.acceleration.spread = this._emitter.acceleration.spread;
                });
        }

        accelerationFolder.add(this._emitter.acceleration, 'randomize').listen();

        const colors = {
            'Step 1': '#ffffff',
            'Step 2': '#ffffff',
            'Step 3': '#ffffff',
            'Step 4': '#ffffff',
        };

        const colorFolder = emitterFolder.addFolder('Color steps');
        colorFolder.addColor(colors, 'Step 1').onChange((value) => {
            this._emitter.color.value[0].setStyle(value);
            this._emitter.color.value = this._emitter.color.value;
        });
        colorFolder.addColor(colors, 'Step 2').onChange((value) => {
            this._emitter.color.value[1].setStyle(value);
            this._emitter.color.value = this._emitter.color.value;
        });
        colorFolder.addColor(colors, 'Step 3').onChange((value) => {
            this._emitter.color.value[2].setStyle(value);
            this._emitter.color.value = this._emitter.color.value;
        });
        colorFolder.addColor(colors, 'Step 4').onChange((value) => {
            this._emitter.color.value[3].setStyle(value);
            this._emitter.color.value = this._emitter.color.value;
        });

        const opacities = {
            'Step 1': this._emitter.opacity.value[0],
            'Step 2': this._emitter.opacity.value[1],
            'Step 3': this._emitter.opacity.value[2],
            'Step 4': this._emitter.opacity.value[3],
        };
        const opacityFolder = emitterFolder.addFolder('Opacity steps');
        opacityFolder
            .add(opacities, 'Step 1', 0, 1, 0.01)
            .listen()
            .onChange((value) => {
                this._emitter.opacity.value[0] = value;
                this._emitter.opacity.value = this._emitter.opacity.value;
            });
        opacityFolder
            .add(opacities, 'Step 2', 0, 1, 0.01)
            .listen()
            .onChange((value) => {
                this._emitter.opacity.value[1] = value;
                this._emitter.opacity.value = this._emitter.opacity.value;
            });
        opacityFolder
            .add(opacities, 'Step 3', 0, 1, 0.01)
            .listen()
            .onChange((value) => {
                this._emitter.opacity.value[2] = value;
                this._emitter.opacity.value = this._emitter.opacity.value;
            });
        opacityFolder
            .add(opacities, 'Step 4', 0, 1, 0.01)
            .listen()
            .onChange((value) => {
                this._emitter.opacity.value[3] = value;
                this._emitter.opacity.value = this._emitter.opacity.value;
            });
    }

    private _updateMaterial(): void {
        this.particleSystem.material.needsUpdate = true;
    }
}

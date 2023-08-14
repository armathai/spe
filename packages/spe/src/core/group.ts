/* eslint-disable @typescript-eslint/naming-convention */
import {
    AdditiveBlending,
    Blending,
    BufferAttribute,
    BufferGeometry,
    Color,
    IUniform,
    Points,
    ShaderMaterial,
    Texture,
    Vector2,
    Vector3,
    Vector4,
} from 'three';
import { MathUtils } from 'three/src/math/MathUtils';
import { valueOverLifetimeLength } from '../constants';
import { ComponentSize, ShaderAttribute } from '../helpers/shader-attribute';
import { shaders } from '../shaders/shaders';
import { EmitterOptions, GroupAttributesMap, GroupOptions } from '../types';
import { ensureInstanceOf, ensureTypedArg } from '../utils';
import { Emitter } from './emitter';

/**
 * An SPE.Group instance.
 * @typedef {Object} Group
 * @see SPE.Group
 */

/**
 * A map of options to configure an SPE.Group instance.
 * @typedef {Object} GroupOptions
 *
 * @property {Object} texture An object describing the texture used by the group.
 *
 * @property {Object} texture.value An instance of THREE.Texture.
 *
 * @property {Object=} texture.frames A THREE.Vector2 instance describing the number
 *                                    of frames on the x- and y-axis of the given texture.
 *                                    If not provided, the texture will NOT be treated as
 *                                    a sprite-sheet and as such will NOT be animated.
 *
 * @property {Number} [texture.frameCount=texture.frames.x * texture.frames.y] The total number of frames in the sprite-sheet.
 *                                                                   Allows for sprite-sheets that don't fill the entire
 *                                                                   texture.
 *
 * @property {Number} texture.loop The number of loops through the sprite-sheet that should
 *                                 be performed over the course of a single particle's lifetime.
 *
 * @property {Number} fixedTimeStep If no `dt` (or `deltaTime`) value is passed to this group's
 *                                  `tick()` function, this number will be used to move the particle
 *                                  simulation forward. Value in SECONDS.
 *
 * @property {Boolean} hasPerspective Whether the distance a particle is from the camera should affect
 *                                    the particle's size.
 *
 * @property {Boolean} colorize Whether the particles in this group should be rendered with color, or
 *                              whether the only color of particles will come from the provided texture.
 *
 * @property {Number} blending One of Three.js's blending modes to apply to this group's `ShaderMaterial`.
 *
 * @property {Boolean} transparent Whether these particle's should be rendered with transparency.
 *
 * @property {Number} alphaTest Sets the alpha value to be used when running an alpha test on the `texture.value` property. Value between 0 and 1.
 *
 * @property {Boolean} depthWrite Whether rendering the group has any effect on the depth buffer.
 *
 * @property {Boolean} depthTest Whether to have depth test enabled when rendering this group.
 *
 * @property {Boolean} fog Whether this group's particles should be affected by their scene's fog.
 *
 * @property {Number} scale The scale factor to apply to this group's particle sizes. Useful for
 *                          setting particle sizes to be relative to renderer size.
 *
 * @property {Number} pixelRatio The pixelRatio of renderer
 *
 */

/**
 * The SPE.Group class. Creates a new group, containing a material, geometry, and mesh.
 *
 * @constructor
 * @param {GroupOptions} options A map of options to configure the group instance.
 */
export class Group {
    private _uuid: string;
    private _fixedTimeStep: number;

    private _texture: Texture | null;
    private _textureFrames: Vector2;
    private _textureFrameCount: number;
    private _textureLoop: number; // Updatable

    private _hasPerspective: boolean; // Updatable
    private _colorize: boolean; // Updatable
    private _maxParticleCount: number | null;
    private _blending: Blending; // Updatable
    private _transparent: boolean; // Updatable
    private _alphaTest: number; // Updatable
    private _depthWrite: boolean; // Updatable
    private _depthTest: boolean; // Updatable
    private _fog: boolean;
    private _scale: number;
    private _pixelRatio: number;

    private _emitters: Emitter[];
    private _emitterIDs: string[];

    private _pool: Emitter[];
    private _poolCreationSettings: EmitterOptions | EmitterOptions[] | null;
    private _createNewWhenPoolEmpty: boolean;

    private _attributesNeedRefresh: boolean;
    private _attributesNeedDynamicReset: boolean;

    private _particleCount: number;

    private _uniforms: { [uniform: string]: IUniform };

    private _defines: { [key: string]: unknown };

    private _attributes: GroupAttributesMap;
    private _attributeKeys: Array<keyof GroupAttributesMap>;
    private _attributeCount: number;

    private _material: ShaderMaterial;
    private _geometry: BufferGeometry;
    private _mesh: Points;

    public constructor(options: GroupOptions) {
        // Ensure we have a map of options to play with
        options = ensureTypedArg(options, 'object', {});
        options.texture = ensureTypedArg(options.texture, 'object', {});

        // Assign a UUID to this instance
        this._uuid = MathUtils.generateUUID();

        // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
        // the value of this property will be used to advance the simulation.
        this._fixedTimeStep = ensureTypedArg(options.fixedTimeStep, 'number', 0.016);

        // Set properties used in the uniforms map, starting with the
        // texture stuff.
        this._texture = ensureInstanceOf(options.texture.value, Texture, null);
        this._textureFrames = ensureInstanceOf(options.texture.frames, Vector2, new Vector2(1, 1));
        this._textureFrameCount = ensureTypedArg(
            options.texture.frameCount,
            'number',
            this._textureFrames.x * this._textureFrames.y,
        );
        this._textureLoop = ensureTypedArg(options.texture.loop, 'number', 1);
        this._textureFrames.max(new Vector2(1, 1));

        this._hasPerspective = ensureTypedArg(options.hasPerspective, 'boolean', true);
        this._colorize = ensureTypedArg(options.colorize, 'boolean', true);

        this._maxParticleCount = ensureTypedArg(options.maxParticleCount, 'number', null);

        // Set properties used to define the ShaderMaterial's appearance.
        this._blending = ensureTypedArg(options.blending, 'number', AdditiveBlending);
        this._transparent = ensureTypedArg(options.transparent, 'boolean', true);
        this._alphaTest = ensureTypedArg(options.alphaTest, 'number', 0.0);
        this._depthWrite = ensureTypedArg(options.depthWrite, 'boolean', false);
        this._depthTest = ensureTypedArg(options.depthTest, 'boolean', true);
        this._fog = ensureTypedArg(options.fog, 'boolean', true);
        this._scale = ensureTypedArg(options.scale, 'number', 300);
        this._pixelRatio = ensureTypedArg(options.pixelRatio, 'number', 1);

        // Where emitter's go to curl up in a warm blanket and live
        // out their days.
        this._emitters = [];
        this._emitterIDs = [];

        // Create properties for use by the emitter pooling functions.
        this._pool = [];
        this._poolCreationSettings = null;
        this._createNewWhenPoolEmpty = false;

        // Whether all attributes should be forced to updated
        // their entire buffer contents on the next tick.
        //
        // Used when an emitter is removed.
        this._attributesNeedRefresh = false;
        this._attributesNeedDynamicReset = false;

        this._particleCount = 0;

        // Map of uniforms to be applied to the ShaderMaterial instance.
        this._uniforms = {
            tex: {
                // type: 't',
                value: this._texture,
            },
            textureAnimation: {
                // type: 'v4',
                value: new Vector4(
                    this._textureFrames.x,
                    this._textureFrames.y,
                    this._textureFrameCount,
                    Math.max(Math.abs(this._textureLoop), 1.0),
                ),
            },
            fogColor: {
                // type: 'c',
                value: this._fog ? new Color() : null,
            },
            fogNear: {
                // type: 'f',
                value: 10,
            },
            fogFar: {
                // type: 'f',
                value: 200,
            },
            fogDensity: {
                // type: 'f',
                value: 0.5,
            },
            deltaTime: {
                // type: 'f',
                value: 0,
            },
            runTime: {
                // type: 'f',
                value: 0,
            },
            scale: {
                // type: 'f',
                value: this._scale * this._pixelRatio,
            },
        };

        // Add some defines into the mix...
        this._defines = {
            HAS_PERSPECTIVE: this._hasPerspective,
            COLORIZE: this._colorize,
            VALUE_OVER_LIFETIME_LENGTH: valueOverLifetimeLength,

            SHOULD_ROTATE_TEXTURE: false,
            SHOULD_ROTATE_PARTICLES: false,
            SHOULD_WIGGLE_PARTICLES: false,

            SHOULD_CALCULATE_SPRITE: this._textureFrames.x > 1 || this._textureFrames.y > 1,
        };

        // Map of all attributes to be applied to the particles.
        //
        // See SPE.ShaderAttribute for a bit more info on this bit.
        this._attributes = {
            position: new ShaderAttribute(ComponentSize.v3, true),
            acceleration: new ShaderAttribute(ComponentSize.v4, true), // w component is drag
            velocity: new ShaderAttribute(ComponentSize.v3, true),
            rotation: new ShaderAttribute(ComponentSize.v4, true),
            rotationCenter: new ShaderAttribute(ComponentSize.v3, true),
            params: new ShaderAttribute(ComponentSize.v4, true), // Holds (alive, age, delay, wiggle)
            size: new ShaderAttribute(ComponentSize.v4, true),
            angle: new ShaderAttribute(ComponentSize.v4, true),
            color: new ShaderAttribute(ComponentSize.v4, true),
            opacity: new ShaderAttribute(ComponentSize.v4, true),
        };

        this._attributeKeys = Object.keys(this._attributes) as unknown as Array<keyof GroupAttributesMap>;
        this._attributeCount = this._attributeKeys.length;

        // Create the ShaderMaterial instance that'll help render the
        // particles.
        this._material = new ShaderMaterial({
            uniforms: this._uniforms,
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            blending: this._blending,
            transparent: this._transparent,
            alphaTest: this._alphaTest,
            depthWrite: this._depthWrite,
            depthTest: this._depthTest,
            defines: this._defines,
            fog: this._fog,
        });

        // Create the BufferGeometry and Points instances, ensuring
        // the geometry and material are given to the latter.
        this._geometry = new BufferGeometry();
        this._mesh = new Points(this._geometry, this._material);

        if (this._maxParticleCount === null) {
            console.warn(
                'SPE.Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.',
            );
        }
    }

    public get textureLoop(): number {
        return this._textureLoop;
    }

    public set textureLoop(value: number) {
        this._textureLoop = value;
        this._uniforms.textureAnimation.value.w = value;
    }

    public get blending(): Blending {
        return this._blending;
    }

    public set blending(value: Blending) {
        this._blending = value;
        this._material.blending = value;
    }

    public get colorize(): boolean {
        return this._colorize;
    }

    public set colorize(value: boolean) {
        this._colorize = value;
        this._defines.COLORIZE = value;
    }

    public get hasPerspective(): boolean {
        return this._hasPerspective;
    }

    public set hasPerspective(value: boolean) {
        this._hasPerspective = value;
        this._defines.HAS_PERSPECTIVE = value;
    }

    public get transparent(): boolean {
        return this._transparent;
    }

    public set transparent(value: boolean) {
        this._transparent = value;
        this._material.transparent = value;
    }

    public get alphaTest(): number {
        return this._alphaTest;
    }

    public set alphaTest(value: number) {
        this._alphaTest = value;
        this._material.alphaTest = value;
    }

    public get depthWrite(): boolean {
        return this._depthWrite;
    }

    public set depthWrite(value: boolean) {
        this._depthWrite = value;
        this._material.depthWrite = value;
    }

    public get depthTest(): boolean {
        return this._depthTest;
    }

    public set depthTest(value: boolean) {
        this._depthTest = value;
        this._material.depthTest = value;
    }

    public get mesh(): Points {
        return this._mesh;
    }

    public get material(): ShaderMaterial {
        return this._material;
    }

    public get uniforms(): { [uniform: string]: IUniform } {
        return this._uniforms;
    }

    public get defines(): { [key: string]: unknown } {
        return this._defines;
    }

    public updateDefines(): void {
        for (let i = this._emitters.length - 1; i >= 0; --i) {
            const emitter = this._emitters[i];

            // Only do angle calculation if there's no spritesheet defined.
            //
            // Saves calculations being done and then overwritten in the shaders.
            if (!this._defines.SHOULD_CALCULATE_SPRITE) {
                this._defines.SHOULD_ROTATE_TEXTURE =
                    this._defines.SHOULD_ROTATE_TEXTURE ||
                    !!Math.max(Math.max.apply(null, emitter.angle.value), Math.max.apply(null, emitter.angle.spread));
            }

            this._defines.SHOULD_ROTATE_PARTICLES =
                this._defines.SHOULD_ROTATE_PARTICLES ||
                !!Math.max(emitter.rotation.angle, emitter.rotation.angleSpread);

            this._defines.SHOULD_WIGGLE_PARTICLES =
                this._defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(emitter.wiggle.value, emitter.wiggle.spread);
        }

        this._material.needsUpdate = true;
    }

    /**
     * Adds an SPE.Emitter instance to this group, creating particle values and
     * assigning them to this group's shader attributes.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    public addEmitter(emitter: Emitter): Group {
        // If the emitter already exists as a member of this group, then
        // stop here, we don't want to add it again.
        if (this._emitterIDs.indexOf(emitter.uuid) > -1) {
            console.error('Emitter already exists in this group. Will not add again.');
            return this;
        }

        // And finally, if the emitter is a member of another group,
        // don't add it to this group.
        else if (emitter.group !== null) {
            console.error('Emitter already belongs to another group. Will not add to requested group.');
            return this;
        }

        const start = this._particleCount;
        const end = start + emitter.particleCount;

        // Update this group's particle count.
        this._particleCount = end;

        // Emit a warning if the emitter being added will exceed the buffer sizes specified.
        if (this._maxParticleCount !== null && this._particleCount > this._maxParticleCount) {
            console.warn(
                'SPE.Group: maxParticleCount exceeded. Requesting',
                this._particleCount,
                'particles, can support only',
                this._maxParticleCount,
            );
        }

        // Set the `particlesPerSecond` value (PPS) on the emitter.
        // It's used to determine how many particles to release
        // on a per-frame basis.
        emitter.calculatePPSValue(emitter.maxAge.value + emitter.maxAge.spread);
        emitter.setBufferUpdateRanges(this._attributeKeys);

        // Store the offset value in the TypedArray attributes for this emitter.
        emitter.setAttributeOffset(start);

        // Save a reference to this group on the emitter so it knows
        // where it belongs.
        emitter.group = this;

        // Store reference to the attributes on the emitter for
        // easier access during the emitter's tick function.
        emitter.attributes = this._attributes;

        // Ensure the attributes and their BufferAttributes exist, and their
        // TypedArrays are of the correct size.
        for (const attr in this._attributes) {
            if (this._attributes.hasOwnProperty(attr)) {
                // When creating a buffer, pass through the maxParticle count
                // if one is specified.
                this._attributes[attr as keyof GroupAttributesMap].createBufferAttribute(
                    this._maxParticleCount !== null ? this._maxParticleCount : this._particleCount,
                );
            }
        }

        // Loop through each particle this emitter wants to have, and create the attributes values,
        // storing them in the TypedArrays that each attribute holds.
        for (let i = start; i < end; ++i) {
            emitter.assignPositionValue(i);
            emitter.assignForceValue(i, 'velocity');
            emitter.assignForceValue(i, 'acceleration');
            emitter.assignAbsLifetimeValue(i, 'opacity');
            emitter.assignAbsLifetimeValue(i, 'size');
            emitter.assignAngleValue(i);
            emitter.assignRotationValue(i);
            emitter.assignParamsValue(i);
            emitter.assignColorValue(i);
        }

        // Update the geometry and make sure the attributes are referencing
        // the typed arrays properly.
        this._applyAttributesToGeometry();

        // Store this emitter in this group's emitter's store.
        this._emitters.push(emitter);
        this._emitterIDs.push(emitter.uuid);

        // Update certain flags to enable shader calculations only if they're necessary.
        this.updateDefines();

        // Update the material since defines might have changed
        this._material.needsUpdate = true;
        // ToDo there is no needsUpdate property on BufferGeometry,
        // but actually there is no need in it because it updates in _applyAttributesToGeometry call above
        // this._geometry.needsUpdate = true;
        for (const key in this._geometry.attributes) {
            if (Object.prototype.hasOwnProperty.call(this._geometry.attributes, key)) {
                const attr = this._geometry.attributes[key];
                attr.needsUpdate = true;
            }
        }

        this._attributesNeedRefresh = true;

        // Return the group to enable chaining.
        return this;
    }

    /**
     * Removes an SPE.Emitter instance from this group. When called,
     * all particle's belonging to the given emitter will be instantly
     * removed from the scene.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    public removeEmitter(emitter: Emitter): void {
        const emitterIndex = this._emitterIDs.indexOf(emitter.uuid);

        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be paused. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
            console.error('`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter);
            return undefined;
        }

        // Issue an error if the emitter isn't a member of this group.
        else if (emitterIndex === -1) {
            console.error('Emitter does not exist in this group. Will not remove.');
            return undefined;
        }

        // Kill all particles by marking them as dead
        // and their age as 0.
        const start = emitter.attributeOffset;
        const end = start + emitter.particleCount;
        const params = this._attributes.params.typedArray!;

        // Set alive and age to zero.
        for (let i = start; i < end; ++i) {
            params.array[i * 4] = 0.0;
            params.array[i * 4 + 1] = 0.0;
        }

        // Remove the emitter from this group's "store".
        this._emitters.splice(emitterIndex, 1);
        this._emitterIDs.splice(emitterIndex, 1);

        // Remove this emitter's attribute values from all shader attributes.
        // The `.splice()` call here also marks each attribute's buffer
        // as needing to update it's entire contents.
        for (const attr in this._attributes) {
            if (this._attributes.hasOwnProperty(attr)) {
                this._attributes[attr as keyof GroupAttributesMap].splice(start, end);
            }
        }

        // Ensure this group's particle count is correct.
        this._particleCount -= emitter.particleCount;

        // Call the emitter's remove method.
        emitter.onRemove();

        this._applyAttributesToGeometry();

        this.updateDefines();

        // Set a flag to indicate that the attribute buffers should
        // be updated in their entirety on the next frame.
        this._attributesNeedRefresh = true;
    }

    /**
     * Fetch a single emitter instance from the pool.
     * If there are no objects in the pool, a new emitter will be
     * created if specified.
     *
     * @return {Emitter|null}
     */
    public getFromPool(): Emitter | undefined {
        if (this._pool.length) {
            return this._pool.pop();
        } else if (this._createNewWhenPoolEmpty) {
            // ToDo this part is working not correctly,
            // const emitter = new Emitter(this._poolCreationSettings);

            // this.addEmitter(emitter);

            // return emitter;
            return undefined;
        }

        return undefined;
    }

    /**
     * Release an emitter into the pool.
     *
     * @param  {ShaderParticleEmitter} emitter
     * @return {Group} This group instance.
     */
    public releaseIntoPool(emitter: Emitter): Group {
        if (emitter instanceof Emitter === false) {
            console.error('Argument is not instanceof SPE.Emitter:', emitter);
            return this;
        }

        emitter.reset();
        this._pool.unshift(emitter);

        return this;
    }

    /**
     * Get the pool array
     *
     * @return {Array}
     */
    public getPool(): Emitter[] {
        return this._pool;
    }

    /**
     * Add a pool of emitters to this particle group
     *
     * @param {Number} numEmitters      The number of emitters to add to the pool.
     * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
     * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
     * @return {Group} This group instance.
     */
    public addPool(numEmitters: number, emitterOptions: EmitterOptions | EmitterOptions[], createNew: boolean): Group {
        let emitter;

        // Save relevant settings and flags.
        this._poolCreationSettings = emitterOptions;
        this._createNewWhenPoolEmpty = !!createNew;

        // Create the emitters, add them to this group and the pool.
        for (let i = 0; i < numEmitters; ++i) {
            if (Array.isArray(emitterOptions)) {
                emitter = new Emitter(emitterOptions[i]);
            } else {
                emitter = new Emitter(emitterOptions);
            }
            this.addEmitter(emitter);
            this.releaseIntoPool(emitter);
        }

        return this;
    }

    /**
     * Set a given number of emitters as alive, with an optional position
     * vector3 to move them to.
     *
     * @param  {Number} numEmitters The number of emitters to activate
     * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
     * @return {Group} This group instance.
     */
    public triggerPoolEmitter(numEmitters: number, position: Vector3): Group {
        if (typeof numEmitters === 'number' && numEmitters > 1) {
            for (let i = 0; i < numEmitters; ++i) {
                this._triggerSingleEmitter(position);
            }
        } else {
            this._triggerSingleEmitter(position);
        }

        return this;
    }

    /**
     * Simulate all the emitter's belonging to this group, updating
     * attribute values along the way.
     * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
     */
    public tick(dt?: number): void {
        const numEmitters = this._emitters.length;
        const deltaTime = dt || this._fixedTimeStep;

        // Update uniform values.
        this._updateUniforms(deltaTime);

        // Reset buffer update ranges on the shader attributes.
        this._resetBufferRanges();

        // If nothing needs updating, then stop here.
        if (numEmitters === 0 && this._attributesNeedRefresh === false && this._attributesNeedDynamicReset === false) {
            return;
        }

        // Loop through each emitter in this group and
        // simulate it, then update the shader attribute
        // buffers.
        for (let i = 0, emitter; i < numEmitters; ++i) {
            emitter = this._emitters[i];
            emitter.tick(deltaTime);
            this._updateBuffers(emitter);
        }

        // If the shader attributes have been refreshed,
        // then the dynamic properties of each buffer
        // attribute will need to be reset back to
        // what they should be.
        if (this._attributesNeedDynamicReset === true) {
            for (let i = this._attributeCount - 1; i >= 0; --i) {
                this._attributes[this._attributeKeys[i]].resetDynamic();
            }

            this._attributesNeedDynamicReset = false;
        }

        // If this group's shader attributes need a full refresh
        // then mark each attribute's buffer attribute as
        // needing so.
        if (this._attributesNeedRefresh === true) {
            for (let i = this._attributeCount - 1; i >= 0; --i) {
                this._attributes[this._attributeKeys[i]].forceUpdateAll();
            }

            this._attributesNeedRefresh = false;
            this._attributesNeedDynamicReset = true;
        }
    }

    /**
     * Dipose the geometry and material for the group.
     *
     * @return {Group} Group instance.
     */
    public dispose(): Group {
        this._geometry.dispose();
        this._material.dispose();
        return this;
    }

    private _triggerSingleEmitter(pos: Vector3): Group | undefined {
        const emitter = this.getFromPool();

        if (emitter === null) {
            console.log('SPE.Group pool ran out.');
            return;
        }

        // TODO:
        // - Make sure buffers are update with thus new position.
        if (pos instanceof Vector3) {
            emitter!.position.value.copy(pos);

            // Trigger the setter for this property to force an
            // update to the emitter's position attribute.
            emitter!.position.value = emitter!.position.value;
        }

        emitter!.enable();

        // ToDo: WTF!!? setTimeout?
        setTimeout(
            () => {
                emitter!.disable();
                this.releaseIntoPool(emitter!);
            },
            Math.max(emitter!.duration!, emitter!.maxAge.value + emitter!.maxAge.spread) * 1000,
        );

        return this;
    }

    private _updateUniforms(dt: number): void {
        this._uniforms.runTime.value += dt;
        this._uniforms.deltaTime.value = dt;
    }

    private _resetBufferRanges(): void {
        for (let i = this._attributeCount - 1; i >= 0; --i) {
            this._attributes[this._attributeKeys[i]].resetUpdateRange();
        }
    }

    private _updateBuffers(emitter: Emitter): void {
        for (let i = this._attributeCount - 1; i >= 0; --i) {
            const key = this._attributeKeys[i];
            const emitterAttr = emitter.bufferUpdateRanges[key]!;
            const attr = this._attributes[key];
            attr.setUpdateRange(emitterAttr.min, emitterAttr.max);
            attr.flagUpdate();
        }
    }

    private _applyAttributesToGeometry(): void {
        // Loop through all the shader attributes and assign (or re-assign)
        // typed array buffers to each one.
        for (const attr in this._attributes) {
            if (this._attributes.hasOwnProperty(attr as keyof GroupAttributesMap)) {
                const attribute = this._attributes[attr as keyof GroupAttributesMap];
                const geometryAttribute = this._geometry.attributes[attr];

                // Update the array if this attribute exists on the geometry.
                //
                // This needs to be done because the attribute's typed array might have
                // been resized and reinstantiated, and might now be looking at a
                // different ArrayBuffer, so reference needs updating.
                if (geometryAttribute) {
                    const { array, componentSize } = attribute.typedArray!;
                    (geometryAttribute as BufferAttribute).copy(new BufferAttribute(array, componentSize));
                    geometryAttribute.needsUpdate = true;
                }

                // Add the attribute to the geometry if it doesn't already exist.
                else {
                    this._geometry.setAttribute(attr, attribute.bufferAttribute!);
                }

                // Mark the attribute as needing an update the next time a frame is rendered.
                attribute.bufferAttribute!.needsUpdate = true;
            }
        }

        // Mark the draw range on the geometry. This will ensure
        // only the values in the attribute buffers that are
        // associated with a particle will be used in THREE's
        // render cycle.
        this._geometry.setDrawRange(0, this._particleCount);
    }
}

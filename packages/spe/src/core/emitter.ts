import { MathUtils, TypedArray } from 'three';
import { clamp } from 'three/src/math/MathUtils';
import { valueOverLifetimeLength } from '../constants';
import { Distribution, EmitterOptions, EmitterProperty, GroupAttributesMap } from '../types';
import {
    arrayValuesAreEqual,
    ensureTypedArg,
    getPackedRotationAxis,
    randomColorAsHex,
    randomDirectionVector3OnDisc,
    randomDirectionVector3OnSphere,
    randomFloat,
    randomVector3,
    randomVector3OnDisc,
    randomVector3OnLine,
    randomVector3OnSphere,
} from '../utils';
import { EmitterAcceleration } from './emitter_properties/emitter-acceleration';
import { EmitterAngle } from './emitter_properties/emitter-angle';
import { EmitterColor } from './emitter_properties/emitter-color';
import { EmitterDrag } from './emitter_properties/emitter-drag';
import { EmitterMaxAge } from './emitter_properties/emitter-max-age';
import { EmitterOpacity } from './emitter_properties/emitter-opacity';
import { EmitterPosition } from './emitter_properties/emitter-position';
import { EmitterRotation } from './emitter_properties/emitter-rotation';
import { EmitterSize } from './emitter_properties/emitter-size';
import { EmitterVelocity } from './emitter_properties/emitter-velocity';
import { EmitterWiggle } from './emitter_properties/emitter-wiggle';
import { Group } from './group';

/* eslint-disable */
/**
 * An SPE.Emitter instance.
 * @typedef {Object} Emitter
 * @see SPE.Emitter
 */

/**
 * A map of options to configure an SPE.Emitter instance.
 *
 * @typedef {Object} EmitterOptions
 *
 * @property {distribution} [type=BOX] The default distribution this emitter should use to control
 *                         its particle's spawn position and force behaviour.
 *                         Must be an SPE.distributions.* value.
 *
 *
 * @property {Number} [particleCount=100] The total number of particles this emitter will hold. NOTE: this is not the number
 *                                  of particles emitted in a second, or anything like that. The number of particles
 *                                  emitted per-second is calculated by particleCount / maxAge (approximately!)
 *
 * @property {Number|null} [duration=null] The duration in seconds that this emitter should live for. If not specified, the emitter
 *                                         will emit particles indefinitely.
 *                                         NOTE: When an emitter is older than a specified duration, the emitter is NOT removed from
 *                                         it's group, but rather is just marked as dead, allowing it to be reanimated at a later time
 *                                         using `SPE.Emitter.prototype.enable()`.
 *
 * @property {Boolean} [isStatic=false] Whether this emitter should be not be simulated (true).
 * @property {Boolean} [activeMultiplier=1] A value between 0 and 1 describing what percentage of this emitter's particlesPerSecond should be
 *                                          emitted, where 0 is 0%, and 1 is 100%.
 *                                          For example, having an emitter with 100 particles, a maxAge of 2, yields a particlesPerSecond
 *                                          value of 50. Setting `activeMultiplier` to 0.5, then, will only emit 25 particles per second (0.5 = 50%).
 *                                          Values greater than 1 will emulate a burst of particles, causing the emitter to run out of particles
 *                                          before it's next activation cycle.
 *
 * @property {Boolean} [direction=1] The direction of the emitter. If value is `1`, emitter will start at beginning of particle's lifecycle.
 *                                   If value is `-1`, emitter will start at end of particle's lifecycle and work it's way backwards.
 *
 * @property {Object} [maxAge={}] An object describing the particle's maximum age in seconds.
 * @property {Number} [maxAge.value=2] A number between 0 and 1 describing the amount of maxAge to apply to all particles.
 * @property {Number} [maxAge.spread=0] A number describing the maxAge variance on a per-particle basis.
 *
 *
 * @property {Object} [position={}] An object describing this emitter's position.
 * @property {Object} [position.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base position.
 * @property {Object} [position.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's position variance on a per-particle basis.
 *                                                          Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                          of this vector is used.
 *                                                          When using a LINE distribution, this value is the endpoint of the LINE.
 * @property {Object} [position.spreadClamp=new THREE.Vector3()] A THREE.Vector3 instance describing the numeric multiples the particle's should
 *                                                               be spread out over.
 *                                                               Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                               of this vector is used.
 *                                                               When using a LINE distribution, this property is ignored.
 * @property {Number} [position.radius=10] This emitter's base radius.
 * @property {Object} [position.radiusScale=new THREE.Vector3()] A THREE.Vector3 instance describing the radius's scale in all three axes. Allows a SPHERE or DISC to be squashed or stretched.
 * @property {distribution} [position.distribution=value of the `type` option.] A specific distribution to use when radiusing particles. Overrides the `type` option.
 * @property {Boolean} [position.randomise=false] When a particle is re-spawned, whether it's position should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [velocity={}] An object describing this particle velocity.
 * @property {Object} [velocity.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base velocity.
 * @property {Object} [velocity.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's velocity variance on a per-particle basis.
 *                                                          Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                          of this vector is used.
 * @property {distribution} [velocity.distribution=value of the `type` option.] A specific distribution to use when calculating a particle's velocity. Overrides the `type` option.
 * @property {Boolean} [velocity.randomise=false] When a particle is re-spawned, whether it's velocity should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [acceleration={}] An object describing this particle's acceleration.
 * @property {Object} [acceleration.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base acceleration.
 * @property {Object} [acceleration.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's acceleration variance on a per-particle basis.
 *                           Note that when using a SPHERE or DISC distribution, only the x-component
 *                           of this vector is used.
 * @property {distribution} [acceleration.distribution=value of the `type` option.] A specific distribution to use when calculating a particle's acceleration. Overrides the `type` option.
 * @property {Boolean} [acceleration.randomise=false] When a particle is re-spawned, whether it's acceleration should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [drag={}] An object describing this particle drag. Drag is applied to both velocity and acceleration values.
 * @property {Number} [drag.value=0] A number between 0 and 1 describing the amount of drag to apply to all particles.
 * @property {Number} [drag.spread=0] A number describing the drag variance on a per-particle basis.
 * @property {Boolean} [drag.randomise=false] When a particle is re-spawned, whether it's drag should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [wiggle={}] This is quite a fun one! The values of this object will determine whether a particle will wiggle, or jiggle, or wave,
 *                                or shimmy, or waggle, or... Well you get the idea. The wiggle is calculated over-time, meaning that a particle will
 *                                start off with no wiggle, and end up wiggling about with the distance of the `value` specified by the time it dies.
 *                                It's quite handy to simulate fire embers, or similar effects where the particle's position should slightly change over
 *                                time, and such change isn't easily controlled by rotation, velocity, or acceleration. The wiggle is a combination of sin and cos calculations, so is circular in nature.
 * @property {Number} [wiggle.value=0] A number describing the amount of wiggle to apply to all particles. It's measured in distance.
 * @property {Number} [wiggle.spread=0] A number describing the wiggle variance on a per-particle basis.
 *
 *
 * @property {Object} [rotation={}] An object describing this emitter's rotation. It can either be static, or set to rotate from 0radians to the value of `rotation.value`
 *                                  over a particle's lifetime. Rotation values affect both a particle's position and the forces applied to it.
 * @property {Object} [rotation.axis=new THREE.Vector3(0, 1, 0)] A THREE.Vector3 instance describing this emitter's axis of rotation.
 * @property {Object} [rotation.axisSpread=new THREE.Vector3()] A THREE.Vector3 instance describing the amount of variance to apply to the axis of rotation on
 *                                                              a per-particle basis.
 * @property {Number} [rotation.angle=0] The angle of rotation, given in radians. If `rotation.static` is true, the emitter will start off rotated at this angle, and stay as such.
 *                                       Otherwise, the particles will rotate from 0radians to this value over their lifetimes.
 * @property {Number} [rotation.angleSpread=0] The amount of variance in each particle's rotation angle.
 * @property {Boolean} [rotation.static=false] Whether the rotation should be static or not.
 * @property {Object} [rotation.center=The value of `position.value`] A THREE.Vector3 instance describing the center point of rotation.
 * @property {Boolean} [rotation.randomise=false] When a particle is re-spawned, whether it's rotation should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [color={}] An object describing a particle's color. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of THREE.Color instances are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Object} [color.value=new THREE.Color()] Either a single THREE.Color instance, or an array of THREE.Color instances to describe the color of a particle over it's lifetime.
 * @property {Object} [color.spread=new THREE.Vector3()] Either a single THREE.Vector3 instance, or an array of THREE.Vector3 instances to describe the color variance of a particle over it's lifetime.
 * @property {Boolean} [color.randomise=false] When a particle is re-spawned, whether it's color should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [opacity={}] An object describing a particle's opacity. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Number} [opacity.value=1] Either a single number, or an array of numbers to describe the opacity of a particle over it's lifetime.
 * @property {Number} [opacity.spread=0] Either a single number, or an array of numbers to describe the opacity variance of a particle over it's lifetime.
 * @property {Boolean} [opacity.randomise=false] When a particle is re-spawned, whether it's opacity should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [size={}] An object describing a particle's size. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Number} [size.value=1] Either a single number, or an array of numbers to describe the size of a particle over it's lifetime.
 * @property {Number} [size.spread=0] Either a single number, or an array of numbers to describe the size variance of a particle over it's lifetime.
 * @property {Boolean} [size.randomise=false] When a particle is re-spawned, whether it's size should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [angle={}] An object describing a particle's angle. The angle is a 2d-rotation, measured in radians, applied to the particle's texture.
 *                               NOTE: if a particle's texture is a sprite-sheet, this value IS IGNORED.
 *                               This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Number} [angle.value=0] Either a single number, or an array of numbers to describe the angle of a particle over it's lifetime.
 * @property {Number} [angle.spread=0] Either a single number, or an array of numbers to describe the angle variance of a particle over it's lifetime.
 * @property {Boolean} [angle.randomise=false] When a particle is re-spawned, whether it's angle should be re-randomised or not. Can incur a performance hit.
 *
 */

/**
 * The SPE.Emitter class.
 *
 * @constructor
 *
 * @param {EmitterOptions} options A map of options to configure the emitter.
 */
export class Emitter {
    private _type: Distribution;
    private _uuid: string;

    private _position: EmitterPosition;
    private _velocity: EmitterVelocity;
    private _acceleration: EmitterAcceleration;
    private _drag: EmitterDrag;
    private _wiggle: EmitterWiggle;
    private _rotation: EmitterRotation;
    private _maxAge: EmitterMaxAge;
    private _color: EmitterColor;
    private _opacity: EmitterOpacity;
    private _size: EmitterSize;
    private _angle: EmitterAngle;
    private _particleCount: number;
    private _duration: number;
    private _isStatic: boolean;
    private _activeMultiplier: number;
    private _direction: number;
    private _alive: boolean;

    // The following properties are set internally and are not
    // user-controllable.
    private _particlesPerSecond: number;
    private _activationIndex: number;
    private _attributeOffset: number;
    private _attributeEnd: number;
    private _age: number;
    private _activeParticleCount: number;
    private _group: Group | null;
    private _attributes: GroupAttributesMap | null;
    private _paramsArray: TypedArray | null;

    private _resetFlags: Partial<Record<EmitterProperty, boolean>>;
    private _updateFlags: Partial<Record<EmitterProperty, boolean>>;
    private _updateCounts: Partial<Record<EmitterProperty, number>>;
    private _updateMap: Partial<Record<EmitterProperty, EmitterProperty>>;

    private _bufferUpdateRanges: Partial<Record<keyof GroupAttributesMap, { min: number; max: number }>>;
    private _attributeKeys: Array<keyof GroupAttributesMap> | null;
    private _attributeCount: number;
    private _activationEnd!: number;

    public constructor(options?: EmitterOptions) {
        const lifetimeLength = valueOverLifetimeLength;

        // Ensure we have a map of options to play with,
        // and that each option is in the correct format.
        options = ensureTypedArg(options, 'object', {});
        options.position = ensureTypedArg(options.position, 'object', {});
        options.velocity = ensureTypedArg(options.velocity, 'object', {});
        options.acceleration = ensureTypedArg(options.acceleration, 'object', {});
        options.radius = ensureTypedArg(options.radius, 'object', {});
        options.drag = ensureTypedArg(options.drag, 'object', {});
        options.rotation = ensureTypedArg(options.rotation, 'object', {});
        options.color = ensureTypedArg(options.color, 'object', {});
        options.opacity = ensureTypedArg(options.opacity, 'object', {});
        options.size = ensureTypedArg(options.size, 'object', {});
        options.angle = ensureTypedArg(options.angle, 'object', {});
        options.wiggle = ensureTypedArg(options.wiggle, 'object', {});
        options.maxAge = ensureTypedArg(options.maxAge, 'object', {});

        this._uuid = MathUtils.generateUUID();

        this._type = ensureTypedArg(options.type, 'number', Distribution.box);

        // Start assigning properties...kicking it off with props that DON'T support values over
        // lifetimes.
        //
        // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.
        this._position = new EmitterPosition(
            options.position.value,
            options.position.spread,
            options.position.spreadClamp,
            options.position.distribution,
            options.position.randomize,
            options.position.radius,
            options.position.radiusScale,
            options.position.distributionClamp,
            this,
        );

        this._velocity = new EmitterVelocity(
            options.velocity.value,
            options.velocity.spread,
            options.velocity.distribution,
            options.velocity.randomize,
            this,
        );

        this._acceleration = new EmitterAcceleration(
            options.acceleration.value,
            options.acceleration.spread,
            options.acceleration.distribution,
            options.acceleration.randomize,
            this,
        );

        this._drag = new EmitterDrag(options.drag.value, options.drag.spread, options.drag.randomize, this);

        this._wiggle = new EmitterWiggle(options.wiggle.value, options.wiggle.spread, this);

        this._rotation = new EmitterRotation(
            options.rotation.axis,
            options.rotation.axisSpread,
            options.rotation.angle,
            options.rotation.angleSpread,
            options.rotation.static,
            options.rotation.center,
            options.rotation.randomize,
            this,
        );

        this._maxAge = new EmitterMaxAge(options.maxAge.value, options.maxAge.spread, this);

        // The following properties can support either single values, or an array of values that change
        // the property over a particle's lifetime (value over lifetime).
        this._color = new EmitterColor(options.color.value, options.color.spread, options.color.randomize, this);

        this._opacity = new EmitterOpacity(
            options.opacity.value,
            options.opacity.spread,
            options.opacity.randomize,
            this,
        );

        this._size = new EmitterSize(options.size.value, options.size.spread, options.size.randomize, this);

        this._angle = new EmitterAngle(options.angle.value, options.angle.spread, options.angle.randomize, this);

        // Assign remaining option values.
        this._particleCount = ensureTypedArg(options.particleCount, 'number', 100);
        this._duration = ensureTypedArg(options.duration, 'number', -1);
        this._isStatic = ensureTypedArg(options.isStatic, 'boolean', false);
        this._activeMultiplier = ensureTypedArg(options.activeMultiplier, 'number', 1);
        this._direction = ensureTypedArg(options.direction, 'number', 1);

        // Whether this emitter is alive or not.
        this._alive = ensureTypedArg(options.alive, 'boolean', true);

        // The following properties are set internally and are not
        // user-controllable.
        this._particlesPerSecond = 0;

        // The current particle index for which particles should
        // be marked as active on the next update cycle.
        this._activationIndex = 0;

        // The offset in the typed arrays this emitter's
        // particle's values will start at
        this._attributeOffset = 0;

        // The end of the range in the attribute buffers
        this._attributeEnd = 0;

        // Holds the time the emitter has been alive for.
        this._age = 0.0;

        // Holds the number of currently-alive particles
        this._activeParticleCount = 0.0;

        // Holds a reference to this emitter's group once
        // it's added to one.
        this._group = null;

        // Holds a reference to this emitter's group's attributes object
        // for easier access.
        this._attributes = null;

        // Holds a reference to the params attribute's typed array
        // for quicker access.
        this._paramsArray = null;

        // A set of flags to determine whether particular properties
        // should be re-randomised when a particle is reset.
        //
        // If a `randomise` property is given, this is preferred.
        // Otherwise, it looks at whether a spread value has been
        // given.
        //
        // It allows randomization to be turned off as desired. If
        // all randomization is turned off, then I'd expect a performance
        // boost as no attribute buffers (excluding the `params`)
        // would have to be re-passed to the GPU each frame (since nothing
        // except the `params` attribute would have changed).
        this._resetFlags = {
            // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
            //     utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
            position:
                ensureTypedArg(options.position.randomize, 'boolean', false) ||
                ensureTypedArg(options.radius.randomize, 'boolean', false),
            velocity: ensureTypedArg(options.velocity.randomize, 'boolean', false),
            acceleration:
                ensureTypedArg(options.acceleration.randomize, 'boolean', false) ||
                ensureTypedArg(options.drag.randomize, 'boolean', false),
            rotation: ensureTypedArg(options.rotation.randomize, 'boolean', false),
            rotationCenter: ensureTypedArg(options.rotation.randomize, 'boolean', false),
            size: ensureTypedArg(options.size.randomize, 'boolean', false),
            color: ensureTypedArg(options.color.randomize, 'boolean', false),
            opacity: ensureTypedArg(options.opacity.randomize, 'boolean', false),
            angle: ensureTypedArg(options.angle.randomize, 'boolean', false),
        };

        this._updateFlags = {};
        this._updateCounts = {};

        // A map to indicate which emitter parameters should update
        // which attribute.
        this._updateMap = {
            [EmitterProperty.maxAge]: EmitterProperty.params,
            [EmitterProperty.position]: EmitterProperty.position,
            [EmitterProperty.velocity]: EmitterProperty.velocity,
            [EmitterProperty.acceleration]: EmitterProperty.acceleration,
            [EmitterProperty.drag]: EmitterProperty.acceleration,
            [EmitterProperty.wiggle]: EmitterProperty.params,
            [EmitterProperty.rotation]: EmitterProperty.rotation,
            [EmitterProperty.size]: EmitterProperty.size,
            [EmitterProperty.color]: EmitterProperty.color,
            [EmitterProperty.opacity]: EmitterProperty.opacity,
            [EmitterProperty.angle]: EmitterProperty.angle,
        };

        for (const key in this._updateMap) {
            if (this._updateMap.hasOwnProperty(key as EmitterProperty)) {
                const property = this._updateMap[key as EmitterProperty]!;
                this._updateCounts[property] = 0.0;
                this._updateFlags[property] = false;
            }
        }

        this._bufferUpdateRanges = {};
        this._attributeKeys = null;
        this._attributeCount = 0;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public get resetFlags(): Partial<Record<EmitterProperty, boolean>> {
        return this._resetFlags;
    }

    public get updateMap(): Partial<Record<EmitterProperty, EmitterProperty>> {
        return this._updateMap;
    }

    public get updateFlags(): Partial<Record<EmitterProperty, boolean>> {
        return this._updateFlags;
    }

    public get updateCounts(): Partial<Record<EmitterProperty, number>> {
        return this._updateCounts;
    }

    public get group(): Group | null {
        return this._group;
    }

    public set group(value: Group | null) {
        this._group = value;
    }

    public get type(): Distribution {
        return this._type;
    }

    public get position(): EmitterPosition {
        return this._position;
    }

    public get velocity(): EmitterVelocity {
        return this._velocity;
    }

    public get acceleration(): EmitterAcceleration {
        return this._acceleration;
    }

    public get drag(): EmitterDrag {
        return this._drag;
    }

    public get wiggle(): EmitterWiggle {
        return this._wiggle;
    }

    public get rotation(): EmitterRotation {
        return this._rotation;
    }

    public get maxAge(): EmitterMaxAge {
        return this._maxAge;
    }

    public get color(): EmitterColor {
        return this._color;
    }

    public get opacity(): EmitterOpacity {
        return this._opacity;
    }

    public get size(): EmitterSize {
        return this._size;
    }

    public get angle(): EmitterAngle {
        return this._angle;
    }

    public get particleCount(): number {
        return this._particleCount;
    }

    public get duration(): number {
        return this._duration;
    }

    public get attributes(): GroupAttributesMap | null {
        return this._attributes;
    }

    public set attributes(value: GroupAttributesMap | null) {
        this._attributes = value;
    }

    public get attributeOffset(): number {
        return this._attributeOffset;
    }

    public get bufferUpdateRanges(): Partial<Record<keyof GroupAttributesMap, { min: number; max: number }>> {
        return this._bufferUpdateRanges;
    }

    public setBufferUpdateRanges(keys: Array<keyof GroupAttributesMap>): void {
        this._attributeKeys = keys;
        this._attributeCount = keys.length;

        for (let i = this._attributeCount - 1; i >= 0; --i) {
            this._bufferUpdateRanges[keys[i]] = {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
            };
        }
    }

    public calculatePPSValue(groupMaxAge: number): void {
        // Calculate the `particlesPerSecond` value for this emitter. It's used
        // when determining which particles should die and which should live to
        // see another day. Or be born, for that matter. The "God" property.
        if (this._duration !== -1) {
            this._particlesPerSecond =
                this._particleCount / (groupMaxAge < this._duration ? groupMaxAge : this._duration);
        } else {
            this._particlesPerSecond = this._particleCount / groupMaxAge;
        }
    }

    public setAttributeOffset(startIndex: number): void {
        this._attributeOffset = startIndex;
        this._activationIndex = startIndex;
        this._activationEnd = startIndex + this._particleCount;
    }

    // ToDo: Check this line because the type should be              prop:EmitterProperty
    public assignValue(prop: keyof GroupAttributesMap, index: number): void {
        switch (prop) {
            case 'position':
                this.assignPositionValue(index);
                break;

            case 'velocity':
            case 'acceleration':
                this.assignForceValue(index, prop);
                break;

            case 'size':
            case 'opacity':
                this.assignAbsLifetimeValue(index, prop);
                break;

            case 'angle':
                this.assignAngleValue(index);
                break;

            case 'params':
                this.assignParamsValue(index);
                break;

            case 'rotation':
                this.assignRotationValue(index);
                break;

            case 'color':
                this.assignColorValue(index);
                break;
            case 'rotationCenter':
                // ToDo: Check this, see above
                break;
        }
    }

    public assignPositionValue(index: number): void {
        const prop = this.position;
        const attr = this._attributes!.position;
        const value = prop.value;
        const spread = prop.spread;
        const distribution = prop.distribution;

        switch (distribution) {
            case Distribution.box:
                randomVector3(attr, index, value, spread, prop.spreadClamp);
                break;

            case Distribution.sphere:
                randomVector3OnSphere(
                    attr,
                    index,
                    value,
                    prop.radius,
                    prop.spread.x,
                    prop.radiusScale,
                    prop.spreadClamp.x,
                    // prop._distributionClamp || this._particleCount,
                );
                break;

            case Distribution.disc:
                randomVector3OnDisc(
                    attr,
                    index,
                    value,
                    prop.radius,
                    prop.spread.x,
                    prop.radiusScale,
                    prop.spreadClamp.x,
                );
                break;

            case Distribution.line:
                randomVector3OnLine(attr, index, value, spread);
                break;
        }
    }

    public assignForceValue(index: number, attrName: 'acceleration' | 'velocity'): void {
        const prop = this[attrName];
        const value = prop.value;
        const spread = prop.spread;
        const distribution = prop.distribution;

        switch (distribution) {
            case Distribution.box:
                randomVector3(this._attributes![attrName], index, value, spread);
                break;

            case Distribution.sphere:
                {
                    const pos = this._attributes!.position!.typedArray!.array;
                    const i = index * 3;

                    const positionX = pos[i] as number;
                    const positionY = pos[i + 1] as number;
                    const positionZ = pos[i + 2] as number;

                    randomDirectionVector3OnSphere(
                        this._attributes![attrName],
                        index,
                        positionX,
                        positionY,
                        positionZ,
                        this.position.value,
                        prop.value.x,
                        prop.spread.x,
                    );
                }
                break;

            case Distribution.disc:
                {
                    const pos = this._attributes!.position!.typedArray!.array;
                    const i = index * 3;

                    const positionX = pos[i] as number;
                    const positionY = pos[i + 1] as number;
                    const positionZ = pos[i + 2] as number;

                    randomDirectionVector3OnDisc(
                        this._attributes![attrName],
                        index,
                        positionX,
                        positionY,
                        positionZ,
                        this.position.value,
                        prop.value.x,
                        prop.spread.x,
                    );
                }
                break;

            case Distribution.line:
                randomVector3OnLine(this._attributes![attrName], index, value, spread);
                break;
        }

        if (attrName === 'acceleration') {
            const drag = clamp(randomFloat(this.drag.value, this.drag.spread), 0, 1);
            this._attributes!.acceleration!.typedArray!.array[index * 4 + 3] = drag;
        }
    }

    public assignAbsLifetimeValue(index: number, propName: 'size' | 'opacity') {
        const array = this._attributes![propName].typedArray!;
        const prop = this[propName];

        if (arrayValuesAreEqual(prop.value) && arrayValuesAreEqual(prop.spread)) {
            const value = Math.abs(randomFloat(prop.value[0], prop.spread[0]));
            array.setVec4Components(index, value, value, value, value);
        } else {
            array.setVec4Components(
                index,
                Math.abs(randomFloat(prop.value[0], prop.spread[0])),
                Math.abs(randomFloat(prop.value[1], prop.spread[1])),
                Math.abs(randomFloat(prop.value[2], prop.spread[2])),
                Math.abs(randomFloat(prop.value[3], prop.spread[3])),
            );
        }
    }

    public assignAngleValue(index: number): void {
        const array = this._attributes!.angle.typedArray!;
        const prop = this.angle;

        if (arrayValuesAreEqual(prop.value) && arrayValuesAreEqual(prop.spread)) {
            const value = randomFloat(prop.value[0], prop.spread[0]);
            array.setVec4Components(index, value, value, value, value);
        } else {
            array.setVec4Components(
                index,
                randomFloat(prop.value[0], prop.spread[0]),
                randomFloat(prop.value[1], prop.spread[1]),
                randomFloat(prop.value[2], prop.spread[2]),
                randomFloat(prop.value[3], prop.spread[3]),
            );
        }
    }

    public assignParamsValue(index: number): void {
        this._attributes!.params.typedArray!.setVec4Components(
            index,
            this._isStatic ? 1 : 0,
            0.0,
            Math.abs(randomFloat(this.maxAge.value, this.maxAge.spread)),
            randomFloat(this.wiggle.value, this.wiggle.spread),
        );
    }

    public assignRotationValue(index: number): void {
        this._attributes!.rotation.typedArray!.setVec3Components(
            index,
            getPackedRotationAxis(this.rotation.axis, this.rotation.axisSpread),
            randomFloat(this.rotation.angle, this.rotation.angleSpread),
            this.rotation.static ? 0 : 1,
        );

        this._attributes!.rotationCenter.typedArray!.setVec3(index, this.rotation.center);
    }

    public assignColorValue(index: number): void {
        randomColorAsHex(this._attributes!.color, index, this.color.value, this.color.spread);
    }

    /**
     * Simulates one frame's worth of particles, updating particles
     * that are already alive, and marking ones that are currently dead
     * but should be alive as alive.
     *
     * If the emitter is marked as static, then this function will do nothing.
     *
     * @param  {Number} dt The number of seconds to simulate (deltaTime)
     */
    public tick(dt: number): void {
        if (this._isStatic) {
            return;
        }

        if (this._paramsArray === null) {
            this._paramsArray = this._attributes!.params.typedArray!.array;
        }

        const start = this._attributeOffset;
        const end = start + this._particleCount;
        const params = this._paramsArray; // vec3( alive, age, maxAge, wiggle )
        const ppsDt = this._particlesPerSecond * this._activeMultiplier * dt;
        const activationIndex = this._activationIndex;

        // Increment age for those particles that are alive,
        // and kill off any particles whose age is over the limit.
        this._checkParticleAges(start, end, params, dt);

        // If the emitter is dead, reset the age of the emitter to zero,
        // ready to go again if required
        if (this._alive === false) {
            this._age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead.
        if (this._duration !== -1 && this._age > this._duration) {
            this._alive = false;
            this._age = 0.0;
            return;
        }

        const activationStart = this._particleCount === 1 ? activationIndex : activationIndex | 0;
        const activationEnd = Math.min(activationStart + ppsDt, this._activationEnd);
        const activationCount = (activationEnd - this._activationIndex) | 0;
        const dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

        this._activateParticles(activationStart, activationEnd, params, dtPerParticle);

        // Move the activation window forward, soldier.
        this._activationIndex += ppsDt;

        if (this._activationIndex > end) {
            this._activationIndex = start;
        }

        // Increment the age of the emitter.
        this._age += dt;
    }

    /**
     * Resets all the emitter's particles to their start positions
     * and marks the particles as dead if the `force` argument is
     * true.
     *
     * @param  {Boolean} [force=undefined] If true, all particles will be marked as dead instantly.
     * @return {Emitter}       This emitter instance.
     */
    public reset(force: boolean = false): Emitter {
        this._age = 0.0;
        this._alive = false;

        if (force === true) {
            const start = this._attributeOffset;
            const end = start + this._particleCount;
            const array = this._paramsArray!;
            const attr = this._attributes!.params.bufferAttribute!;

            for (let i = end - 1, index; i >= start; --i) {
                index = i * 4;

                array[index] = 0.0;
                array[index + 1] = 0.0;
            }

            attr.updateRange.offset = 0;
            attr.updateRange.count = -1;
            attr.needsUpdate = true;
        }

        return this;
    }

    /**
     * Enables the emitter. If not already enabled, the emitter
     * will start emitting particles.
     *
     * @return {Emitter} This emitter instance.
     */
    public enable(): Emitter {
        this._alive = true;
        return this;
    }

    /**
     * Disables th emitter, but does not instantly remove it's
     * particles fromt the scene. When called, the emitter will be
     * 'switched off' and just stop emitting. Any particle's alive will
     * be allowed to finish their lifecycle.
     *
     * @return {Emitter} This emitter instance.
     */
    public disable(): Emitter {
        this._alive = false;
        return this;
    }

    /**
     * Remove this emitter from it's parent group (if it has been added to one).
     * Delgates to SPE.group.prototype.removeEmitter().
     *
     * When called, all particle's belonging to this emitter will be instantly
     * removed from the scene.
     *
     * @return {Emitter} This emitter instance.
     *
     * @see SPE.Group.prototype.removeEmitter
     */
    public remove(): Emitter {
        if (this.group !== null) {
            this.group.removeEmitter(this);
        } else {
            console.error('Emitter does not belong to a group, cannot remove.');
        }

        return this;
    }

    public onRemove(): void {
        // Reset any properties of the emitter that were set by
        // a group when it was added.
        this._particlesPerSecond = 0;
        this._attributeOffset = 0;
        this._activationIndex = 0;
        this._activeParticleCount = 0;
        this._group = null;
        this._attributes = null;
        this._paramsArray = null;
        this._age = 0.0;
    }

    public _resetParticle(index: number): void {
        const resetFlags = this.resetFlags;
        const updateFlags = this.updateFlags;
        const updateCounts = this.updateCounts;
        const keys = this._attributeKeys!;

        for (let i = this._attributeCount - 1; i >= 0; --i) {
            const key = keys[i];
            const updateFlag = updateFlags[key];

            if (resetFlags[key] === true || updateFlag === true) {
                this.assignValue(key, index);
                this._updateAttributeUpdateRange(key, index);

                if (updateFlag === true && updateCounts[key] === this._particleCount) {
                    updateFlags[key] = false;
                    updateCounts[key] = 0.0;
                } else if (updateFlag == true) {
                    ++updateCounts[key]!;
                }
            }
        }
    }

    private _updateAttributeUpdateRange(attr: keyof GroupAttributesMap, i: number): void {
        const ranges = this._bufferUpdateRanges[attr]!;

        ranges.min = Math.min(i, ranges.min);
        ranges.max = Math.max(i, ranges.max);
    }

    private _decrementParticleCount(): void {
        --this._activeParticleCount;

        // TODO:
        //  - Trigger event if count === 0.
    }

    public _incrementParticleCount(): void {
        ++this._activeParticleCount;

        // TODO:
        //  - Trigger event if count === this.particleCount.
    }

    private _checkParticleAges(start: number, end: number, params: TypedArray, dt: number): void {
        for (let i = end - 1, index, maxAge, age, alive; i >= start; --i) {
            index = i * 4;

            alive = params[index];

            if (alive === 0.0) {
                continue;
            }

            // Increment age
            age = params[index + 1];
            maxAge = params[index + 2];

            if (this._direction === 1) {
                age += dt;

                if (age >= maxAge) {
                    age = 0.0;
                    alive = 0.0;
                    this._decrementParticleCount();
                }
            } else {
                age -= dt;

                if (age <= 0.0) {
                    age = maxAge;
                    alive = 0.0;
                    this._decrementParticleCount();
                }
            }

            params[index] = alive;
            params[index + 1] = age;

            this._updateAttributeUpdateRange('params', i);
        }
    }

    private _activateParticles(
        activationStart: number,
        activationEnd: number,
        params: TypedArray,
        dtPerParticle: number,
    ): void {
        const direction = this._direction;

        for (let i = activationStart, index, dtValue; i < activationEnd; ++i) {
            index = i * 4;

            // Don't re-activate particles that aren't dead yet.
            // if ( params[ index ] !== 0.0 && ( this.particleCount !== 1 || this.activeMultiplier !== 1 ) ) {
            //     continue;
            // }

            if (params[index] != 0.0 && this._particleCount !== 1) {
                continue;
            }

            // Increment the active particle count.
            this._incrementParticleCount();

            // Mark the particle as alive.
            params[index] = 1.0;

            // Reset the particle
            this._resetParticle(i);

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            dtValue = dtPerParticle * (i - activationStart);
            params[index + 1] = direction === -1 ? params[index + 2] - dtValue : dtValue;

            this._updateAttributeUpdateRange('params', i);
        }
    }
}

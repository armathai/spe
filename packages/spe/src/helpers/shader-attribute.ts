import { BufferAttribute } from 'three';
import { CompositeTypedArray } from './composite-typed-array';

export enum ComponentSize {
    /**
     * Float
     * @type {Number}
     */
    f = 1,

    /**
     * Vec2
     * @type {Number}
     */
    v2 = 2,

    /**
     * Vec3
     * @type {Number}
     */
    v3 = 3,

    /**
     * Vec4
     * @type {Number}
     */
    v4 = 4,

    /**
     * Color
     * @type {Number}
     */
    c = 3,

    /**
     * Mat3
     * @type {Number}
     */
    m3 = 9,

    /**
     * Mat4
     * @type {Number}
     */
    m4 = 16,
}
/**
 * A helper to handle creating and updating a THREE.BufferAttribute instance.
 *
 * @author  Luke Moody
 * @constructor
 * @param {String} type          The buffer attribute type. See SPE.ShaderAttribute.typeSizeMap for valid values.
 * @param {Boolean=} dynamicBuffer Whether this buffer attribute should be marked as dynamic or not.
 * @param {Function=} arrayType     A reference to a TypedArray constructor. Defaults to Float32Array if none provided.
 */
export class ShaderAttribute {
    private _typedArray: CompositeTypedArray | null = null;
    private _bufferAttribute: BufferAttribute | null = null;

    private _updateMin = 0;
    private _updateMax = 0;

    public constructor(
        private _componentSize: ComponentSize = ComponentSize.f,
        private _dynamicBuffer: boolean = false,
        private _arrayType = Float32Array
    ) {}
}

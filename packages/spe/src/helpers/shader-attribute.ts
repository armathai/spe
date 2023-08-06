import { BufferAttribute, DynamicDrawUsage, StaticDrawUsage } from 'three';
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
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
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
        private _arrayType = Float32Array,
    ) {}

    public get typedArray(): CompositeTypedArray | null {
        return this._typedArray;
    }

    public get bufferAttribute(): BufferAttribute | null {
        return this._bufferAttribute;
    }

    /**
     * Returns the length of the typed array associated with this attribute.
     * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
     */
    public getLength(): number {
        if (this._typedArray === null) {
            return 0;
        }

        return this._typedArray.array.length;
    }

    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     *
     * @param {Number} min The start of the range to mark as needing an update.
     * @param {Number} max The end of the range to mark as needing an update.
     */
    public setUpdateRange(min: number, max: number): void {
        this._updateMin = Math.min(min * this._componentSize, this._updateMin * this._componentSize);
        this._updateMax = Math.max(max * this._componentSize, this._updateMax * this._componentSize);
    }

    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    public flagUpdate(): void {
        const attr = this._bufferAttribute;
        const range = attr!.updateRange;

        range.offset = this._updateMin;
        range.count = Math.min(this._updateMax - this._updateMin + this._componentSize, this._typedArray!.array.length);
        attr!.needsUpdate = true;
    }

    /**
     * Reset the index update counts for this attribute
     */
    public resetUpdateRange(): void {
        this._updateMin = 0;
        this._updateMax = 0;
    }

    public resetDynamic(): void {
        this._bufferAttribute!.usage = this._dynamicBuffer ? DynamicDrawUsage : StaticDrawUsage;
    }

    /**
     * Perform a splice operation on this attribute's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     */
    public splice(start: number, end: number): void {
        this._typedArray!.splice(start, end);

        // Reset the reference to the attribute's typed array
        // since it has probably changed.
        this.forceUpdateAll();
    }

    public forceUpdateAll(): void {
        this._bufferAttribute!.array = this._typedArray!.array;
        this._bufferAttribute!.updateRange.offset = 0;
        this._bufferAttribute!.updateRange.count = -1;

        this._bufferAttribute!.usage = StaticDrawUsage;
        this._bufferAttribute!.needsUpdate = true;
    }

    /**
     * Creates a THREE.BufferAttribute instance if one doesn't exist already.
     *
     * Ensures a typed array is present by calling _ensureTypedArray() first.
     *
     * If a buffer attribute exists already, then it will be marked as needing an update.
     *
     * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
     */
    public createBufferAttribute(size: number): void {
        // Make sure the typedArray is present and correct.
        this._ensureTypedArray(size);

        // Don't create it if it already exists, but do
        // flag that it needs updating on the next render
        // cycle.
        if (this._bufferAttribute !== null) {
            this._bufferAttribute.array = this._typedArray!.array;

            this._bufferAttribute.needsUpdate = true;
            return;
        }

        this._bufferAttribute = new BufferAttribute(this._typedArray!.array, this._componentSize);

        this._bufferAttribute.usage = this._dynamicBuffer ? DynamicDrawUsage : StaticDrawUsage;
    }

    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new SPE.TypedArrayHelper instance will be created.
     *
     * @param  {Number} size The size of the typed array to create or update to.
     */
    private _ensureTypedArray(size: number): void {
        // Condition that's most likely to be true at the top: no change.
        if (this._typedArray !== null && this._typedArray.size === size * this._componentSize) {
            return;
        }

        // Resize the array if we need to, telling the TypedArrayHelper to
        // ignore it's component size when evaluating size.
        else if (this._typedArray !== null && this._typedArray.size !== size) {
            this._typedArray.setSize(size);
        }

        // This condition should only occur once in an attribute's lifecycle.
        else if (this._typedArray === null) {
            this._typedArray = new CompositeTypedArray(this._arrayType, size, this._componentSize);
        }
    }
}

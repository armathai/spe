import { Color, Matrix3, Matrix4, TypedArray, Vector2, Vector3, Vector4 } from 'three';
import { TypedArrayConstructor } from '../types';

export class CompositeTypedArray {
    private _array: TypedArray;

    public constructor(
        private _typedArrayConstructor: TypedArrayConstructor<TypedArray> = Float32Array,
        private _size = 1,
        private _componentSize = 1,
        private _indexOffset = 0,
    ) {
        this._array = new _typedArrayConstructor(this._size * this._componentSize);
    }

    public get array(): TypedArray {
        return this._array;
    }

    public get size(): number {
        return this._size;
    }

    /**
     * Sets the size of the internal array.
     *
     * Delegates to `this.shrink` or `this.grow` depending on size
     * argument's relation to the current size of the internal array.
     *
     * Note that if the array is to be shrunk, data will be lost.
     *
     * @param {Number} size The new size of the array.
     */
    public setSize(size: number, noComponentMultiply?: number): this | undefined {
        const currentArraySize = this._array.length;

        if (!noComponentMultiply) {
            size = size * this._componentSize;
        }

        if (size < currentArraySize) {
            return this.shrink(size);
        } else if (size > currentArraySize) {
            return this.grow(size);
        } else {
            console.info('TypedArray is already of size:', size + '.', 'Will not resize.');
        }
    }

    /**
     * Shrinks the internal array.
     *
     * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
     * @return {SPE.TypedArrayHelper}      Instance of this class.
     */
    public shrink(size: number): this {
        this._array = this._array.subarray(0, size);
        this._size = size;
        return this;
    }

    /**
     * Grows the internal array.
     * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
     * @return {SPE.TypedArrayHelper}      Instance of this class.
     */
    public grow(size: number): this {
        const existingArray = this._array;
        const newArray = new this._typedArrayConstructor(size);

        newArray.set(existingArray);
        this._array = newArray;
        this._size = size;

        return this;
    }

    /**
     * Perform a splice operation on this array's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     * @returns {Object} The SPE.TypedArrayHelper instance.
     */
    public splice(start: number, end: number): this {
        start *= this._componentSize;
        end *= this._componentSize;

        const data = [],
            array = this._array,
            size = array.length;

        for (let i = 0; i < size; ++i) {
            if (i < start || i >= end) {
                data.push(array[i]);
            }
            // array[ i ] = 0;
        }

        this.setFromArray(0, data as unknown as TypedArray);

        return this;
    }

    /**
     * Copies from the given TypedArray into this one, using the index argument
     * as the start position. Alias for `TypedArray.set`. Will automatically resize
     * if the given source array is of a larger size than the internal array.
     *
     * @param {Number} index      The start position from which to copy into this array.
     * @param {TypedArray} array The array from which to copy; the source array.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setFromArray(index: number, array: TypedArray): this {
        const sourceArraySize = array.length,
            newSize = index + sourceArraySize;

        if (newSize > this._array.length) {
            this.grow(newSize);
        } else if (newSize < this._array.length) {
            this.shrink(newSize);
        }

        this._array.set(array, this._indexOffset + index);

        return this;
    }

    /**
     * Set a Vector2 value at `index`.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Vector2} vec2  Any object that has `x` and `y` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setVec2(index: number, vec2: Vector2): this {
        return this.setVec2Components(index, vec2.x, vec2.y);
    }

    /**
     * Set a Vector2 value using raw components.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Number} x     The Vec2's `x` component.
     * @param {Number} y     The Vec2's `y` component.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setVec2Components(index: number, x: number, y: number): this {
        const array = this._array,
            i = this._indexOffset + index * this._componentSize;

        array[i] = x;
        array[i + 1] = y;
        return this;
    }

    /**
     * Set a Vector3 value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Vector3} vec3  Any object that has `x`, `y`, and `z` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setVec3(index: number, vec3: Vector3): this {
        return this.setVec3Components(index, vec3.x, vec3.y, vec3.z);
    }

    /**
     * Set a Vector3 value using raw components.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} x     The Vec3's `x` component.
     * @param {Number} y     The Vec3's `y` component.
     * @param {Number} z     The Vec3's `z` component.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setVec3Components(index: number, x: number, y: number, z: number): this {
        const array = this._array,
            i = this._indexOffset + index * this._componentSize;

        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        return this;
    }

    /**
     * Set a Vector4 value at `index`.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Vector4} vec4  Any object that has `x`, `y`, `z`, and `w` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setVec4(index: number, vec4: Vector4): this {
        return this.setVec4Components(index, vec4.x, vec4.y, vec4.z, vec4.w);
    }

    /**
     * Set a Vector4 value using raw components.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Number} x     The Vec4's `x` component.
     * @param {Number} y     The Vec4's `y` component.
     * @param {Number} z     The Vec4's `z` component.
     * @param {Number} w     The Vec4's `w` component.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setVec4Components(index: number, x: number, y: number, z: number, w: number): this {
        const array = this._array,
            i = this._indexOffset + index * this._componentSize;

        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        array[i + 3] = w;
        return this;
    }

    /**
     * Set a Matrix3 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setMat3(index: number, mat3: Matrix3): this {
        return this.setFromArray(
            this._indexOffset + index * this._componentSize,
            mat3.elements as unknown as TypedArray,
        );
    }

    /**
     * Set a Matrix4 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix4} mat4 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setMat4(index: number, mat4: Matrix4): this {
        return this.setFromArray(
            this._indexOffset + index * this._componentSize,
            mat4.elements as unknown as TypedArray,
        );
    }

    /**
     * Set a Color value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setColor(index: number, color: Color): this {
        return this.setVec3Components(index, color.r, color.g, color.b);
    }

    /**
     * Set a Number value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} numericValue  The number to assign to this index in the array.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    public setNumber(index: number, numericValue: number): this {
        this._array[this._indexOffset + index * this._componentSize] = numericValue;
        return this;
    }

    /**
     * Returns the value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * Note that this function ignores the component size and will just return a
     * single value.
     *
     * @param  {Number} index The index in the array to fetch.
     * @return {Number}       The value at the given index.
     */
    public getValueAtIndex(index: number): number {
        return this._array[this._indexOffset + index];
    }

    /**
     * Returns the component value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * If the componentSize is set to 3, then it will return a new TypedArray
     * of length 3.
     *
     * @param  {Number} index The index in the array to fetch.
     * @return {TypedArray}       The component value at the given index.
     */
    public getComponentValueAtIndex(index: number): TypedArray {
        return this._array.subarray(this._indexOffset + index * this._componentSize);
    }
}

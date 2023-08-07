import { Color, MathUtils, Vector2, Vector3, Vector4 } from 'three';
import { clamp } from 'three/src/math/MathUtils';
import { ShaderAttribute } from './helpers/shader-attribute';
import { AConstructorTypeOf, ObjectType } from './types';

/**
 * Given a value, a type, and a default value to fallback to,
 * ensure the given argument adheres to the type requesting,
 * returning the default value if type check is false.
 *
 * @param  {T} arg          The value to perform a type-check on.
 * @param  {ObjectType} type         The type the `arg` argument should adhere to.
 * @param  {typeof arg} defaultValue A default value to fallback on if the type check fails.
 * @return {typeof arg}              The given value if type check passes, or the default value if it fails.
 */
export const ensureTypedArg = <T>(arg: T | undefined, type: ObjectType, defaultValue: T): T => {
    if (typeof arg === type) {
        return arg!;
    } else {
        return defaultValue;
    }
};

/**
 * Given an array of values, a type, and a default value,
 * ensure the given array's contents ALL adhere to the provided type,
 * returning the default value if type check fails.
 *
 * If the given value to check isn't an Array, delegates to SPE.utils.ensureTypedArg.
 *
 * @param  {Array<T> | T} arg          The array of values to check type of.
 * @param  {ObjectType} type         The type that should be adhered to.
 * @param  {typeof arg} defaultValue A default fallback value.
 * @return {typeof arg}              The given value if type check passes, or the default value if it fails.
 */
export const ensureArrayTypedArg = <T>(
    arg: Array<T> | T | undefined,
    type: ObjectType,
    defaultValue: Array<T> | T,
): Array<T> | T => {
    // If the argument being checked is an array, loop through
    // it and ensure all the values are of the correct type,
    // falling back to the defaultValue if any aren't.
    if (Array.isArray(arg)) {
        for (let i = arg.length - 1; i >= 0; --i) {
            if (typeof arg[i] !== type) {
                return defaultValue;
            }
        }

        return arg;
    }

    // If the arg isn't an array then just fallback to
    // checking the type.
    return ensureTypedArg(arg, type, defaultValue);
};

/**
 * Ensures the given value is an instance of a constructor function.
 *
 * @param  {T} arg          The value to check instance of.
 * @param  {AConstructorTypeOf<T>} instance     The constructor of the instance to check against.
 * @param  {typeof arg} defaultValue A default fallback value if instance check fails
 * @return {typeof arg}              The given value if type check passes, or the default value if it fails.
 */
export const ensureInstanceOf = <Args extends unknown[], T>(
    arg: T | undefined,
    instance: AConstructorTypeOf<Args, T>,
    defaultValue: T,
): T => {
    if (instance !== undefined && arg instanceof instance) {
        return arg;
    } else {
        return defaultValue;
    }
};

/**
 * Given an array of values, ensure the instances of all items in the array
 * matches the given instance constructor falling back to a default value if
 * the check fails.
 *
 * If given value isn't an Array, delegates to `SPE.utils.ensureInstanceOf`.
 *
 * @param  {Array<T> | T} arg          The value to perform the instanceof check on.
 * @param  {AConstructorTypeOf<T>} instance     The constructor of the instance to check against.
 * @param  {typeof arg} defaultValue A default fallback value if instance check fails
 * @return {typeof arg}              The given value if type check passes, or the default value if it fails.
 */
export const ensureArrayInstanceOf = <Args extends unknown[], T>(
    arg: Array<T> | T | undefined,
    instance: AConstructorTypeOf<Args, T>,
    defaultValue: Array<T> | T,
): Array<T> | T => {
    // If the argument being checked is an array, loop through
    // it and ensure all the values are of the correct type,
    // falling back to the defaultValue if any aren't.
    if (Array.isArray(arg)) {
        for (let i = arg.length - 1; i >= 0; --i) {
            if (instance !== undefined && arg[i] instanceof instance === false) {
                return defaultValue;
            }
        }
        return arg;
    }

    // If the arg isn't an array then just fallback to
    // checking the type.
    return ensureInstanceOf(arg, instance, defaultValue);
};

/**
 * Linearly interpolates two values of various types. The given values
 * must be of the same type for the interpolation to work.
 * @param  {(number|Object)} start The start value of the lerp.
 * @param  {(number|object)} end   The end value of the lerp.
 * @param  {Number} delta The delta posiiton of the lerp operation. Ideally between 0 and 1 (inclusive).
 * @return {(number|object|undefined)}       The result of the operation. Result will be undefined if
 *                                               the start and end arguments aren't a supported type, or
 *                                               if their types do not match.
 */
export const lerpTypeAgnostic = <T = number | Vector2 | Vector3 | Vector4 | Color>(
    start: T,
    end: typeof start,
    delta: number,
): T => {
    if (typeof start === 'number' && typeof end === 'number') {
        return (start + (end - start) * delta) as T;
    }
    if (start instanceof Vector2 && end instanceof Vector2) {
        const out = start.clone();
        out.x = MathUtils.lerp(start.x, end.x, delta);
        out.y = MathUtils.lerp(start.y, end.y, delta);
        return out as T;
    }
    if (start instanceof Vector3 && end instanceof Vector3) {
        const out = start.clone();
        out.x = MathUtils.lerp(start.x, end.x, delta);
        out.y = MathUtils.lerp(start.y, end.y, delta);
        out.z = MathUtils.lerp(start.z, end.z, delta);
        return out as T;
    }
    if (start instanceof Vector4 && end instanceof Vector4) {
        const out = start.clone();
        out.x = MathUtils.lerp(start.x, end.x, delta);
        out.y = MathUtils.lerp(start.y, end.y, delta);
        out.z = MathUtils.lerp(start.z, end.z, delta);
        out.w = MathUtils.lerp(start.w, end.w, delta);
        return out as T;
    }
    if (start instanceof Color && end instanceof Color) {
        const out = start.clone();
        out.r = MathUtils.lerp(start.r, end.r, delta);
        out.g = MathUtils.lerp(start.g, end.g, delta);
        out.b = MathUtils.lerp(start.b, end.b, delta);
        return out as T;
    }
    throw Error(`Invalid argument types, or argument types do not match:', ${start}, ${end}`);
};

/**
 * Performs linear interpolation (lerp) on an array.
 *
 * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
 *
 * Delegates to `SPE.utils.lerpTypeAgnostic` to perform the actual
 * interpolation.
 *
 * @param  {Array} srcArray  The array to lerp.
 * @param  {Number} newLength The length the array should be interpolated to.
 * @return {Array}           The interpolated array.
 */
export const interpolateArray = <T = number | Vector2 | Vector3 | Vector4 | Color>(
    srcArray: Array<T>,
    newLength: number,
): typeof srcArray => {
    const sourceLength = srcArray.length,
        newArray = [
            typeof srcArray[0] === 'number'
                ? srcArray[0]
                : (srcArray[0] as Vector2 | Vector3 | Vector4 | Color).clone(),
        ] as Array<T>,
        factor = (sourceLength - 1) / (newLength - 1);

    for (let i = 1; i < newLength - 1; ++i) {
        const f = i * factor,
            before = Math.floor(f),
            after = Math.ceil(f),
            delta = f - before;

        newArray[i] = lerpTypeAgnostic(srcArray[before], srcArray[after], delta);
    }

    const last = srcArray[sourceLength - 1];
    newArray.push((typeof last === 'number' ? last : (last as Vector2 | Vector3 | Vector4 | Color).clone()) as T);

    return newArray;
};

export const ensureValueAndSpreadOverLifetimeCompliance = <
    T = number | Vector2 | Vector3 | Vector4 | Color,
    M = number | Vector3,
>(
    value: Array<T> | T,
    spread: Array<M> | M,
    minLength: number,
    maxLength: number,
): {
    value: Array<T>;
    spread: Array<M>;
} => {
    minLength = minLength || 3;
    maxLength = maxLength || 3;

    // First, ensure both properties are arrays.
    if (!Array.isArray(value)) {
        value = [value];
    }

    if (!Array.isArray(spread)) {
        spread = [spread];
    }

    const valueLength = MathUtils.clamp(value.length, minLength, maxLength);
    const spreadLength = MathUtils.clamp(spread.length, minLength, maxLength);
    const desiredLength = Math.max(valueLength, spreadLength);

    if (value.length !== desiredLength) {
        value = interpolateArray(value, desiredLength);
    }

    if (spread.length !== desiredLength) {
        spread = interpolateArray(spread, desiredLength);
    }

    return { value, spread };
};

/**
 * If the given value is less than the epsilon value, then return
 * a randomised epsilon value if specified, or just the epsilon value if not.
 * Works for negative numbers as well as positive.
 *
 * @param  {Number} value     The value to perform the operation on.
 * @param  {Boolean} randomise Whether the value should be randomised.
 * @return {Number}           The result of the operation.
 */
export const zeroToEpsilon = (value: number, randomize: boolean): number => {
    const epsilon = 0.00001;
    let result = value;

    result = randomize ? Math.random() * epsilon * 10 : epsilon;

    if (value < 0 && value > -epsilon) {
        result = -result;
    }

    return result;
};

/**
 * Rounds a number to a nearest multiple.
 *
 * @param  {Number} n        The number to round.
 * @param  {Number} multiple The multiple to round to.
 * @return {Number}          The result of the round operation.
 */
export const roundToNearestMultiple = (n: number, multiple: number): number => {
    let remainder = 0;

    if (multiple === 0) {
        return n;
    }

    remainder = Math.abs(n) % multiple;

    if (remainder === 0) {
        return n;
    }

    if (n < 0) {
        return -(Math.abs(n) - remainder);
    }

    return n + multiple - remainder;
};

/**
 * Check if all items in an array are equal. Uses strict equality.
 *
 * @param  {Array} array The array of values to check equality of.
 * @return {Boolean}       Whether the array's values are all equal or not.
 */
export const arrayValuesAreEqual = (array: unknown[]): boolean => {
    for (let i = 0; i < array.length - 1; ++i) {
        if (array[i] !== array[i + 1]) {
            return false;
        }
    }
    return true;
};

/**
 * Given a start value and a spread value, create and return a random
 * number.
 * @param  {Number} base   The start value.
 * @param  {Number} spread The size of the random variance to apply.
 * @return {Number}        A randomised number.
 */
export const randomFloat = (base: number, spread: number): number => {
    return base + spread * (Math.random() - 0.5);
};

/**
 * Given an SPE.ShaderAttribute instance, and various other settings,
 * assign values to the attribute's array in a `vec3` format.
 *
 * @param  {Object} attribute   The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base        THREE.Vector3 instance describing the start value.
 * @param  {Object} spread      THREE.Vector3 instance describing the random variance to apply to the start value.
 * @param  {Object} spreadClamp THREE.Vector3 instance describing the multiples to clamp the randomness to.
 */

export const randomVector3 = (
    attribute: ShaderAttribute,
    index: number,
    base: Vector3,
    spread: Vector3,
    spreadClamp?: Vector3,
): void => {
    let x = base.x + (Math.random() * spread.x - spread.x * 0.5),
        y = base.y + (Math.random() * spread.y - spread.y * 0.5),
        z = base.z + (Math.random() * spread.z - spread.z * 0.5);

    if (spreadClamp) {
        x = -spreadClamp.x * 0.5 + roundToNearestMultiple(x, spreadClamp.x);
        y = -spreadClamp.y * 0.5 + roundToNearestMultiple(y, spreadClamp.y);
        z = -spreadClamp.z * 0.5 + roundToNearestMultiple(z, spreadClamp.z);
    }

    attribute.typedArray!.setVec3Components(index, x, y, z);
};

/**
 * Given an SPE.Shader attribute instance, and various other settings,
 * assign Color values to the attribute.
 * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base      THREE.Color instance describing the start color.
 * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
 */
export const randomColor = (attribute: ShaderAttribute, index: number, base: Color, spread: Vector3): void => {
    let r = base.r + Math.random() * spread.x,
        g = base.g + Math.random() * spread.y,
        b = base.b + Math.random() * spread.z;

    r = MathUtils.clamp(r, 0, 1);
    g = MathUtils.clamp(g, 0, 1);
    b = MathUtils.clamp(b, 0, 1);

    attribute.typedArray!.setVec3Components(index, r, g, b);
};

export const randomColorAsHex = (() => {
    const workingColor = new Color();

    /**
     * Assigns a random color value, encoded as a hex value in decimal
     * format, to a SPE.ShaderAttribute instance.
     * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
     */
    return (attribute: ShaderAttribute, index: number, base: Color[], spread: Vector3[]) => {
        const numItems = base.length;
        const colors: number[] = [];

        for (let i = 0; i < numItems; ++i) {
            const spreadVector = spread[i];

            workingColor.copy(base[i]);

            workingColor.r += Math.random() * spreadVector.x - spreadVector.x * 0.5;
            workingColor.g += Math.random() * spreadVector.y - spreadVector.y * 0.5;
            workingColor.b += Math.random() * spreadVector.z - spreadVector.z * 0.5;

            workingColor.r = clamp(workingColor.r, 0, 1);
            workingColor.g = clamp(workingColor.g, 0, 1);
            workingColor.b = clamp(workingColor.b, 0, 1);

            colors.push(workingColor.getHex());
        }

        attribute.typedArray!.setVec4Components(index, colors[0], colors[1], colors[2], colors[3]);
    };
})();

/**
 * Given an SPE.ShaderAttribute instance, and various other settings,
 * assign values to the attribute's array in a `vec3` format.
 *
 * @param  {Object} attribute   The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} start       THREE.Vector3 instance describing the start line position.
 * @param  {Object} end         THREE.Vector3 instance describing the end line position.
 */
export const randomVector3OnLine = (attribute: ShaderAttribute, index: number, start: Vector3, end: Vector3): void => {
    const pos = start.clone();

    pos.lerp(end, Math.random());
    attribute.typedArray!.setVec3Components(index, pos.x, pos.y, pos.z);
};

/**
 * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
 * given values onto a sphere.
 *
 * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
 * @param  {Number} radius            The radius of the sphere to project onto.
 * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
 * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the sphere.
 * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
 */
export const randomVector3OnSphere = (
    attribute: ShaderAttribute,
    index: number,
    base: Vector3,
    radius: number,
    radiusSpread: number,
    radiusScale: Vector3,
    radiusSpreadClamp: number,
): void => {
    const depth = 2 * Math.random() - 1,
        t = 6.2832 * Math.random(),
        r = Math.sqrt(1 - depth * depth);

    let rand = randomFloat(radius, radiusSpread),
        x = 0,
        y = 0,
        z = 0;

    if (radiusSpreadClamp) {
        rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
    }

    // Set position on sphere
    x = r * Math.cos(t) * rand;
    y = r * Math.sin(t) * rand;
    z = depth * rand;

    // Apply radius scale to this position
    x *= radiusScale.x;
    y *= radiusScale.y;
    z *= radiusScale.z;

    // Translate to the base position.
    x += base.x;
    y += base.y;
    z += base.z;

    // Set the values in the typed array.
    attribute.typedArray!.setVec3Components(index, x, y, z);
};

/**
 * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
 * given values onto a 2d-disc.
 *
 * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
 * @param  {Number} radius            The radius of the sphere to project onto.
 * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
 * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the disc. The z-component is ignored.
 * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
 */
export const randomVector3OnDisc = (
    attribute: ShaderAttribute,
    index: number,
    base: Vector3,
    radius: number,
    radiusSpread: number,
    radiusScale: Vector3,
    radiusSpreadClamp: number,
): void => {
    const t = 6.2832 * Math.random();
    let rand = Math.abs(randomFloat(radius, radiusSpread)),
        x = 0,
        y = 0,
        z = 0;

    if (radiusSpreadClamp) {
        rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
    }

    // Set position on sphere
    x = Math.cos(t) * rand;
    y = Math.sin(t) * rand;

    // Apply radius scale to this position
    x *= radiusScale.x;
    y *= radiusScale.y;

    // Translate to the base position.
    x += base.x;
    y += base.y;
    z += base.z;

    // Set the values in the typed array.
    attribute.typedArray!.setVec3Components(index, x, y, z);
};

export const randomDirectionVector3OnSphere = (() => {
    const v = new Vector3();

    /**
     * Given an SPE.ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     *
     * @param  {Object} attribute       The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
     * @param  {Number} posX            The particle's x coordinate.
     * @param  {Number} posY            The particle's y coordinate.
     * @param  {Number} posZ            The particle's z coordinate.
     * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
     * @param  {Number} speed           The magnitude to apply to the vector.
     * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
     */
    return (
        attribute: ShaderAttribute,
        index: number,
        posX: number,
        posY: number,
        posZ: number,
        emitterPosition: Vector3,
        speed: number,
        speedSpread: number,
    ) => {
        v.copy(emitterPosition);

        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;

        v.normalize().multiplyScalar(-randomFloat(speed, speedSpread));

        attribute.typedArray!.setVec3Components(index, v.x, v.y, v.z);
    };
})();

export const randomDirectionVector3OnDisc = (() => {
    const v = new Vector3();

    /**
     * Given an SPE.ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     *
     * @param  {Object} attribute       The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
     * @param  {Number} posX            The particle's x coordinate.
     * @param  {Number} posY            The particle's y coordinate.
     * @param  {Number} posZ            The particle's z coordinate.
     * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
     * @param  {Number} speed           The magnitude to apply to the vector.
     * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
     */
    return (
        attribute: ShaderAttribute,
        index: number,
        posX: number,
        posY: number,
        posZ: number,
        emitterPosition: Vector3,
        speed: number,
        speedSpread: number,
    ) => {
        v.copy(emitterPosition);

        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;

        v.normalize().multiplyScalar(-randomFloat(speed, speedSpread));
        attribute.typedArray!.setVec3Components(index, v.x, v.y, 0);
    };
})();

export const getPackedRotationAxis = (() => {
    const v = new Vector3(),
        vSpread = new Vector3(),
        c = new Color(),
        addOne = new Vector3(1, 1, 1);

    /**
     * Given a rotation axis, and a rotation axis spread vector,
     * calculate a randomised rotation axis, and pack it into
     * a hexadecimal value represented in decimal form.
     * @param  {Object} axis       THREE.Vector3 instance describing the rotation axis.
     * @param  {Object} axisSpread THREE.Vector3 instance describing the amount of randomness to apply to the rotation axis.
     * @return {Number}            The packed rotation axis, with randomness.
     */
    return (axis: Vector3, axisSpread: Vector3): number => {
        v.copy(axis).normalize();
        vSpread.copy(axisSpread).normalize();

        v.x += -axisSpread.x * 0.5 + Math.random() * axisSpread.x;
        v.y += -axisSpread.y * 0.5 + Math.random() * axisSpread.y;
        v.z += -axisSpread.z * 0.5 + Math.random() * axisSpread.z;

        v.normalize().add(addOne).multiplyScalar(0.5);

        c.setRGB(v.x, v.y, v.z);

        return c.getHex();
    };
})();

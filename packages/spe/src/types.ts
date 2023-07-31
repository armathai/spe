import { Vector3 } from 'three';

export type TypedArray = ArrayLike<unknown> & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    BYTES_PER_ELEMENT: number;
    set(array: ArrayLike<number>, offset?: number): void;
    slice(start?: number, end?: number): TypedArray;
};

export type TypedArrayConstructor<T> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    BYTES_PER_ELEMENT: number;
    new (): T;
    new (size: number): T;
    new (buffer: ArrayBuffer): T;
};

export enum Distribution {
    box = 1,
    sphere = 2,
    disc = 3,
    line = 4,
}

export type ObjectType = 'boolean' | 'string' | 'number' | 'object';

export type AConstructorTypeOf<T> = new (...args: unknown[]) => T;

export type EmitterOptions = {
    position: unknown;
    velocity: unknown;
    acceleration: unknown;
    radius: unknown;
    drag: unknown;
    rotation: unknown;
    color: unknown;
    opacity: unknown;
    size: unknown;
    angle: unknown;
    wiggle: unknown;
    maxAge: unknown;
};

export type EmitterPosition = {
    value: Vector3;
    spread: Vector3;
    spreadClamp: Vector3;
    distribution: Distribution;
    randomise: boolean;
    radius: number;
    radiusScale: Vector3;
    distributionClamp: number;
};

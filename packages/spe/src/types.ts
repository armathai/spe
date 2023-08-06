import { Blending, Color, Texture, Vector2, Vector3 } from 'three';
import { ShaderAttribute } from './helpers/shader-attribute';

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

export type AConstructorTypeOf<Args extends unknown[], T> = new (...args: Args) => T;

// ...................
//
// Emitter
//
// ...................

export type EmitterOptions = {
    type?: Distribution;
    particleCount?: number;
    duration?: number | null;
    isStatic?: boolean;
    activeMultiplier?: number;
    direction?: number;
    alive?: boolean;
    maxAge?: {
        value?: number;
        spread?: number;
    };
    position?: {
        value?: Vector3;
        spread?: Vector3;
        spreadClamp?: Vector3;
        radius?: number;
        radiusScale?: Vector3;
        distribution?: Distribution;
        distributionClamp?: number;
        randomize?: boolean;
    };
    velocity?: {
        value?: Vector3;
        spread?: Vector3;
        distribution?: Distribution;
        randomize?: boolean;
    };
    acceleration?: {
        value?: Vector3;
        spread?: Vector3;
        distribution?: Distribution;
        randomize?: boolean;
    };
    drag?: {
        value?: number;
        spread?: number;
        randomize?: boolean;
    };
    radius?: {
        value?: number;
        spread?: number;
        spreadClamp?: Vector3;
        scale?: Vector3;
        randomize?: boolean;
    };
    wiggle?: {
        value?: number;
        spread?: number;
    };
    rotation?: {
        axis?: Vector3;
        axisSpread?: Vector3;
        angle?: number;
        angleSpread?: number;
        static?: boolean;
        center?: Vector3;
        randomize?: boolean;
    };
    color?: {
        value?: Color | Color[];
        spread?: Vector3 | Vector3[];
        randomize?: boolean;
    };
    opacity?: {
        value?: number | number[];
        spread?: number | number[];
        randomize?: boolean;
    };
    size?: {
        value?: number | number[];
        spread?: number | number[];
        randomize?: boolean;
    };
    angle?: {
        value?: number;
        spread?: number;
        randomize?: boolean;
    };
};

export enum EmitterProperty {
    params = 'params',
    position = 'position',
    velocity = 'velocity',
    acceleration = 'acceleration',
    drag = 'drag',
    wiggle = 'wiggle',
    rotation = 'rotation',
    rotationCenter = 'rotationCenter', // ToDo: Check this property, emitter doesn't have it
    maxAge = 'maxAge',
    color = 'color',
    opacity = 'opacity',
    size = 'size',
    angle = 'angle',
}

// ...................
//
// Group
//
// ...................

export type GroupOptions = {
    texture?: {
        value?: Texture;
        frames?: Vector2;
        frameCount?: number;
        loop?: number;
    };
    fixedTimeStep?: number;
    hasPerspective?: boolean;
    colorize?: boolean;
    blending?: Blending; // AdditiveBlending
    transparent?: boolean;
    alphaTest?: number; // Value between 0 and 1
    depthWrite?: boolean;
    depthTest?: boolean;
    fog?: boolean;
    scale?: number;
    maxParticleCount?: number;
};

export type GroupAttributesMap = {
    position: ShaderAttribute; // new SPE.ShaderAttribute( 'v3', true),
    acceleration: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true), // w component is drag
    velocity: ShaderAttribute; // new SPE.ShaderAttribute( 'v3', true),
    rotation: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true),
    rotationCenter: ShaderAttribute; // new SPE.ShaderAttribute( 'v3', true),
    params: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true), // Holds (alive, age, delay, wiggle)
    size: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true),
    angle: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true),
    color: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true),
    opacity: ShaderAttribute; // new SPE.ShaderAttribute( 'v4', true)
};

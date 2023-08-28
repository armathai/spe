import { Vector3 } from 'three';
import { EmitterProperty } from '../../types';
import { ensureInstanceOf, ensureTypedArg } from '../../utils';
import { ParticleEmitter } from '../emitter';

export class EmitterRotation {
    private _propName: EmitterProperty = EmitterProperty.rotation;
    private _axis: Vector3;
    private _axisSpread: Vector3;
    private _angle: number;
    private _angleSpread: number;
    private _static: boolean;
    private _center: Vector3;
    private _randomize: boolean;

    public constructor(
        axis: Vector3 | undefined,
        axisSpread: Vector3 | undefined,
        angle: number | undefined,
        angleSpread: number | undefined,
        isStatic: boolean | undefined,
        center: Vector3 | undefined,
        randomize: boolean | undefined,
        private _emitter: ParticleEmitter,
    ) {
        this._axis = ensureInstanceOf(axis, Vector3, new Vector3(0, 1, 0));
        this._axisSpread = ensureInstanceOf(axisSpread, Vector3, new Vector3());
        this._angle = ensureTypedArg(angle, 'number', 0);
        this._angleSpread = ensureTypedArg(angleSpread, 'number', 0);
        this._static = ensureTypedArg(isStatic, 'boolean', false);
        this._center = ensureInstanceOf(center, Vector3, this._emitter.position.value.clone());
        this._randomize = ensureTypedArg(randomize, 'boolean', false);
    }

    public get axis(): Vector3 {
        return this._axis;
    }

    public set axis(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._axis = value;
    }

    public get axisSpread(): Vector3 {
        return this._axisSpread;
    }

    public set axisSpread(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._axisSpread = value;
    }

    public get angle(): number {
        return this._angle;
    }

    public set angle(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._angle = value;
    }

    public get angleSpread(): number {
        return this._angleSpread;
    }

    public set angleSpread(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._angleSpread = value;
    }

    public get static(): boolean {
        return this._static;
    }

    public set static(value: boolean) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._static = value;
    }

    public get center(): Vector3 {
        return this._center;
    }

    public set center(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._center = value;
    }

    public get randomize(): boolean {
        return this._randomize;
    }

    public set randomize(value: boolean) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.resetFlags[mapName] = value;

        this._emitter.system!.updateDefines();

        this._randomize = value;
    }
}

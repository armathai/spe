import { Vector3 } from 'three';
import { Distribution, EmitterProperty } from '../../types';
import { ensureInstanceOf, ensureTypedArg } from '../../utils';
import { Emitter } from '../emitter';

export class EmitterPosition {
    private _propName: EmitterProperty = EmitterProperty.position;
    private _value: Vector3;
    private _spread: Vector3;
    private _spreadClamp: Vector3;
    private _radius: number;
    private _radiusScale: Vector3;
    private _distribution: Distribution;
    private _distributionClamp: number;
    private _randomize: boolean;

    public constructor(
        value: Vector3 | undefined,
        spread: Vector3 | undefined,
        spreadClamp: Vector3 | undefined,
        distribution: Distribution | undefined,
        randomize: boolean | undefined,
        radius: number | undefined,
        radiusScale: Vector3 | undefined,
        distributionClamp: number | undefined,
        private _emitter: Emitter,
    ) {
        this._value = ensureInstanceOf(value, Vector3, new Vector3());
        this._spread = ensureInstanceOf(spread, Vector3, new Vector3());
        this._spreadClamp = ensureInstanceOf(spreadClamp, Vector3, new Vector3());
        this._distribution = ensureTypedArg(distribution, 'number', this._emitter.type);
        this._randomize = ensureTypedArg(randomize, 'boolean', false);
        this._radius = ensureTypedArg(radius, 'number', 10);
        this._radiusScale = ensureInstanceOf(radiusScale, Vector3, new Vector3(1, 1, 1));
        this._distributionClamp = ensureTypedArg(distributionClamp, 'number', 0);
    }

    public get value(): Vector3 {
        return this._value;
    }

    public set value(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._value = value;
    }

    public get spread(): Vector3 {
        return this._spread;
    }

    public set spread(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._spread = value;
    }

    public get spreadClamp(): Vector3 {
        return this._spreadClamp;
    }

    public set spreadClamp(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._spreadClamp = value;
    }

    public get randomize(): boolean {
        return this._randomize;
    }

    public set randomize(value: boolean) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.resetFlags[mapName] = value;

        this._emitter.group!.updateDefines();

        this._randomize = value;
    }

    public get radius(): number {
        return this._radius;
    }

    public set radius(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._radius = value;
    }

    public get radiusScale(): Vector3 {
        return this._radiusScale;
    }

    public set radiusScale(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._radiusScale = value;
    }

    public get distribution(): Distribution {
        return this._distribution;
    }

    public set distribution(value: Distribution) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._distribution = value;
    }

    public get distributionClamp(): number {
        return this._distributionClamp;
    }

    public set distributionClamp(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._distributionClamp = value;
    }
}

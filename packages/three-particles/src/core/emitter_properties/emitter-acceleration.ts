import { Vector3 } from 'three';
import { Distribution, EmitterProperty } from '../../types';
import { ensureInstanceOf, ensureTypedArg } from '../../utils';
import { ParticleEmitter } from '../emitter';

export class EmitterAcceleration {
    private _propName: EmitterProperty = EmitterProperty.acceleration;
    private _value: Vector3;
    private _spread: Vector3;
    private _distribution: Distribution;
    private _randomize: boolean;

    public constructor(
        value: Vector3 | undefined,
        spread: Vector3 | undefined,
        distribution: Distribution | undefined,
        randomize: boolean | undefined,
        private _emitter: ParticleEmitter,
    ) {
        this._value = ensureInstanceOf(value, Vector3, new Vector3());
        this._spread = ensureInstanceOf(spread, Vector3, new Vector3());
        this._distribution = ensureTypedArg(distribution, 'number', this._emitter.type);
        this._randomize = ensureTypedArg(randomize, 'boolean', false);
    }

    public get value(): Vector3 {
        return this._value;
    }

    public set value(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._value = value;
    }

    public get spread(): Vector3 {
        return this._spread;
    }

    public set spread(value: Vector3) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._spread = value;
    }

    public get distribution(): Distribution {
        return this._distribution;
    }

    public set distribution(value: Distribution) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._distribution = value;
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

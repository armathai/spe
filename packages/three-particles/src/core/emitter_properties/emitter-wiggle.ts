import { EmitterProperty } from '../../types';
import { ensureTypedArg } from '../../utils';
import { ParticleEmitter } from '../emitter';

export class EmitterWiggle {
    private _propName: EmitterProperty = EmitterProperty.wiggle;
    private _value: number;
    private _spread: number;

    public constructor(
        value: number | undefined,
        spread: number | undefined,
        private _emitter: ParticleEmitter,
    ) {
        this._value = ensureTypedArg(value, 'number', 0);
        this._spread = ensureTypedArg(spread, 'number', 0);
    }

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._value = value;
    }

    public get spread(): number {
        return this._spread;
    }

    public set spread(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.system!.updateDefines();

        this._spread = value;
    }
}

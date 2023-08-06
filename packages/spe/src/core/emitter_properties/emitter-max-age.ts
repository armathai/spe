import { EmitterProperty } from '../../types';
import { ensureTypedArg } from '../../utils';
import { Emitter } from '../emitter';

export class EmitterMaxAge {
    private _propName: EmitterProperty = EmitterProperty.maxAge;
    private _value: number;
    private _spread: number;

    public constructor(
        value: number | undefined,
        spread: number | undefined,
        private _emitter: Emitter,
    ) {
        this._value = ensureTypedArg(value, 'number', 2);
        this._spread = ensureTypedArg(spread, 'number', 0);
    }

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._value = value;
    }

    public get spread(): number {
        return this._spread;
    }

    public set spread(value: number) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        this._spread = value;
    }
}

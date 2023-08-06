import { EmitterProperty } from '../../types';
import { ensureTypedArg } from '../../utils';
import { Emitter } from '../emitter';

export class EmitterDrag {
    private _propName: EmitterProperty = EmitterProperty.drag;
    private _value: number;
    private _spread: number;
    private _randomize: boolean;

    public constructor(
        value: number | undefined,
        spread: number | undefined,
        randomize: boolean | undefined,
        private _emitter: Emitter,
    ) {
        this._value = ensureTypedArg(value, 'number', 0);
        this._spread = ensureTypedArg(spread, 'number', 0);
        this._randomize = ensureTypedArg(randomize, 'boolean', false);
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

    public get randomize(): boolean {
        return this._randomize;
    }

    public set randomize(value: boolean) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.resetFlags[mapName] = value;

        this._emitter.group!.updateDefines();

        this._randomize = value;
    }
}

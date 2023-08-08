import { valueOverLifetimeLength } from '../../constants';
import { EmitterProperty } from '../../types';
import { ensureArrayTypedArg, ensureTypedArg, ensureValueAndSpreadOverLifetimeCompliance } from '../../utils';
import { Emitter } from '../emitter';

export class EmitterSize {
    private _propName: EmitterProperty = EmitterProperty.size;
    private _value: number[];
    private _spread: number[];
    private _randomize: boolean;

    public constructor(
        value: number | number[] | undefined,
        spread: number | number[] | undefined,
        randomize: boolean | undefined,
        private _emitter: Emitter,
    ) {
        const { value: valuesArray, spread: spreadsArray } = ensureValueAndSpreadOverLifetimeCompliance(
            ensureArrayTypedArg(value, 'number', 1),
            ensureArrayTypedArg(spread, 'number', 0),
            valueOverLifetimeLength,
            valueOverLifetimeLength,
        );
        this._value = valuesArray;
        this._spread = spreadsArray;
        this._randomize = ensureTypedArg(randomize, 'boolean', false);
    }

    public get value(): number[] {
        return this._value;
    }

    public set value(value: number | number[]) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        const { value: valuesArray } = ensureValueAndSpreadOverLifetimeCompliance(
            ensureArrayTypedArg(value, 'number', 1),
            this._spread,
            valueOverLifetimeLength,
            valueOverLifetimeLength,
        );

        this._value = valuesArray;
    }

    public get spread(): number[] {
        return this._spread;
    }

    public set spread(value: number | number[]) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        const { spread: spreadsArray } = ensureValueAndSpreadOverLifetimeCompliance(
            this._value,
            ensureArrayTypedArg(value, 'number', 0),
            valueOverLifetimeLength,
            valueOverLifetimeLength,
        );

        this._spread = spreadsArray;
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

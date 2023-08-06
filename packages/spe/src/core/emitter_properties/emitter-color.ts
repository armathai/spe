import { Color, Vector3 } from 'three';
import { valueOverLifetimeLength } from '../../constants';
import { EmitterProperty } from '../../types';
import { ensureTypedArg, ensureValueAndSpreadOverLifetimeCompliance } from '../../utils';
import { Emitter } from '../emitter';

export class EmitterColor {
    private _propName: EmitterProperty = EmitterProperty.color;
    private _value: Color[];
    private _spread: Vector3[];
    private _randomize: boolean;

    public constructor(
        value: Color | Color[] | undefined,
        spread: Vector3 | Vector3[] | undefined,
        randomize: boolean | undefined,
        private _emitter: Emitter,
    ) {
        const { value: valuesArray, spread: spreadsArray } = ensureValueAndSpreadOverLifetimeCompliance(
            ensureTypedArg(value, 'object', new Color()),
            ensureTypedArg(spread, 'object', new Vector3()),
            valueOverLifetimeLength,
            valueOverLifetimeLength,
        );
        this._value = valuesArray;
        this._spread = spreadsArray;
        this._randomize = ensureTypedArg(randomize, 'boolean', false);
    }

    public get value(): Color[] {
        return this._value;
    }

    public set value(value: Color | Color[]) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        const { value: valuesArray } = ensureValueAndSpreadOverLifetimeCompliance(
            ensureTypedArg(value, 'object', new Color()),
            this._spread,
            valueOverLifetimeLength,
            valueOverLifetimeLength,
        );

        this._value = valuesArray;
    }

    public get spread(): Vector3[] {
        return this._spread;
    }

    public set spread(value: Vector3 | Vector3[]) {
        const mapName = this._emitter.updateMap[this._propName]!;

        this._emitter.updateFlags[mapName] = true;
        this._emitter.updateCounts[mapName] = 0.0;

        this._emitter.group!.updateDefines();

        const { spread: spreadsArray } = ensureValueAndSpreadOverLifetimeCompliance(
            this._value,
            ensureTypedArg(value, 'object', new Vector3()),
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

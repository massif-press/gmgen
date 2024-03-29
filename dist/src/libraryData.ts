import { cLog } from './util';
import _ from 'lodash';
import { ValueItem } from './generator';

class LibraryData {
  key: string;
  definitions: object;
  values: object;
  templates: string[];

  constructor(
    key: string,
    definitions?: object,
    values?: object,
    templates?: string[]
  ) {
    this.key = key;
    this.definitions = definitions || {};
    this.values = values || {};
    this.templates = templates || [];
  }

  public static Convert(json: string | object): LibraryData {
    let c;
    try {
      c = typeof json === 'string' ? JSON.parse(json) : json;
    } catch (error) {
      cLog(1, `Error converting object to LibraryData: item is not valid JSON`);
      throw new Error(`${json}`);
    }
    if (!c.key) {
      cLog(
        1,
        `Error converting object to LibraryData: item lacks key property`
      );
      throw new Error(`object has no key field: ${c}`);
    }
    return new LibraryData(
      c.key,
      c.definitions,
      this.prepValueObject(c.values),
      c.templates
    );
  }

  private static prepValueObject(obj: any) {
    const out: any = {};
    for (const k in obj) {
      out[k] = LibraryData.PrepValues(obj[k]);
    }
    return out;
  }

  public Define(key: string, value: string) {
    if (!this.definitions[key]) this.definitions[key] = value;
  }

  public ClearDefinition(key: string) {
    this.checkKey(key, 'definitions');
    delete this.definitions[key];
  }

  public AddTemplate(...values: string[]) {
    this.templates = [...this.templates, ...values];
  }

  public SetTemplate(index: number, value: string) {
    this.checkIndex(index, 'templates');
    this.templates[index] = value;
  }

  public RemoveTemplate(index: number) {
    this.checkIndex(index, 'templates');
    this.templates.splice(index, 1);
  }

  public ClearTemplates() {
    this.templates.splice(0, this.templates.length);
  }

  public GetValue(key: string): ValueItem[] {
    this.checkKey(key, 'values');
    return this.values[key];
  }

  public AddValue(
    key: string,
    value: string | string[],
    weight?: number | number[]
  ) {
    if (this.values[key])
      this.values[key] = [
        ...this.values[key],
        ...LibraryData.PrepValues(value, weight),
      ];
    else this.SetValue(key, value, weight);
  }

  public SetValue(
    key: string,
    value: string | string[],
    weight?: number | number[]
  ) {
    this.values[key] = LibraryData.PrepValues(value, weight);
  }

  public DeleteValue(key: string) {
    this.checkKey(key, 'values');
    delete this.values[key];
  }

  public ClearValue(key: string) {
    this.checkKey(key, 'values');
    this.values[key] = [{ value: '', weight: 1 }];
  }

  public ClearValueWeights(key: string) {
    this.checkKey(key, 'values');
    this.values[key].forEach((v: any) => {
      v.weight = 1;
    });
  }

  public AddValueItem(key: string, value: string, weight = 1) {
    this.values[key].push({
      value,
      weight,
    });
  }

  public SetValueItem(key: string, index: number, value: string, weight = 1) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key][index] = {
      value,
      weight,
    };
  }

  public SetValueItemWeight(key: string, index: number, weight: number) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key][index].weight = weight;
  }

  public DeleteValueItem(key: string, index: number) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key].splice(index, 1);
  }

  public ClearValueItem(key: string, index: number) {
    this.checkKey(key, 'values');
    this.checkIndex(index, `values.${key}`);
    this.values[key][index].value = '';
    this.values[key][index].weight = 1;
  }

  public static PrepValues(
    values: any,
    weights?: number | number[]
  ): ValueItem[] {
    let v, w: number[];

    if (!values) return [];
    if (Array.isArray(values) && !values[0]) return [];

    if (typeof values === 'string')
      values = values.replace(/[{}]/g, '').split('|');

    if (typeof values[0] === 'string') {
      v = values;
      w = [];

      [v, w] = this.SplitValueWeights(v);

      if (weights) {
        const wArr = Array.isArray(weights) ? weights : [weights];

        for (let i = 0; i < wArr.length; i++) {
          w[i] = wArr[i];
        }
      }
    } else if (Array.isArray(values[0])) {
      v = values.map((x: any) => x[0]);
      w = values.map((x: any) => x[1] || 1);
    } else if (values[0].value !== undefined) {
      v = values.map((x: any) => x.value);
      w = values.map((x: any) => x.weight || 1);
    } else {
      cLog(1, 'Inappropriate or malformed value item detected');
      throw new Error(values);
    }

    return v.map((x: any, i: number) => ({
      value: x,
      weight: w[i],
    }));
  }

  public static SplitValueWeights(arr: string[]): [string[], number[]] {
    let values: string[] = [];
    let weights: number[] = [];
    arr.forEach((str) => {
      // capture :number, ignore escape
      const match = str.match(/(?<!\\)(?:\:)\d+/);
      if (match && match[0]) {
        weights.push(Number(match[0].replace(':', '')));
        values.push(str.replace(match[0], ''));
      } else {
        weights.push(1);
        values.push(str);
      }
    });

    return [values, weights];
  }

  public checkIndex(index: number, arrKey: string) {
    if (!Number.isInteger(index)) {
      cLog(1, `Error setting ${arrKey}: inappropriate index value`);
      throw new Error(`${index} cannot be used as index`);
    }
    if (index > _.property(`this.${arrKey}`).length || index < 0) {
      cLog(1, `Error setting ${arrKey}: index exceeds array bounds`);
      throw new Error(
        `Index ${index} exceeds array bounds of 0-${
          _.property(`this.${arrKey}`).length
        }`
      );
    }
  }

  private checkKey(key: string, objKey: string) {
    if (!_.has(this, `${objKey}.${key}`)) {
      cLog(
        1,
        `Error clearing ${objKey}: LibraryData contains no ${objKey} for ${key}`,
        `📙`
      );
      throw new Error(`LibraryData is undefined at ${objKey}.${key}`);
    }
  }
}

export default LibraryData;

import LibraryData from './libraryData';
import { cLog } from './util';

class GeneratorLibrary {
  private _content: LibraryData[];

  constructor(libraryData?: any) {
    this._content = [];

    if (libraryData) {
      if (Array.isArray(libraryData)) {
        libraryData.map((x) => {
          this.addData(x);
        });
      } else if (libraryData.key) {
        this.addData(libraryData);
      } else if (libraryData[Object.keys(libraryData)[0]].key) {
        for (const key in libraryData) {
          this.addData(libraryData[key]);
        }
      }
    }
  }

  public get Content(): any {
    return this._content;
  }

  private hasLibrary(key: string | LibraryData): boolean {
    const k = this.getKeyStr(key);
    if (k) return this.contentIndex(k) > -1;
    cLog(1, 'Bad parameter passed to Library.HasLibrary', '📙');
    throw new Error(`${key} is not string or LibraryData`);
  }

  private addData(data: any) {
    if (!data.key) {
      cLog(1, 'Item passed to Library has no key', '📙');
      throw new Error(`${data} does not include key field`);
    }
    if (this.hasLibrary(data)) this.mergeData(data as LibraryData);
    else this.setData(data);
  }

  private setData(data: LibraryData) {
    this._content.push(LibraryData.Convert(data));
  }

  private contentIndex(k: string) {
    return this._content.findIndex((x) => x.key === k);
  }

  private mergeData(newData: LibraryData) {
    const oldData = this._content[this.contentIndex(newData.key)];
    const merged = new LibraryData(
      newData.key,
      { ...newData.definitions, ...oldData.definitions },
      oldData.values,
      [...oldData.templates, ...newData.templates]
    );
    for (const k in newData.values) {
      merged.AddValue(k, newData.values[k]);
    }
    this._content[this.contentIndex(newData.key)] = merged;
  }

  private getKeyStr(key: string | LibraryData) {
    return typeof key === 'string' ? key : key.key;
  }
}

export default GeneratorLibrary;

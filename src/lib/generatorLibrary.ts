import { LibraryData } from './libraryData';
import { cLog } from './util';

class GeneratorLibrary {
  private _content: LibraryData[];

  constructor(...libraryData: any[]) {
    this._content = [];
    if (libraryData) {
      libraryData.map((x) => {
        this.AddData(x);
      });
    }
  }

  public get Content(): any {
    return this._content;
  }

  public HasLibrary(key: string | LibraryData): boolean {
    const k = this.getKeyStr(key);
    if (k) return this.contentIndex(k) > -1;
    cLog('📙', 'Bad parameter passed to Library.HasLibrary', 'error');
    throw new Error(`${key} is not string or LibraryData`);
  }

  public GetLibrary(key: string | LibraryData): LibraryData {
    const k = this.getKeyStr(key);
    this.checkExists(k);
    return this._content[this.contentIndex(k)] as LibraryData;
  }

  public AddData(data: any) {
    if (!data.key) {
      cLog('📙', 'Item passed to Library has no key', 'error');
      throw new Error(`${data} does not include key field`);
    }
    if (this.HasLibrary(data)) this.mergeData(data as LibraryData);
    else this.SetData(data);
  }

  public SetData(data: LibraryData) {
    this._content.push(LibraryData.Convert(data));
  }

  public DeleteData(key: string | LibraryData) {
    const k = this.getKeyStr(key);
    this.checkExists(k);
    this._content.splice(this.contentIndex(k), 1);
  }

  private contentIndex(k: string) {
    return this._content.findIndex((x) => x.key === k);
  }

  private mergeData(data: LibraryData) {
    this._content[this.contentIndex(data.key)] = {
      ...this._content[data.key],
      ...LibraryData.Convert(data),
    };
  }

  private getKeyStr(key: string | LibraryData) {
    return typeof key === 'string' ? key : key.key;
  }

  private checkExists(key: string) {
    if (!this.HasLibrary(key)) {
      cLog(
        `📙','Error deleting LibraryData: LibraryData of key ${key} not found in library`,
        'error'
      );
      throw new Error(`${key} not found`);
    }
  }
}

export { GeneratorLibrary };

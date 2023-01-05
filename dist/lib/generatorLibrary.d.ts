import LibraryData from './libraryData';
declare class GeneratorLibrary {
    private _content;
    constructor(libraryData?: any);
    get Content(): any;
    HasLibrary(key: string | LibraryData): boolean;
    GetLibrary(key: string | LibraryData): LibraryData;
    AddData(data: any): void;
    SetData(data: LibraryData): void;
    DeleteData(key: string | LibraryData): void;
    private contentIndex;
    private mergeData;
    private getKeyStr;
    private checkExists;
}
export default GeneratorLibrary;

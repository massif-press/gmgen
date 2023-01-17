declare class GeneratorLibrary {
    private _content;
    constructor(libraryData?: any);
    get Content(): any;
    private hasLibrary;
    private addData;
    private setData;
    private contentIndex;
    private mergeData;
    private getKeyStr;
}
export default GeneratorLibrary;

import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { URL } from 'url';

export const DEFAULT_ENCODING: BufferEncoding = 'utf-8';
export const yamlExt = [ '.yml', '.yaml' ];
export const jsonExt = '.json';
export const DOT = '.';

const RECURSING: unique symbol = Symbol.for('RECURSING');

export function hasExtension ({ filename, extension, recursing }: { filename: string | fs.Dirent; extension: string | string[]; recursing?: typeof RECURSING; }): boolean {
    if (filename instanceof fs.Dirent) {
        return hasExtension({ filename: filename.name, extension });
    } else if (Array.isArray(extension)) {
        return extension.some((_extension) => hasExtension({ filename, extension: _extension, recursing: RECURSING }));
    } else if (extension === '' || extension === DOT) {
        if (recursing === RECURSING) {
            return false;
        } else {
            throw new TypeError('Please provide an extension');
        }
    } else {
        if (!extension.startsWith(DOT)) {
            extension = `${DOT}${extension}`;
        }
        return path.extname(filename) === extension;
    }
}

export function isYAMLFile ( file: fs.Dirent ): boolean {
    return file.isFile()
        && hasExtension({ filename: file, extension: yamlExt });
}

export interface IRegExpReplacer {
    (matched: string, ...args: any[]): string
}

export interface IRegExpReplacerHandledParameters {
    groups: RegExpExecArray['groups']
    wholeString: string
    offset: number
    matches: Array<string | undefined>
    wholeMatch: string | undefined
}

export interface IRegExpReplacerParameterHandler {
    (parameters: IRegExpReplacerHandledParameters): ReturnType<IRegExpReplacer>
}

function regexpReplacerParameterHandler (...parameters: Parameters<IRegExpReplacer>): IRegExpReplacerHandledParameters {
    const groups: RegExpExecArray['groups'] = parameters.pop();
    const wholeString: string = parameters.pop();
    const offset: number = parameters.pop();
    const matches: Array<string | undefined> = [...parameters];
    const wholeMatch = matches[0];
    return {groups, wholeString, offset, matches, wholeMatch};
}

function getRegExpReplacer (handler: IRegExpReplacerParameterHandler): IRegExpReplacer {
    return (...parameters: Parameters<IRegExpReplacer>): ReturnType<IRegExpReplacer> => {
        return handler(regexpReplacerParameterHandler(...parameters));
    }
}

export function identityFunction (value: any): any {
    return value;
}

export function trueFunction (..._args: any[]): true {
    return true;
}

export function getSecondParam (_arg0: any, arg1: any, ..._args: any[]): typeof arg1 {
    return arg1;
}

export function falseFunction (...args: any[]): false {
    return false;
}

export interface StringTransformer {
    (regexp: RegExp, str: string): string
    (regexp: RegExp, str: string[]): string[]
}

export function getStringTransformer (handler: IRegExpReplacerParameterHandler): StringTransformer {
    const replacer = getRegExpReplacer(handler);
    const stringTransformer: StringTransformer = ( regexp, str ) => {
        if ( Array.isArray( str ) ) {
            return str.map( ( _str ): string => stringTransformer( regexp, _str ) );
        } else {
            return str.replace( regexp, replacer );
        }
    }
    return stringTransformer;
}

interface IStringifyReplacer {
    (this: any, key: string, value: any): typeof value
}

export function getStringifyReplacer (transformer: StringTransformer, regexp: RegExp): IStringifyReplacer {
    const stringifyReplacer: IStringifyReplacer = (key, value) => {
        if (typeof value === 'string') {
            return transformer(regexp, value)
        } else {
            return value;
        }
    }
    return stringifyReplacer;
}

export interface FileFilter {
    (file: fs.Dirent): boolean
}

export interface FileParser {
    (
        fileContents: string | number | Buffer | URL,
        filename: string
    ): any | Promise<any>
}

export const yamlSafeLoader: FileParser = (fileContents: string, filename: string): string | object | undefined => yaml.safeLoad( fileContents, { filename } );

export function getJSONOutputWriter (replacer: IStringifyReplacer): ObjectHandler {
    const jsonOutputWriter: ObjectHandler = (obj: any, outputPath: string): Promise<void> => fs.outputJSON(outputPath, obj, {
        spaces: 2,
        replacer: replacer
    });
    return jsonOutputWriter
}

export interface FileProcessingOptions {
    encoding: BufferEncoding
    inputFileFilter: FileFilter
    suppressErrors: boolean
    quitOnError: boolean
}

interface FilenameTransformer {
    (name: string, oldExt: string, newExt: string): string
    (name: string, oldExt: string[], newExt: string): string
}

export function defaultFilenameTransformer (name: string, oldExt: string | string[], newExt: string): string {
    if (Array.isArray(oldExt)) {
        const actualOldExt = oldExt.find((ext) => name.endsWith(ext));
        if (actualOldExt === undefined) {
            throw new Error(`Filename ${name} does not end with any extension given in array ${oldExt.toString()}`);
        } else {
            return defaultFilenameTransformer(name, actualOldExt, newExt);
        }
    } else {
        return name.replace(new RegExp(`${escapeRegExp(oldExt)}`), newExt);
    }
}

interface ShorthandFilenameTransformer {
    (name: string): string
}

export function getFilenameTransformer (oldExt: string | string[], newExt: string): ShorthandFilenameTransformer {
    const filenameTransformer: ShorthandFilenameTransformer = (name: string) => defaultFilenameTransformer(name, oldExt, newExt);
    return filenameTransformer;
}

interface ObjectHandler {
    (obj: any, path: string): any | Promise<any>
}

export function escapeRegExp (string: string): string {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

export function processFiles (
    inputDirectory: string | string[],
    inputFileParser: FileParser,
    outputObjectHandler: ObjectHandler = identityFunction,
    outputDirectory: string | undefined = '',
    outputFilenameTransformer: ShorthandFilenameTransformer,
{
    inputFileFilter = trueFunction,
    encoding = DEFAULT_ENCODING,
    suppressErrors = false,
    quitOnError = true,
}: Partial<FileProcessingOptions>): void {
    if (Array.isArray(inputDirectory)) {
        return inputDirectory.forEach((directory): void => processFiles(directory, inputFileParser, outputObjectHandler, outputDirectory, outputFilenameTransformer, {
            inputFileFilter, encoding, suppressErrors, quitOnError
        }));
    } else {
        try {
            const inputFiles = 
                fs.readdirSync(inputDirectory, { encoding, withFileTypes: true })
                    .filter((file) => inputFileFilter(file));

            inputFiles.forEach(
                async (inputFile): Promise<void> => {
                    const {
                        name
                    } = inputFile;
                    const filepath = path.join(inputDirectory, name);
                    try {
                        const obj = inputFileParser(await fs.readFile(filepath, { encoding }), name);
                        const outpath = path.join(outputDirectory, outputFilenameTransformer(name))
                        return outputObjectHandler(obj, outpath);
                    } catch (error) { 
                        const message = `Could not read file ${name}`;
                        if (quitOnError) {
                            throw new Error(message);
                        } else if (!suppressErrors) {
                            console.error(message, error);
                        }
                    }
                }
            );
        } catch (error) {
            if (!suppressErrors) {
                console.error('Could not complete task.', error);
            }
        }
    }
}


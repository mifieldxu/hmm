import {
    isYAMLFile,
    getStringTransformer,
    getStringifyReplacer,
    processFiles,
    yamlSafeLoader,
    getJSONOutputWriter
} from '../common/files'

import * as fs from 'fs-extra';
import * as path from 'path';
// import * as yaml from 'js-yaml';

const argv = require('minimist')(process.argv.slice(2));

const inputDirectory = __dirname;
let outputDirectory = '.';
if (argv._.length > 1) {
    outputDirectory = path.resolve(argv._[0]);
}
if (typeof argv?.out === 'string' && argv?.out.length > 0) {
    outputDirectory = path.resolve(argv.out);
}
fs.ensureDir(outputDirectory);

const tsconfigStringTransformer = getStringTransformer(
    ( { groups, wholeString, offset, wholeMatch } ) => {
        if ( groups === null || groups === undefined ) {
            return wholeString;
        } else {
            const {
                basename = '',
                tsconfig = '',
                tsconfig_sep = '',
            } = groups;
            if ( !basename ) {
                // no match found; return wholeString as is
                return wholeString;
            } else {
                // 
                const prior = wholeString.substring(0, offset);
                const posterior = wholeString.substring(offset + wholeMatch?.length);
                let replacement = '';
                if ( !tsconfig ) {
                    // a match is found; 
                    replacement = `tsconfig.${ basename }.json`;
                } else if ( basename === `${ tsconfig }${ tsconfig_sep }` ) {
                    replacement = `tsconfig.json`;
                } else {
                    const _basename = basename.replace( `${ tsconfig }${ tsconfig_sep }`, '' );
                    replacement = `tsconfig.${ _basename }.json`;
                }
                return prior + replacement + posterior;
            }
        }
    }
);

const baseRegExp = /(?<dot>\.)?(?<basename>(?:(?<tsconfig>tsconfig)(?<tsconfig_sep>[._-])?).*|.+)(?<ext_dot>\.)(?<ext>y(?:a)?ml)/gui;
const filenameOnlyRegExp = new RegExp(
    '^' + baseRegExp.source + '$',
    baseRegExp.flags
);
const inPathRegExp = new RegExp(
    /(?<=\\|\/)/.source
        + baseRegExp.source
        + /(?=['"](?!\s*:)|$|\n)/.source,
    baseRegExp.flags
);

const tsconfigJSONStringifyReplacer = getStringifyReplacer(tsconfigStringTransformer, inPathRegExp);

processFiles(
    inputDirectory,
    
    // inputFileParser
    yamlSafeLoader,

    // outputObjectHandler
    getJSONOutputWriter(tsconfigJSONStringifyReplacer),
    outputDirectory,

    // outputFilenameTransformer
    (inputFilename: string): string => tsconfigStringTransformer(filenameOnlyRegExp, inputFilename),


{   // options
    inputFileFilter: isYAMLFile,
    suppressErrors: argv?.quiet,
    quitOnError: argv?.all,
});


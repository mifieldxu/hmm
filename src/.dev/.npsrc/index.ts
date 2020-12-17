import {
    isYAMLFile,
    processFiles,
    getFilenameTransformer,
    yamlExt,
    jsonExt,
    yamlSafeLoader,
    getJSONOutputWriter,
    getSecondParam
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

const npsrcStringTransformer = getFilenameTransformer(yamlExt, jsonExt)

const npsrcJSONStringifyReplacer = getSecondParam;

processFiles(
    inputDirectory,

    // inputFileParser
    yamlSafeLoader,

    getJSONOutputWriter(npsrcJSONStringifyReplacer),
    outputDirectory,

    // outputFilenameTransformer
    npsrcStringTransformer,

{
    inputFileFilter: isYAMLFile,
    suppressErrors: argv?.quiet,
    quitOnError: argv?.all
});


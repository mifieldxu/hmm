import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as scan from 'object-scan';
import * as npsUtils from 'nps-utils';

import { ConcurrentProcesses, Processes } from './../../common/processes';
import { IS_TEST_ENV, CI_Provider, IS } from '../common/env';

const scriptsSpecFileExt = '.yml';
const scriptsSpecFileBasename = __filename.substring(0, __filename.lastIndexOf(path.extname(__filename)));
const scriptsSpecFile = `${scriptsSpecFileBasename}${scriptsSpecFileExt}`;

type SerializableDataType = string | number | boolean | null | undefined
type SerializableDataCollectionType = SerializableDataType[]
interface ISerializableDataDictionary {
    [key: string]: SerializableDataType | SerializableDataCollectionType | ISerializableDataDictionary
}
export let scriptsSpec: ISerializableDataDictionary;

interface ScriptsNode {
    [key: string]: string | string[] | ScriptsNode | Processes
}
type ScriptsNodeKey = keyof ScriptsNode
type ScriptsNodeValue = ScriptsNode[keyof ScriptsNode]
interface Kwargs {
    parent: ScriptsNode
    key: ScriptsNodeKey
    value: ScriptsNodeValue
}


try {
    scriptsSpec = yaml.load(fs.readFileSync(scriptsSpecFile, 'utf8'));
    
    scriptsSpec = scan(['**'], ( { parent, key, value }: Kwargs ): void => {
            if ( Array.isArray( value ) ) {
                parent[ key ] = new ConcurrentProcesses( value );
            }
        })(scriptsSpec);
} catch {}

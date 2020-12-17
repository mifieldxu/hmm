import { ConcurrentProcesses } from './common/processes';
import * as path from 'path'

const argv = process.argv.slice(2).join(' ');

const processes = new ConcurrentProcesses(
    [
        '.tsconfig',
        '.npsrc',
    ].map(
        (directory): string => path.join(__dirname, directory)
    ).map(
        (prestage): string => `ts-node --skip-project ${prestage} ${argv}`
    )
);

Promise.all(
    processes.start()
).then(
    (): never => process.exit(0)
).catch(
    (): never => process.exit(1)
)


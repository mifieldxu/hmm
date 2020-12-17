import { exec } from 'child_process';

interface ProcessRunResult {
    stdout: string | undefined
    stderr: string | undefined
}

export type ProcessResult = ProcessRunResult | void

export async function startProcess(cmd: string): Promise<ProcessResult> {
    return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr): void => {
            if (err) {
                reject(err);
            } else {
                resolve({ stdout, stderr } as ProcessResult);
            }
        });
    });
}

export class Process {
    private _cmd: string;
    constructor (cmd: string) {
        this._cmd = cmd;
    }

    public get cmd () {
        return this._cmd;
    }

    public async start (): Promise<ProcessResult> {
        return startProcess(this._cmd);
    }
}

export class Processes {
    private _processes: Process[]
    constructor (cmds: string[]) {
        this._processes = cmds.map((cmd) => new Process(cmd));
    }

    public get processes () {
        return this._processes;
    }
}

export class ConcurrentProcesses extends Processes {

    public start (): Promise<ProcessResult>[] {
        try {
            return this.processes.map( ( process ) => process.start() );
        } catch ( errorResults ) {
            return errorResults;
        }
    }
}

export class SerialProcesses extends Processes {
    private static _emptyProcess = new Process('');

    public async start (): Promise<ProcessResult[]> {
        try {
            const results: ProcessResult[] = [];
            this.processes.reduce( (previous, current): Promise<ProcessResult> => {
                return previous
                    .then((result): Promise<ProcessResult> => {
                        results.push(result);
                        return current.start();
                    }).catch((reason) => { console.warn(reason) });
            }, SerialProcesses._emptyProcess.start());

            return results;
        } catch ( errorResults ) {
            return errorResults;
        }
    }
}

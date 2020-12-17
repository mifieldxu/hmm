type envVariableValue = string | number | boolean | undefined | null;
type envBooleanyType = string | boolean | 0 | -0 | 0n | -0n | 1 | 1n;
const TRUE = <Set<envBooleanyType>> new Set([
    true, 'true', 'True', 'TRUE',
    1, '1',
    'yes', 'Yes', 'YES',
    'on', 'On', 'ON'
]);
const FALSE = <Set<envBooleanyType>> new Set([
    false, 'false', 'False', 'FALSE', // note taht all non-empty strings are truthy
    0, '0', -0, '-0',
    'no', 'No', 'NO',
    'off', 'Off', 'OFF',
    '[]', '{}', // these are both truthy also
    undefined, 'undefined', 'Undefined', 'UNDEFINED',
    null, 'null', 'Null', 'NULL',
    'NaN', ''
]);

function isTruthy (value: any): boolean {
    return TRUE.has(<envBooleanyType>value);
}

function isFalsy (value: any): boolean {
    return FALSE.has(<envBooleanyType>value);
}

function isUndefined (value: any): boolean {
    return value === undefined || value === null || value === '';
}

function envVariableIs (variableName: string, variableValue: envVariableValue | envVariableValue[]): boolean {
    if (variableName.length) {
        if (Array.isArray(variableValue)) {
            if (variableValue.length) {
                return variableValue.some((variableValuePossibility) => envVariableIs(variableName, variableValuePossibility));
            } else {
                return envVariableIs(variableName, undefined);
            }
        } else {
            const envVar = process.env[variableName];
            if (isUndefined(variableValue) || Number.isNaN(variableValue)) {
                return isUndefined(envVar) || Number.isNaN(envVar);
            } if (isTruthy(variableValue)) {
                return isTruthy(envVar);
            } else if (isFalsy(variableValue)) {;
                return isFalsy(envVar);
            } else if (typeof variableValue === 'number') {
                return envVariableIs(variableName, String(variableValue));
            } else if (typeof variableValue === 'string') {
                return envVar === variableValue;
            } else {
                return false;
            }
        }
    } else {
        throw TypeError('Please supply a non-empty environment variable name.');
    }
}

export const IS_TEST_ENV =
    envVariableIs('NODE_ENV', 'test')
    || envVariableIs('CI', true)
    || envVariableIs('CONTINUOUS_INTEGRATION', true);

export enum CI_Provider {
    AppVeyor = 'APPVEYOR',
    CircleCI = 'CIRCLECI',
    Travis = 'TRAVIS',
    GithubActions = 'GITHUB_ACTIONS',
    GitlabCI = 'GITLAB_CI',
}

export function isProvider (provider: CI_Provider): boolean {
    return IS_TEST_ENV && envVariableIs(provider, true);
}

export const IS = <Record<CI_Provider, boolean>>{
    [CI_Provider.AppVeyor]: isProvider(CI_Provider.AppVeyor),
    [CI_Provider.CircleCI]: isProvider(CI_Provider.CircleCI),
    [CI_Provider.Travis]: isProvider(CI_Provider.Travis),
    [CI_Provider.GithubActions]: isProvider(CI_Provider.GithubActions),
    [CI_Provider.GitlabCI]: isProvider(CI_Provider.GitlabCI),
};

// module.exports = {
//     IS_TEST_ENV,
//     CI_Provider,
//     isProvider,
//     IS,
// };

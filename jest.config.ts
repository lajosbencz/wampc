import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from '@jest/types';

import { loadTSConfig } from './tsconfig.utils';

const tsconfig = loadTSConfig();

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    verbose: true,
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
        prefix: '<rootDir>/',
    }),
};

export default config;

import type { SuiCodegenConfig } from '@mysten/codegen';

const config: SuiCodegenConfig = {
  output: './src/generated',
  generateSummaries: true,
  prune: true,
  suiCommand: 'C:\\Users\\pkhoa\\projects\\personal-data-wallet\\sui.exe',
  packages: [
    {
      package: '@local-pkg/pdw',
      path: '../../smart-contract',
    },
  ],
};

export default config;
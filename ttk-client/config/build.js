import { spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const envModes = ['alpha', 'development', 'production', 'staging'];

function getBuildArg() {
  const buildArg = process.argv[2];

  if (!envModes.includes(buildArg.trim())) throw new Error('Supplied argument does not correspond to any environment modes.');

  return buildArg;
}

async function updateVersion() {
  const packJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = await readFile(packJsonPath);
  const packageObj = JSON.parse(packageJson.toString());

  const currentDate = new Date();

  const versionArr = [
    `${currentDate.getFullYear()}${currentDate.getMonth()}`,
    `${currentDate.getDay()}${currentDate.getHours()}`,
    `${currentDate.getMilliseconds()}`,
  ];

  const currVersion = versionArr.join('.');
  packageObj.version = currVersion;

  await writeFile(packJsonPath, JSON.stringify(packageObj, null, 4));
}

function executeBuildScript(envArg) {
  const buildSteps = ['tsc', `vite build --mode ${envArg}`];

  const proc = spawn(buildSteps.join(' && '), { shell: true });

  proc.stdout.on('data', (data) => console.log(data?.toString()));

  proc.stderr.on('data', (data) => console.log(data?.toString()));

  proc.on('error', (err) => {
    throw err;
  });

  proc.on('exit', (code) => console.log('Build process exited with code ' + code?.toString()));
}

// Final stage
(async () => {
  const buildArg = getBuildArg();
  await updateVersion();
  executeBuildScript(buildArg);
})();

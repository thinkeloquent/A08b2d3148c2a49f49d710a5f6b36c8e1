```mjs
export async function replay(runCfgPath: string, suiteName: string) {
  const conf = loadRunConfig(runCfgPath);
  const suite = conf.suites.find(({ name }) => name === suiteName);
  if (!suite) {
    throw new Error(`Could not find suite named '${suiteName}'`);
  }

  // saucectl suite.timeout is in nanoseconds, convert to seconds
  const timeout = (suite.timeout || 0) / 1_000_000_000 || 30 * 60; // 30min default

  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.error(`Job timed out after ${timeout} seconds`);
      resolve(false);
    }, timeout * 1000);
  });

  // Validate & parse the file.
  const recording = parseRecording(suite.recording);

  return Promise.race([timeoutPromise, runReplay(recording)]);
}
```

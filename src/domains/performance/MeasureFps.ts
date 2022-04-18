const registeredMeasurers: Record<string, number[]> = {}

let lastTimestamp: number; 
function measure(time: number) {
  if (!Object.keys(registeredMeasurers).length) { 
    return; 
  }

  Object.values(registeredMeasurers).forEach((timestamps) => {
    timestamps.push(time - lastTimestamp)
  });

  lastTimestamp = time;

  requestAnimationFrame(measure)
}

export function MeasureFps (name: string) {
  if (registeredMeasurers[name]) {
    throw new Error("can't start measuring twice");
  }

  registeredMeasurers[name] = [];

  if (Object.keys(registeredMeasurers).length === 1) {
    lastTimestamp = performance.now();
    requestAnimationFrame(measure);
  }
}

export function GetAverageFps(name: string): [number, number, number[]] {
  if (!registeredMeasurers[name]) {
    throw new Error(`${name} measurer doesn't exist`);
  }

  const timestamps = registeredMeasurers[name];
  delete registeredMeasurers[name];
  const sum = timestamps.reduce((acc, cur) => acc + cur, 0)
  const average =  sum/ timestamps.length;
  const fps = 1000 / average;

  return [fps, sum, timestamps];
}


function elapsed(st: [number, number]): number {
  if (!st) {
    return -1;
  }
  const diff = process.hrtime(st);
  return diff[0] * 1000 + diff[1] / 1000000;
}

export default elapsed;

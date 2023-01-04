const FloatBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const WeightedSelection = (collection: any[]) => {
  if (!collection || !collection.length) {
    return null;
  }

  const totals: number[] = [];
  let total = 0;
  for (let i = 0; i < collection.length; i++) {
    total += collection[i].weight || 1;
    totals.push(total);
  }
  const rnd = Math.floor(Math.random() * total);
  let selected = collection[0];
  for (let i = 0; i < totals.length; i++) {
    if (totals[i] > rnd) {
      selected = collection[i];
      break;
    }
  }

  return selected;
};

enum logLevel {
  none = 0,
  error,
  warning,
  verbose,
  debug,
}

const cLog = (level: logLevel, icon: string, msg: string) => {
  const tagStyle = `background-color:${
    level === 1 ? '#991e2a' : level === 2 ? '#612a17' : '#253254'
  }; color:white; font-weight: bold; padding: 4px; border-radius: 2px`;

  console.log(`%c${icon} gmgen`, tagStyle, msg);
};

export { FloatBetween, WeightedSelection, cLog, logLevel };

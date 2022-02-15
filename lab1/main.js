// Mykyta Kanyuka, IO-81
// Variant 10

const interval = 10;

// Mean Time to Failure (MTTF)
const mttfArr = [
  1325, 977, 243, 3, 145, 997, 27, 67, 30, 934, 1039, 240, 371, 86, 164, 96,
  156, 145, 280, 444, 887, 726, 41, 503, 174, 1809, 349, 532, 1541, 148, 489,
  198, 4, 761, 389, 37, 317, 1128, 514, 426, 23, 184, 365, 153, 624, 31, 49,
  1216, 61, 189, 286, 1269, 365, 1085, 279, 228, 95, 391, 683, 39, 7, 486, 715,
  204, 1553, 736, 1622, 1892, 448, 23, 135, 555, 252, 569, 8, 491, 724, 331,
  1243, 567, 788, 729, 62, 636, 227, 227, 245, 153, 151, 217, 1009, 143, 301,
  342, 48, 493, 117, 78, 113, 67,
];

const gamma = 0.74;
const probabilityTime = 1586;
const lambdaTime = 1798;

// Sort MTTF list
mttfArr.sort((a, b) => {
  return a - b;
});

const mttfMax = mttfArr[mttfArr.length - 1];

function findAverage(array) {
  const sum = array.reduce(
    (previousValue, currentValue) => previousValue + currentValue,
    0
  );
  return sum / array.length;
}

function countInInterval(array, start, end) {
  let count = 0;
  for (let element of array) {
    if (element > start && element <= end) {
      count++;
    }
  }
  return count;
}

function probabilityDensity(mttfArr, steps = 10) {
  const intervalLength = mttfMax / steps;
  const N = mttfArr.length;

  const frequency = [];
  for (let i = 0; i < steps; i++) {
    frequency.push(
      countInInterval(mttfArr, i * intervalLength, (i + 1) * intervalLength) /
        (N * intervalLength)
    );
  }

  function probability(t) {
    const part = Math.floor(t / intervalLength); // find index of part on histogram

    return frequency[part];
  }

  function findIntegral(start, end) {
    let S = 0;

    const startIndex = Math.ceil(start / intervalLength);
    const endIndex = Math.floor(end / intervalLength);

    for (let i = startIndex; i < endIndex; i++) {
      S += frequency[i] * intervalLength;
    }

    if (start !== 0) {
      S += (startIndex * intervalLength - start) * frequency[startIndex - 1]; // area of first incomplete block
    }

    if (end !== intervalLength * steps) {
      S += (end - endIndex * intervalLength) * frequency[endIndex]; // area of last incomplete block
    }

    return S;
  }

  return { probability, integral: findIntegral };
}

const { probability, integral } = probabilityDensity(mttfArr, interval);

const uptimeProbability = (time) => 1 - integral(0, time);
const intervalLength = mttfMax / interval;

const average = findAverage(mttfArr);
console.log(`Середній наробіток до відмови: ${average}`);

let gammaIntervalIndex = 0;
while (uptimeProbability(gammaIntervalIndex * intervalLength) >= gamma) {
  gammaIntervalIndex++;
}

const maxMttf = gammaIntervalIndex * intervalLength;
const minMttf = (gammaIntervalIndex - 1) * intervalLength;

const gammaTime =
  maxMttf -
  (intervalLength * (uptimeProbability(maxMttf) - gamma)) /
    (uptimeProbability(maxMttf) - uptimeProbability(minMttf)); // 1.6 formula
console.log(`Статистичний відсотоковий наробітку на відмову: ${gammaTime}`);

// TFO - Trouble Free Operation
const probabilityOfTFO = uptimeProbability(probabilityTime);
console.log(
  `Ймовірність безвідмовної роботи на час ${probabilityTime}: ${probabilityOfTFO}`
);

const failureRate = probability(lambdaTime) / uptimeProbability(lambdaTime);
console.log(`Інтенсивність відмов на час ${lambdaTime}: ${failureRate}`);

// Mykyta Kanyuka, IO-81
// Variant 10

// Elements quantity
const elementsCount = 8;

// System Graph
const graph = {
  0: [1, 2],
  1: [0, 2, 3, 5],
  2: [0, 1, 4, 7],
  3: [1, 4, 5],
  4: [2, 3, 7],
  5: [1, 3, 6],
  6: [5, 8, 9],
  7: [2, 4, 8],
  8: [6, 7, 9],
  9: [],
};

const start = 0;
const end = elementsCount + 1;

// Probabilities of trouble-free operation
const P = [0.41, 0.3, 0.59, 0.44, 0.51, 0.63, 0.72, 0.48];

// Probabilities of failures
const Q = failureProbability(P);

function multiplyArr(arr) {
  return arr.reduce((prevValue, currentValue) => prevValue * currentValue, 1);
}

function failureProbability(P) {
  return P.map((probability) => +(1 - probability).toFixed(2));
}

function stateProbability(states, P, Q) {
  const crush = multiplyArr(Q);

  const workingArr = states.map((state) => P[state - 1]);
  const unworkingArr = states.map((state) => Q[state - 1]);

  return (crush / multiplyArr(unworkingArr)) * multiplyArr(workingArr);
}

function createAllStates() {
  const states = [];
  for (let i = 0; i < 2 ** elementsCount; i++) {
    const state = [];
    for (let j = 0; j < elementsCount; j++) {
      state.push(i & (1 << j) ? 1 : 0);
    }
    states.push(state);
  }
  return states;
}

function getWorkingStates(states) {
  const workingStates = [];

  for (let state of states) {
    const workingElements = [];
    for (let i = 0; i < elementsCount; i++) {
      const elementState = state[i];
      if (elementState === 1) {
        workingElements.push(i + 1);
      }
    }
    workingStates.push(workingElements);
  }

  return workingStates;
}

function getPassableStates(
  graph,
  workableStates,
  start = 0,
  end = elementsCount + 1
) {
  const passableStates = [];

  for (const state of workableStates) {
    const isPathExists = (start, end, usedVertices) => {
      for (const vertex of graph[start]) {
        if (vertex === end) {
          return true;
        }

        if (
          usedVertices.indexOf(vertex) === -1 &&
          state.indexOf(vertex) !== -1
        ) {
          if (isPathExists(vertex, end, [...usedVertices, vertex])) {
            return true;
          }
        }
      }

      return false;
    };

    if (isPathExists(start, end, [])) {
      passableStates.push(state);
    }
  }

  return passableStates;
}

// All possible states
const allStates = createAllStates();

// States with workable elements marked
const workingStates = getWorkingStates(allStates);

// States that could be passed from start to end
const passableStates = getPassableStates(graph, workingStates, start, end);

// Given system work probability
const workingProbability = passableStates.reduce(
  (accum, state) => accum + stateProbability(state, P, Q),
  0
);
console.log(`Ймовірність безвідмовної роботи системи: ${workingProbability}`);

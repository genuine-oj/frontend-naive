const judgeStatus = {
  PENDING: -4,
  JUDGING: -3,
  COMPILE_ERROR: -2,
  WRONG_ANSWER: -1,
  ACCEPTED: 0,
  TIME_LIMIT_EXCEEDED: 1,
  MEMORY_LIMIT_EXCEEDED: 2,
  RUNTIME_ERROR: 3,
  SYSTEM_ERROR: 4,
};

const judgeStatusDisplay = {
  PENDING: 'Pending',
  JUDGING: 'Judging',
  COMPILE_ERROR: 'CE',
  WRONG_ANSWER: 'WA',
  ACCEPTED: 'AC',
  TIME_LIMIT_EXCEEDED: 'TLE',
  MEMORY_LIMIT_EXCEEDED: 'MLE',
  RUNTIME_ERROR: 'RE',
  SYSTEM_ERROR: 'SE',
};

const judgeStatusColor = {
  PENDING: '#00FFFF	',
  JUDGING: '#0000FF',
  COMPILE_ERROR: '#7300C7',
  WRONG_ANSWER: '#FF0000',
  ACCEPTED: '#27AE60',
  TIME_LIMIT_EXCEEDED: '#FFBF00',
  MEMORY_LIMIT_EXCEEDED: '#FFBF00',
  RUNTIME_ERROR: '#800080',
  SYSTEM_ERROR: '#808080',
};

const languages = {
  C: 'c',
  CPP: 'cpp',
};

const languagesDisplay = {
  C: 'C',
  CPP: 'C++',
};

const initDisplay = (obj, objDisplay) => {
  const displays = {};
  for (const key in obj) {
    displays[obj[key]] = objDisplay[key];
  }
  obj.getDisplay = value => displays[value];
};

const initColor = (obj, objColor) => {
  const color = {};
  for (const key in obj) {
    color[obj[key]] = objColor[key];
  }
  obj.getColorClass = value => color[value];
};

initDisplay(judgeStatus, judgeStatusDisplay);
initDisplay(languages, languagesDisplay);

initColor(judgeStatus, judgeStatusColor);

export { judgeStatus, languages };

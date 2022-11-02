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

const noTime = [
  judgeStatus.PENDING,
  judgeStatus.JUDGING,
  judgeStatus.COMPILE_ERROR,
  judgeStatus.TIME_LIMIT_EXCEEDED,
  judgeStatus.SYSTEM_ERROR,
];

const noMemory = [
  judgeStatus.PENDING,
  judgeStatus.JUDGING,
  judgeStatus.COMPILE_ERROR,
  judgeStatus.MEMORY_LIMIT_EXCEEDED,
  judgeStatus.SYSTEM_ERROR,
];

const languages = {
  C: 'c',
  CPP: 'cpp',
  PYTHON3: 'python3',
};

const languagesDisplay = {
  C: 'C',
  CPP: 'C++',
  PYTHON3: 'Python 3',
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

const languageOptions = [],
  statusOptions = [];
for (const key in languages) {
  if (typeof languages[key] === 'string') {
    languageOptions.push({
      label: languages.getDisplay(languages[key]),
      value: languages[key],
    });
  }
}
for (const key in judgeStatus) {
  if (typeof judgeStatus[key] === 'number') {
    statusOptions.push({
      label: judgeStatus.getDisplay(judgeStatus[key]),
      value: judgeStatus[key],
    });
  }
}

export {
  judgeStatus,
  languages,
  languageOptions,
  statusOptions,
  noTime,
  noMemory,
};

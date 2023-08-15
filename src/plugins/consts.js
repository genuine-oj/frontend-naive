import config from '../config';

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
  PENDING: '#49C4C0',
  JUDGING: '#5252C4',
  COMPILE_ERROR: '#9231D9',
  WRONG_ANSWER: '#FF0000',
  ACCEPTED: '#27AE60',
  TIME_LIMIT_EXCEEDED: '#DBB131',
  MEMORY_LIMIT_EXCEEDED: '#DBB131',
  RUNTIME_ERROR: '#AE27AE',
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
// initDisplay(languages, languagesDisplay);

initColor(judgeStatus, judgeStatusColor);

const languageOptions = [];
for (const key in config.languages) {
  languageOptions.push({
    label: config.languages[key],
    value: key,
  });
}

const statusOptions = [];
for (const key in judgeStatus) {
  if (typeof judgeStatus[key] === 'number') {
    statusOptions.push({
      label: judgeStatus.getDisplay(judgeStatus[key]),
      value: judgeStatus[key],
    });
  }
}

const difficulty = {
  0: '未设定',
  1: '入门',
  2: '普及-',
  3: '普及/提高-',
  4: '普及+/提高',
  5: '提高+/省选-',
  6: '省选/NOI-',
  7: 'NOI/NOI+/CTSC',
};

const difficultyColor = {
  0: '#BFBFBF',
  1: '#FE4C61',
  2: '#F39C11',
  3: '#FFC116',
  4: '#52C41A',
  5: '#3498DB',
  6: '#9D3BCF',
  7: '#000000',
};

const difficultyOptions = [];
for (const key in difficulty) {
  if (typeof difficulty[key] === 'string') {
    difficultyOptions.push({
      label: difficulty[key],
      value: Number(key),
    });
  }
}

export {
  judgeStatus,
  languageOptions,
  statusOptions,
  noTime,
  noMemory,
  difficulty,
  difficultyColor,
  difficultyOptions,
};

const formatTime = time => {
  if (time > 1000) {
    return `${Math.round(time / 100) / 10}s`;
  }
  return `${time}ms`;
};

const formatSize = size => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let cur = 0;
  while (size > 1024 && cur + 1 < units.length) {
    cur++;
    size /= 1024;
  }
  return `${Math.round(size * 10) / 10}${units[cur]}`;
};

export { formatTime, formatSize };

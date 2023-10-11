import router from '@/router';

const _writeSearchToQuery = (search, pagination, route) => {
  const __writeSearchToQuery = () => {
    const query = JSON.parse(JSON.stringify(route.query));

    let flag = false;
    for (const key in search) {
      if (search[key] || query[key]) {
        let val = search[key];
        if (typeof val === 'number') {
          val = String(val);
        } else if (Array.isArray(val)) {
          val = val.join(',');
        }
        if ((val || query[key]) && val !== query[key]) {
          flag = true;
          query[key] = val;
        }
      }
    }

    if (flag) pagination.page = 1;

    for (const key of ['page', 'pageSize']) {
      if (pagination[key] || query[key]) query[key] = pagination[key];
    }

    for (const key in query) {
      if (!query[key]) delete query[key];
    }

    router.replace({ query: { ...query } });
  };
  return __writeSearchToQuery;
};

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

export { _writeSearchToQuery, formatTime, formatSize };

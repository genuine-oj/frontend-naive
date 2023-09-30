let config = localStorage.getItem('siteSettings');

if (config) config = JSON.parse(config);
else config = {};

export default config;

let flag = false;

const setSiteSettings = _data => {
  const update_time = config.update_time;
  config = _data;
  localStorage.setItem('siteSettings', JSON.stringify(config));
  if (update_time !== config.update_time) window.location.reload();
  flag = true;
};

const runAfterConfig = callback => {
  if (flag) callback();
  else {
    const timer = setInterval(() => {
      if (flag) {
        clearInterval(timer);
        callback();
      }
    }, 50);
  }
};

export { setSiteSettings, config, runAfterConfig };

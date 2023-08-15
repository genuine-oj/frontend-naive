let config = localStorage.getItem('siteSettings');

if (config) config = JSON.parse(config);
else config = {};

export default config;

const setSiteSettings = _data => {
  const update_time = config.update_time;
  config = _data;
  localStorage.setItem('siteSettings', JSON.stringify(config));
  if (update_time !== config.update_time) window.location.reload();
};

export { setSiteSettings, config };

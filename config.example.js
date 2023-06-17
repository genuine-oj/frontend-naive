const config = {
  name: 'GENUINE-OJ', // 网站标题
  useFooter: true, // 是否启用页脚（不启用无需配置 footer）
  footer: {
    icp: 'ICP-XXXXXXXXXX', // 网站 ICP 备案号
  },
  allowRegister: true, // 是否允许用户注册
  forceHideSubmissions: false, // 是否强制隐藏提交记录
  defaultSentenceApi: 'yxzl', // 首页默认的句子 API（可选 yxzl 或 hitokoto）
  defaultMarkdownTheme: 'vuepress', // 默认的 MarkDown 渲染主题（可选值default|github|vuepress|mk-cute|smart-blue|cyanosis|arknights，可在运行后前往个人设置界面尝试不同选择）
  defaultTheme: 'dark', // 默认使用浅色或深色模式
  defaultSubmitLanguage: 'cpp', // 默认提交代码的语言
  languages: {
    c: 'C',
    cpp: 'C++',
    python3: 'Python 3',
  }, // 所有评测语言，键（冒号前）为语言的标识符，应与后端和评测端保持一致，值（冒号后）为前端显示的名称
};

export default config;

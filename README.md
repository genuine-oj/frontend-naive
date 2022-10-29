# Frontend-Naive | 网站前端 NaiveUI 版

## Pre-request | 前置要求

- Node.js
- yarn

## Install | 安装

```bash
yarn
```

## Development | 开发

```bash
yarn dev
```

## Build | 构建

```bash
yarn build
```

该命令会构建前端发行版到 dist 目录。但是需要对静态文件服务器进行配置、将 404 界面重定向到首页后才能正常使用。

Nginx 可参考如下配置：

```nginx
server {
    listen 80;
    server_name localhost;
    root /path/to/frontend-naive/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

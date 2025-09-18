@echo off
echo 正在构建生产版本...
npm run build

echo 启动生产服务器...
set HOST=0.0.0.0
set PORT=3000
npm start

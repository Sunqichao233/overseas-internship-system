# JavaScript 作业提交系统

一个基于 Next.js 14 的现代化作业文件上传系统，支持学生提交作业文件并自动保存到服务器。

## 技术栈

- **前端**: Next.js 14 (App Router) + React + TypeScript
- **样式**: Tailwind CSS
- **后端**: Next.js API Routes
- **文件存储**: 本地文件系统 (`public/uploads`)

## 功能特性

✅ **简洁现代的用户界面**
- 响应式设计，支持移动端和桌面端
- 优雅的渐变背景和卡片式布局
- 实时表单验证和用户反馈

✅ **完整的文件上传功能**
- 支持多种文件格式
- 文件大小限制（10MB）
- 自动文件重命名（防止冲突）
- 上传进度提示

✅ **安全可靠**
- 文件名安全处理
- 表单数据验证
- 错误处理和用户提示

## 项目结构

```
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts          # 文件上传API
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页组件
├── public/
│   └── uploads/                  # 上传文件存储目录
│       └── .gitkeep
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用说明

### 学生端操作

1. 打开系统首页
2. 输入真实姓名
3. 选择要上传的作业文件
4. 点击"提交作业"按钮
5. 等待上传完成提示

### 教师端查看

上传的文件会保存在 `public/uploads/` 目录中，文件命名格式：
```
{姓名}_{时间戳}.{文件扩展名}
```

例如：`张三_1695123456789.js`

## API 接口

### POST /api/upload

上传文件接口

**请求参数：**
- `name` (string): 学生姓名
- `file` (File): 上传的文件

**响应格式：**
```json
{
  "message": "文件上传成功！",
  "success": true,
  "name": "张三",
  "file": "张三_1695123456789.js",
  "uploadPath": "/uploads/张三_1695123456789.js"
}
```

## 部署说明

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm start
```

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

## 自定义配置

### 修改文件大小限制

在 `next.config.js` 中修改：
```javascript
api: {
  bodyParser: {
    sizeLimit: '10mb', // 修改为所需大小
  },
}
```

### 修改上传目录

在 `app/api/upload/route.ts` 中修改：
```typescript
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
```

### 自定义样式

修改 `tailwind.config.js` 或 `app/globals.css` 来自定义外观。

## 常见问题

**Q: 上传失败怎么办？**
A: 检查文件大小是否超限，确保网络连接正常，查看浏览器控制台错误信息。

**Q: 如何查看上传的文件？**
A: 文件保存在 `public/uploads/` 目录中，可以直接访问或通过文件管理器查看。

**Q: 支持哪些文件格式？**
A: 系统支持所有文件格式，但建议上传常见的代码文件（.js, .html, .css, .zip等）。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

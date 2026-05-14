# 示例个人网站首页

一个基于 Next.js、React、Tailwind CSS、TypeScript 的个人博客 / 工具导航首页骨架。当前内容全部来自本地 mock 数据，不包含真实隐私信息、真实联系方式或真实头像。

## 运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:3000` 或 `http://localhost:3000` 查看首页。

## 构建检查

```bash
npm run lint
npm run build
```

## 内容替换

主要占位内容集中在 `src/data/mock.ts`：

- `navItems`：顶部导航
- `recommendedLinks`：推荐入口卡片
- `latestArticles`：最新文章列表
- `hotArticles`：热门文章列表
- `tools`：工具导航
- `tags`：标签云
- `stats`：网站统计
- `profileLinks`：侧边栏快捷入口

首页结构在 `src/app/page.tsx`，组件在 `src/components`。后期接数据库时，可以先保持组件不变，只把 `src/data/mock.ts` 替换为接口或服务端数据读取。

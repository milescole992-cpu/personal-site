# AI 资源分享站 CMS

基于 Next.js App Router、TypeScript、Tailwind CSS、Auth.js 和 Supabase 的 AI 资源内容站。前端只负责展示，首页文案、首页入口、栏目页配置、资源内容和发布位置都由 Supabase 驱动。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

复制 `.env.example` 为 `.env.local`，并填写：

```bash
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_URL=http://localhost:3000
ADMIN_EMAILS=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

不要提交 `.env.local`。

## 数据库迁移

在 Supabase SQL Editor 里按需执行：

- `supabase/schema.sql`：基础用户、资源、下载、收藏表
- `supabase/cms_phase1.sql`：站点设置和首页入口
- `supabase/cms_content_model.sql`：内容类型、发布位置、内容与发布位置关系
- `supabase/content_pages.sql`：栏目页 CMS 配置
- `supabase/cms_layer_and_media.sql`：第一层↔第二层关联、首页模块开关、资源附件/视频字段与 Storage

## CMS 模型

- `site_settings`：首页 Hero、SEO、品牌和 Footer 文案
- `home_sections`：首页核心入口卡片，前台只读取 `section_type = homepage_entry`
- `content_pages`：二级栏目页配置，例如 `/resources`、`/tools`、`/roadmap`
- `content_placements`：内容来源位置，例如资源库、AI 工具页、首页精选、首页热门
- `content_placement_relations`：内容和发布位置的多对多关系
- `resources`：统一内容表，资源、工具、教程、工作流第一阶段都存在这里

首页精选、热门、最新只读取对应发布位置：

- `home-featured`
- `home-hot`
- `home-latest`

**三层结构**：第一层 `home_sections`（首页入口卡片）→ 第二层 `content_pages`（栏目页，须挂载到第一层）→ 第三层 `resources`（内容，通过 `content_placement_relations` 发布）。

后台勾选“推荐/热门”会同步到 `home-featured` / `home-hot`。首页精选/热门/最新在「第一层：首页管理」用开关控制是否显示，前台以**文字链接列表**展示（非卡片）。内容发布支持上传 PDF/压缩包/图片或 MP4/WebM 视频（需执行 `cms_layer_and_media.sql` 并配置 Storage 桶 `resource-media`）。

## 检查

```bash
npm run lint
npm run build
```

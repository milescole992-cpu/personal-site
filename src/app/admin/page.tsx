import {
  BarChart3,
  BookOpenText,
  Eye,
  FilePlus2,
  Flag,
  FolderKanban,
  Home,
  Layers3,
  LockKeyhole,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createContentTypeAction,
  createContentPageAction,
  createHomeSectionAction,
  createPlacementAction,
  deleteContentPageAction,
  deleteContentTypeAction,
  deleteHomeSectionAction,
  deletePlacementAction,
  updateContentPageAction,
  updateContentTypeAction,
  updateHomeSectionAction,
  updatePlacementAction,
  updateSiteSettingsAction,
} from "@/app/actions/cms";
import {
  createResourceAction,
  deleteResourceAction,
  quickUpdateResourceAction,
  updateResourceAction,
} from "@/app/actions/resources";
import { AdminToast } from "@/components/admin-toast";
import { CardShell } from "@/components/card-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { isAdminEmail } from "@/lib/auth-utils";
import { getAdminData } from "@/lib/data";
import type {
  ContentPlacement,
  ContentPlacementRelation,
  ContentPage,
  ContentType,
  HomeSection,
  Resource,
  SiteSettings,
} from "@/lib/supabase";
import { getResourceSlug } from "@/lib/slug";

export const metadata = {
  title: "管理后台 | AI资源工作台",
};

type AdminSection =
  | "dashboard"
  | "content-publish"
  | "content-management"
  | "edit-content"
  | "pages"
  | "content-types"
  | "placements"
  | "homepage"
  | "taxonomy"
  | "settings"
  | "user-content";

type AdminPageProps = {
  searchParams?: Promise<{
    section?: string;
    status?: string;
    q?: string;
    type?: string;
    placement?: string;
    state?: string;
    id?: string;
    editEntry?: string;
  }>;
};

const statusMessages: Record<string, string> = {
  "settings-saved": "已保存网站设置，前台会读取最新配置。",
  "settings-failed": "网站设置保存失败，请检查必填字段或数据库日志。",
  "home-section-created": "首页入口已创建，会按排序显示到首页入口区。",
  "home-section-updated": "首页入口已更新。",
  "home-section-deleted": "首页入口已删除，前台首页不再显示。",
  "home-section-failed": "首页入口保存失败。",
  "home-section-missing": "首页入口缺少标题、说明或链接。",
  "home-section-missing-id": "首页入口缺少 ID。",
  "home-section-update-failed": "首页入口更新失败。",
  "home-section-delete-failed": "首页入口删除失败。",
  "content-page-created": "栏目页已创建，会按内容来源位置展示内容。",
  "content-page-updated": "栏目页配置已更新。",
  "content-page-deleted": "栏目页配置已删除。",
  "content-page-missing": "栏目页缺少标题、slug、路径或内容来源位置。",
  "content-page-duplicate": "栏目页创建失败：slug 或页面路径已经存在。默认栏目请在下方已有栏目卡片里编辑，不要重复新增。",
  "content-page-failed": "栏目页创建失败。",
  "content-page-update-failed": "栏目页更新失败。",
  "content-page-delete-failed": "栏目页删除失败。",
  "content-type-created": "内容类型已创建，可在内容发布时选择。",
  "content-type-updated": "内容类型已更新。",
  "content-type-deleted": "内容类型已删除。",
  "content-type-missing": "内容类型缺少名称或 slug。",
  "content-type-failed": "内容类型保存失败。",
  "content-type-update-failed": "内容类型更新失败。",
  "content-type-delete-failed": "内容类型删除失败，可能仍有关联内容。",
  "placement-created": "发布位置已创建，可在内容发布时选择。",
  "placement-updated": "发布位置已更新。",
  "placement-deleted": "发布位置已删除。",
  "placement-missing": "发布位置缺少名称、slug、页面路径或 key。",
  "placement-failed": "发布位置保存失败。",
  "placement-update-failed": "发布位置更新失败。",
  "placement-delete-failed": "发布位置删除失败，可能仍有关联内容。",
  "resource-published": "内容已发布，并会出现在所选发布位置。",
  "resource-draft-saved": "草稿已保存。勾选“已发布”后才会出现在前台。",
  "resource-updated": "内容已保存。",
  "resource-unpublished": "内容已下架，前台不再展示。",
  "resource-deleted": "内容已删除，前台不再展示。",
  "create-resource-failed": "内容创建失败，请检查必填字段。",
  "resource-update-failed": "内容更新失败。",
  "resource-delete-failed": "内容删除失败。",
  "missing-resource-fields": "标题和简介是必填项。",
  "supabase-not-configured": "Supabase 尚未配置。",
};

const sections: Array<{
  id: AdminSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "dashboard",
    label: "总览",
    description: "内容数量、发布状态、最近更新和快捷入口",
    icon: <BarChart3 size={17} />,
  },
  {
    id: "content-publish",
    label: "内容发布",
    description: "新增资源、教程、工具或工作流",
    icon: <FilePlus2 size={17} />,
  },
  {
    id: "content-management",
    label: "内容管理",
    description: "搜索、筛选、编辑、上下架和删除内容",
    icon: <FolderKanban size={17} />,
  },
  {
    id: "pages",
    label: "栏目页管理",
    description: "管理 /resources、/tools、/workflows 等二级聚合页",
    icon: <BookOpenText size={17} />,
  },
  {
    id: "content-types",
    label: "内容类型",
    description: "配置内容的业务类型",
    icon: <Layers3 size={17} />,
  },
  {
    id: "placements",
    label: "发布位置",
    description: "配置内容显示到哪个页面或模块",
    icon: <Flag size={17} />,
  },
  {
    id: "homepage",
    label: "首页管理",
    description: "Hero、首页入口、首页模块和首页 SEO",
    icon: <Home size={17} />,
  },
  {
    id: "taxonomy",
    label: "分类与标签",
    description: "查看当前内容分类和标签，第二阶段升级独立表",
    icon: <Tags size={17} />,
  },
  {
    id: "settings",
    label: "网站设置",
    description: "品牌、站点定位、Footer 与基础 SEO",
    icon: <Settings2 size={17} />,
  },
  {
    id: "user-content",
    label: "用户内容",
    description: "预留投稿、评论、反馈、举报审核入口",
    icon: <ShieldCheck size={17} />,
  },
];

function fieldClass() {
  return "rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50";
}

function textareaClass() {
  return "rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300/50";
}

function pillClass(active = false) {
  return active
    ? "rounded-md border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-medium text-cyan-50"
    : "rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-100";
}

function getActiveSection(value?: string): AdminSection {
  return sections.some((section) => section.id === value)
    ? (value as AdminSection)
    : value === "edit-content"
      ? "edit-content"
      : "dashboard";
}

function relationIds(resourceId: string, relations: ContentPlacementRelation[]) {
  return new Set(
    relations
      .filter((relation) => relation.resource_id === resourceId && relation.is_active)
      .map((relation) => relation.placement_id),
  );
}

function placementNames(
  ids: Set<string>,
  placements: ContentPlacement[],
) {
  return placements
    .filter((placement) => ids.has(placement.id))
    .map((placement) => placement.name);
}

function typeName(types: ContentType[], id?: string | null) {
  return types.find((type) => type.id === id)?.name ?? "未选择";
}

function placementBySlug(placements: ContentPlacement[], slug?: string | null) {
  return placements.find((placement) => placement.slug === slug) ?? null;
}

function pageByPath(pages: ContentPage[], href: string) {
  return pages.find((page) => page.page_path === href) ?? null;
}

function placementContentCount(
  placement: ContentPlacement | null,
  relations: ContentPlacementRelation[],
) {
  if (!placement) {
    return 0;
  }

  return relations.filter(
    (relation) => relation.placement_id === placement.id && relation.is_active,
  ).length;
}

function FieldHelp({
  label,
  required,
  description,
  placeholder,
  example,
  frontPosition,
  children,
}: {
  label: string;
  required?: boolean;
  description: string;
  placeholder: string;
  example?: string;
  frontPosition: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-100">{label}</span>
        {required ? (
          <span className="rounded bg-cyan-300/10 px-1.5 py-0.5 text-[11px] text-cyan-100">
            必填
          </span>
        ) : (
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-500">
            可选
          </span>
        )}
      </span>
      {children}
      <span className="grid gap-1 rounded-md border border-white/8 bg-white/[0.025] p-3 text-xs leading-5 text-slate-500">
        <span>{description}</span>
        <span>Placeholder：{placeholder}</span>
        {example ? <span>示例：{example}</span> : null}
        <span>前端位置：{frontPosition}</span>
      </span>
    </label>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PlacementChecklist({
  placements,
  selectedIds,
}: {
  placements: ContentPlacement[];
  selectedIds?: Set<string>;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {placements.map((placement) => {
        const controlledByFlag =
          placement.slug === "home-featured" || placement.slug === "home-hot";

        return (
          <label
            key={placement.id}
            className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"
          >
            <input
              name="placement_ids"
              type="checkbox"
              value={placement.id}
              defaultChecked={selectedIds?.has(placement.id)}
              disabled={controlledByFlag}
              className="mt-1 size-4 accent-cyan-300 disabled:opacity-45"
            />
            <span>
              <span className="block font-medium text-white">{placement.name}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                显示到 {placement.page_path} · 模块 key：{placement.placement_key}
              </span>
              {controlledByFlag ? (
                <span className="mt-1 block text-xs leading-5 text-cyan-200">
                  由下方“推荐/热门”勾选自动控制，不需要在这里手动选择。
                </span>
              ) : null}
              {placement.description ? (
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {placement.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
      {placements.length === 0 ? (
        <p className="rounded-md border border-pink-300/20 bg-pink-300/8 p-3 text-sm text-pink-100">
          还没有可用发布位置。请先到“发布位置管理”新增资源库、首页精选等位置。
        </p>
      ) : null}
    </div>
  );
}

function ResourceEditor({
  action,
  resource,
  contentTypes,
  placements,
  selectedIds,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  resource?: Resource;
  contentTypes: ContentType[];
  placements: ContentPlacement[];
  selectedIds?: Set<string>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-6">
      {resource ? <input type="hidden" name="id" defaultValue={resource.id} /> : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <FieldHelp
          label="内容标题"
          required
          description="标题决定列表卡片、详情页和浏览器标题的第一印象，要直接说明内容对象。"
          placeholder="例如：ChatGPT 官方入口与基础用法"
          example="Perplexity AI 搜索研究助手"
          frontPosition="资源卡片标题、详情页 H1、相关推荐标题"
        >
          <input
            name="title"
            required
            defaultValue={resource?.title ?? ""}
            placeholder="例如：ChatGPT 官方入口与基础用法"
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="URL Slug"
          description="用于生成详情页地址；留空会根据标题自动生成。建议使用英文和短横线。"
          placeholder="例如：chatgpt-official-guide"
          example="perplexity-ai-search"
          frontPosition="/resources/[slug] 详情页路径"
        >
          <input
            name="slug"
            defaultValue={resource?.slug ?? ""}
            placeholder="可留空自动生成"
            className={fieldClass()}
          />
        </FieldHelp>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <FieldHelp
          label="内容类型"
          required
          description="这不是写死的枚举，而是来自 content_types。它帮助后台理解这条内容属于工具、教程、路线还是工作流。"
          placeholder="请选择内容类型"
          example="AI工具"
          frontPosition="后台筛选、资源标签、后续栏目聚合"
        >
          <select
            name="content_type_id"
            required
            defaultValue={resource?.content_type_id ?? ""}
            className={fieldClass()}
          >
            <option value="">请选择内容类型</option>
            {contentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} · {type.slug}
              </option>
            ))}
          </select>
        </FieldHelp>
        <FieldHelp
          label="分类"
          description="当前保存在 resources.category，用于资源库筛选和卡片分类。"
          placeholder="例如：AI搜索 / 视频创作 / 工程AI"
          example="AI搜索"
          frontPosition="资源列表筛选、详情页分类徽标"
        >
          <input
            name="category"
            defaultValue={resource?.category ?? ""}
            placeholder="例如：AI搜索"
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="兼容资源类型"
          description="保留旧数据兼容字段；新逻辑优先使用内容类型和发布位置。"
          placeholder="resource / tool / workflow / tutorial"
          example="tool"
          frontPosition="旧数据兼容，不作为主要发布逻辑"
        >
          <input
            name="resource_type"
            defaultValue={resource?.resource_type ?? "resource"}
            placeholder="resource"
            className={fieldClass()}
          />
        </FieldHelp>
      </div>

      <FieldHelp
        label="发布位置"
        required
        description="决定这条内容会出现在哪些前台页面或模块。一个内容可以同时在资源库、工具页和首页精选展示。"
        placeholder="请选择：资源库 / 工具页 / 首页精选"
        example="资源库 + AI工具页 + 首页精选"
        frontPosition="所选发布位置对应的前台页面或首页模块"
      >
        <PlacementChecklist placements={placements} selectedIds={selectedIds} />
      </FieldHelp>

      <FieldHelp
        label="内容简介"
        required
        description="用 1-2 句话说明它能解决什么问题。删除默认内容后，优先重写这个字段。"
        placeholder="例如：一个适合新手快速生成短视频脚本的 AI 工具。"
        example="带来源引用的 AI 搜索工具，适合快速了解新主题和收集参考链接。"
        frontPosition="资源列表卡片、详情页摘要、SEO 兜底描述"
      >
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={resource?.description ?? ""}
          placeholder="一句话说明这个内容解决什么问题。"
          className={textareaClass()}
        />
      </FieldHelp>

      <FieldHelp
        label="详细内容"
        description="可写教程步骤、评测正文、使用建议、注意事项。为空时详情页会隐藏该区域。"
        placeholder="例如：1. 打开官网；2. 选择模板；3. 输入需求；4. 导出结果。"
        example="适合做选题研究、资料检索和观点对比。建议搭配浏览器收藏夹长期使用。"
        frontPosition="资源详情页内容详情区域"
      >
        <textarea
          name="content"
          rows={7}
          defaultValue={resource?.content ?? ""}
          placeholder="正文、步骤或评测内容。"
          className={textareaClass()}
        />
      </FieldHelp>

      <div className="grid gap-5 xl:grid-cols-2">
        <FieldHelp
          label="标签"
          description="英文逗号分隔。用于前台标签展示和后续标签筛选。"
          placeholder="AI助手,写作,工作流"
          example="AI搜索,资料检索,研究助手"
          frontPosition="资源卡片、详情页标签、资源库筛选"
        >
          <input
            name="tags"
            defaultValue={resource?.tags.join(",") ?? ""}
            placeholder="AI助手,写作,工作流"
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="封面图 URL"
          description="当前先填外部 URL；第二阶段会接 Supabase Storage 上传。为空时前端隐藏图片区域。"
          placeholder="https://..."
          example="https://example.com/cover.png"
          frontPosition="后续资源卡片封面和详情页预览区"
        >
          <input
            name="cover_image_url"
            defaultValue={resource?.cover_image_url ?? ""}
            placeholder="第二阶段接上传"
            className={fieldClass()}
          />
        </FieldHelp>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FieldHelp
          label="适合人群"
          description="告诉用户这个资源适合谁，越具体越好。"
          placeholder="例如：AI 新手、内容创作者、副业创业者"
          example="内容创作者、小团队运营、AI 工具玩家"
          frontPosition="资源卡片、详情页适合人群区"
        >
          <textarea
            name="target_audience"
            rows={3}
            defaultValue={resource?.target_audience ?? resource?.audience ?? ""}
            placeholder="例如：AI 新手、内容创作者、副业创业者"
            className={textareaClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="使用场景"
          description="说明用户什么时候会用它，能完成什么任务。"
          placeholder="例如：选题调研、脚本生成、资料总结"
          example="资料检索、观点对比、竞品研究、内容选题"
          frontPosition="资源卡片、详情页使用场景区"
        >
          <textarea
            name="use_cases"
            rows={3}
            defaultValue={resource?.use_cases ?? ""}
            placeholder="例如：选题调研、脚本生成、资料总结"
            className={textareaClass()}
          />
        </FieldHelp>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FieldHelp
          label="官方 / 来源链接"
          description="公开可见的来源或官网链接。为空时详情页不会显示无效按钮。"
          placeholder="https://official-site.com"
          example="https://www.perplexity.ai"
          frontPosition="资源详情页来源链接按钮"
        >
          <input
            name="official_url"
            type="url"
            defaultValue={resource?.official_url ?? resource?.source_url ?? ""}
            placeholder="官方介绍页、文档或来源"
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="下载 / 访问链接"
          description="登录用户点击下载/访问时记录 downloads 后跳转到这里。"
          placeholder="https://..."
          example="https://www.perplexity.ai"
          frontPosition="资源详情页登录后下载/访问按钮"
        >
          <input
            name="download_url"
            type="url"
            defaultValue={resource?.download_url ?? ""}
            placeholder="访问入口或资料下载页"
            className={fieldClass()}
          />
        </FieldHelp>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <FieldHelp
          label="推荐指数"
          description="1-5 分，用于用户快速判断优先级。"
          placeholder="1 到 5"
          example="5"
          frontPosition="资源卡片、详情页推荐指数"
        >
          <input
            name="rating"
            type="number"
            min="1"
            max="5"
            defaultValue={resource?.rating ?? 3}
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="新手友好度"
          description="1-5 分，后续可用于新手筛选和路线推荐。"
          placeholder="1 到 5"
          example="4"
          frontPosition="详情页扩展字段，后续筛选使用"
        >
          <input
            name="beginner_friendly_level"
            type="number"
            min="1"
            max="5"
            defaultValue={resource?.beginner_friendly_level ?? 3}
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="排序权重"
          description="数字越小越靠前。同一发布位置内按这个字段排序。"
          placeholder="例如：10"
          example="10"
          frontPosition="首页模块和列表页排序"
        >
          <input
            name="sort_order"
            type="number"
            defaultValue={resource?.sort_order ?? 100}
            className={fieldClass()}
          />
        </FieldHelp>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FieldHelp
          label="优点"
          description="写这个资源值得推荐的理由；为空时详情页隐藏。"
          placeholder="例如：结果带来源、上手简单、适合快速研究"
          example="带引用来源，适合做主题研究。"
          frontPosition="资源详情页优点区域"
        >
          <textarea
            name="pros"
            rows={3}
            defaultValue={resource?.pros ?? ""}
            className={textareaClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="缺点 / 注意事项"
          description="写使用门槛、限制、风险或替代方案；为空时详情页隐藏。"
          placeholder="例如：部分功能需要订阅，中文结果需二次核对"
          example="复杂任务仍需人工校对。"
          frontPosition="资源详情页注意事项区域"
        >
          <textarea
            name="cons"
            rows={3}
            defaultValue={resource?.cons ?? ""}
            className={textareaClass()}
          />
        </FieldHelp>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FieldHelp
          label="SEO 标题"
          description="用于搜索引擎和分享卡片；为空时使用内容标题。"
          placeholder="例如：Perplexity AI 搜索助手使用指南"
          frontPosition="资源详情页 metadata title"
        >
          <input
            name="seo_title"
            defaultValue={resource?.seo_title ?? ""}
            placeholder="SEO 标题"
            className={fieldClass()}
          />
        </FieldHelp>
        <FieldHelp
          label="SEO 描述"
          description="用于搜索结果展示，建议 80-160 字，不一定直接显示在页面里。"
          placeholder="建议 80-160 字，说明页面核心价值。"
          frontPosition="资源详情页 meta description"
        >
          <textarea
            name="seo_description"
            rows={3}
            defaultValue={resource?.seo_description ?? ""}
            className={textareaClass()}
          />
        </FieldHelp>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">发布状态与展示属性</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          已发布才会进入前台；勾选推荐会自动同步到“首页精选”，勾选热门会自动同步到“首页热门”。其他栏目仍通过上方发布位置控制。
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          <label className="flex items-center gap-2">
            <input
              name="is_published"
              type="checkbox"
              defaultChecked={resource?.is_published ?? true}
              className="size-4 accent-cyan-300"
            />
            已发布
          </label>
          <label className="flex items-center gap-2">
            <input
              name="is_featured"
              type="checkbox"
              defaultChecked={resource?.is_featured ?? false}
              className="size-4 accent-cyan-300"
            />
            推荐
          </label>
          <label className="flex items-center gap-2">
            <input
              name="is_hot"
              type="checkbox"
              defaultChecked={resource?.is_hot ?? false}
              className="size-4 accent-cyan-300"
            />
            热门
          </label>
          <label className="flex items-center gap-2">
            <input
              name="requires_login"
              type="checkbox"
              defaultChecked={resource?.requires_login ?? true}
              className="size-4 accent-cyan-300"
            />
            需要登录下载
          </label>
        </div>
      </div>

      <button className="w-fit rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
        {submitLabel}
      </button>
    </form>
  );
}

function DashboardView({
  resources,
  contentTypes,
  placements,
  downloadsCount,
}: {
  resources: Resource[];
  contentTypes: ContentType[];
  placements: ContentPlacement[];
  downloadsCount: number;
}) {
  const published = resources.filter((item) => item.is_published);
  const drafts = resources.filter((item) => !item.is_published);
  const featured = resources.filter((item) => item.is_featured);
  const recent = [...resources]
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime(),
    )
    .slice(0, 6);

  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Dashboard"
        title="运营总览"
        description="先判断内容库健康度：发布了多少、草稿有多少、哪些内容最近更新。"
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<BookOpenText size={20} />} label="全部内容" value={resources.length} />
        <StatCard icon={<Eye size={20} />} label="已发布" value={published.length} />
        <StatCard icon={<FilePlus2 size={20} />} label="草稿/下架" value={drafts.length} />
        <StatCard icon={<BarChart3 size={20} />} label="推荐内容" value={featured.length} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Layers3 size={20} />} label="内容类型" value={contentTypes.length} />
        <StatCard icon={<Flag size={20} />} label="发布位置" value={placements.length} />
        <StatCard icon={<UsersRound size={20} />} label="下载记录" value={downloadsCount} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-base font-semibold text-white">最近更新内容</h3>
          <div className="mt-4 divide-y divide-white/8">
            {recent.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-white">{resource.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {resource.is_published ? "已发布" : "草稿/下架"} · {resource.category || "未分类"}
                  </p>
                </div>
                <Link href={`/admin?section=edit-content&id=${resource.id}`} className={pillClass()}>
                  编辑
                </Link>
              </div>
            ))}
            {recent.length === 0 ? <EmptyState title="暂无内容" description="先从内容发布创建第一条内容。" /> : null}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-base font-semibold text-white">快捷入口</h3>
          <div className="mt-4 grid gap-2">
            <Link href="/admin?section=content-publish" className={pillClass()}>新增内容</Link>
            <Link href="/admin?section=content-management" className={pillClass()}>管理内容</Link>
            <Link href="/admin?section=placements" className={pillClass()}>配置发布位置</Link>
            <Link href="/admin?section=homepage" className={pillClass()}>编辑首页</Link>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 text-cyan-200">{icon}</div>
      <p className="font-mono text-2xl text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.025] p-5 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function ContentManagementView({
  resources,
  contentTypes,
  placements,
  relations,
  q,
  type,
  placement,
  state,
}: {
  resources: Resource[];
  contentTypes: ContentType[];
  placements: ContentPlacement[];
  relations: ContentPlacementRelation[];
  q?: string;
  type?: string;
  placement?: string;
  state?: string;
}) {
  const lowered = (q || "").trim().toLowerCase();
  const filtered = resources.filter((resource) => {
    const ids = relationIds(resource.id, relations);
    const searchable = [
      resource.title,
      resource.description,
      resource.category,
      resource.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!lowered || searchable.includes(lowered)) &&
      (!type || resource.content_type_id === type) &&
      (!placement || ids.has(placement)) &&
      (!state ||
        (state === "published" && resource.is_published) ||
        (state === "draft" && !resource.is_published) ||
        (state === "featured" && resource.is_featured) ||
        (state === "hot" && resource.is_hot))
    );
  });

  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Content"
        title="内容管理"
        description="这里不是展示列表，而是运营列表：搜索、筛选、预览、编辑、上下架、推荐、热门和删除。"
      />
      <form className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1fr_180px_180px_160px_auto]" action="/admin">
        <input type="hidden" name="section" value="content-management" />
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/24 px-3 py-2">
          <Search size={16} className="text-cyan-200" />
          <input name="q" defaultValue={q ?? ""} placeholder="搜索标题、简介、分类、标签" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select name="type" defaultValue={type ?? ""} className={fieldClass()}>
          <option value="">全部类型</option>
          {contentTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="placement" defaultValue={placement ?? ""} className={fieldClass()}>
          <option value="">全部位置</option>
          {placements.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="state" defaultValue={state ?? ""} className={fieldClass()}>
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿/下架</option>
          <option value="featured">推荐</option>
          <option value="hot">热门</option>
        </select>
        <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
          筛选
        </button>
      </form>

      <div className="space-y-3">
        {filtered.map((resource) => {
          const ids = relationIds(resource.id, relations);
          const names = placementNames(ids, placements);
          const href = `/resources/${getResourceSlug(resource)}`;
          return (
            <div key={resource.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{resource.title}</h3>
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                      {typeName(contentTypes, resource.content_type_id)}
                    </span>
                    <span className={resource.is_published ? "rounded-md bg-emerald-300/8 px-2 py-1 text-xs text-emerald-100" : "rounded-md bg-slate-300/8 px-2 py-1 text-xs text-slate-400"}>
                      {resource.is_published ? "已发布" : "草稿/下架"}
                    </span>
                    {resource.is_featured ? <span className="rounded-md bg-amber-300/8 px-2 py-1 text-xs text-amber-100">推荐</span> : null}
                    {resource.is_hot ? <span className="rounded-md bg-pink-300/8 px-2 py-1 text-xs text-pink-100">热门</span> : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{resource.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    发布位置：{names.length ? names.join(" / ") : "未选择，前台不会展示"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={href} className={pillClass()}>预览</Link>
                  <CopyLinkButton href={href} className={pillClass()} />
                  <Link href={`/admin?section=edit-content&id=${resource.id}`} className={pillClass()}>编辑</Link>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                <QuickResourceButton id={resource.id} operation={resource.is_published ? "unpublish" : "publish"} label={resource.is_published ? "下架" : "发布"} />
                <QuickResourceButton id={resource.id} operation={resource.is_featured ? "unfeature" : "feature"} label={resource.is_featured ? "取消推荐" : "设为推荐"} />
                <QuickResourceButton id={resource.id} operation={resource.is_hot ? "unhot" : "hot"} label={resource.is_hot ? "取消热门" : "设为热门"} />
                <form action={deleteResourceAction}>
                  <input type="hidden" name="id" value={resource.id} />
                  <ConfirmSubmitButton
                    message={`确认删除“${resource.title}”？删除后前台不再展示，下载和收藏关联也会失效。`}
                    className="rounded-md border border-pink-300/30 bg-pink-300/8 px-3 py-2 text-xs font-semibold text-pink-100"
                  >
                    删除
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <EmptyState
            title="没有找到内容"
            description="如果刚删除了默认内容，请到“内容发布”按字段说明重新创建，并至少选择一个发布位置。"
          />
        ) : null}
      </div>
    </CardShell>
  );
}

function QuickResourceButton({
  id,
  operation,
  label,
}: {
  id: string;
  operation: string;
  label: string;
}) {
  return (
    <form action={quickUpdateResourceAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="operation" value={operation} />
      <button className="rounded-md border border-cyan-300/25 bg-cyan-300/8 px-3 py-2 text-xs font-semibold text-cyan-100">
        {label}
      </button>
    </form>
  );
}

function ContentTypesView({ contentTypes }: { contentTypes: ContentType[] }) {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Schema"
        title="内容类型管理"
        description="内容类型是后台配置，不是代码写死。默认类型只是种子数据，可以停用、排序、编辑。"
      />
      <form action={createContentTypeAction} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <FieldHelp label="类型名称" required description="后台和发布表单里显示的中文名称。" placeholder="例如：AI工具" frontPosition="内容发布类型下拉、内容管理筛选">
            <input name="name" required placeholder="AI工具" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="Slug" required description="唯一标识，建议英文短横线。" placeholder="ai-tool" frontPosition="系统内部查询和后续接口">
            <input name="slug" required placeholder="ai-tool" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="图标" description="存 lucide 图标名称，前台可按需映射。" placeholder="Wrench" frontPosition="后台标识，后续前台图标">
            <input name="icon" placeholder="Wrench" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="排序" description="数字越小越靠前。" placeholder="10" frontPosition="内容类型列表排序">
            <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
          </FieldHelp>
        </div>
        <FieldHelp label="类型说明" description="告诉管理员这个类型应该收什么内容。" placeholder="可访问、可对比、可长期使用的 AI 工具。" frontPosition="后台说明和发布辅助">
          <textarea name="description" rows={2} className={textareaClass()} />
        </FieldHelp>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
          启用。停用后不会出现在内容发布下拉中。
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">新增内容类型</button>
      </form>
      <EditableTypeList contentTypes={contentTypes} />
    </CardShell>
  );
}

function EditableTypeList({ contentTypes }: { contentTypes: ContentType[] }) {
  return (
    <div className="mt-5 space-y-3">
      {contentTypes.map((type) => (
        <div key={type.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <form action={updateContentTypeAction} className="grid gap-3">
            <input type="hidden" name="id" defaultValue={type.id} />
            <div className="grid gap-3 lg:grid-cols-5">
              <input name="name" defaultValue={type.name} className={fieldClass()} />
              <input name="slug" defaultValue={type.slug} className={fieldClass()} />
              <input name="icon" defaultValue={type.icon ?? ""} className={fieldClass()} />
              <input name="sort_order" type="number" defaultValue={type.sort_order} className={fieldClass()} />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input name="is_active" type="checkbox" defaultChecked={type.is_active} className="size-4 accent-cyan-300" />
                启用
              </label>
            </div>
            <textarea name="description" rows={2} defaultValue={type.description ?? ""} className={textareaClass()} />
            <div className="flex flex-wrap gap-2">
              <button className={pillClass(true)}>保存类型</button>
            </div>
          </form>
          <form action={deleteContentTypeAction} className="mt-2">
            <input type="hidden" name="id" value={type.id} />
            <ConfirmSubmitButton message={`确认删除内容类型“${type.name}”？有关联内容时数据库会阻止删除。`} className="rounded-md border border-pink-300/30 bg-pink-300/8 px-3 py-2 text-xs font-semibold text-pink-100">
              删除类型
            </ConfirmSubmitButton>
          </form>
        </div>
      ))}
    </div>
  );
}

function PlacementsView({ placements }: { placements: ContentPlacement[] }) {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Placement"
        title="发布位置管理"
        description="发布位置解释“内容保存后会出现在前台哪里”。默认位置只是种子数据，后续可新增、停用、排序。"
      />
      <form action={createPlacementAction} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-4 lg:grid-cols-5">
          <FieldHelp label="位置名称" required description="管理员能读懂的位置名。" placeholder="首页精选" frontPosition="内容发布位置多选">
            <input name="name" required placeholder="首页精选" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="Slug" required description="唯一标识，前端查询使用。" placeholder="home-featured" frontPosition="前端 getResourcesByPlacement 查询">
            <input name="slug" required placeholder="home-featured" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="页面路径" required description="告诉管理员这个位置对应哪个页面。" placeholder="/resources" frontPosition="后台说明、前台页面映射">
            <input name="page_path" required placeholder="/resources" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="模块 Key" required description="前端模块的稳定 key。" placeholder="resources" frontPosition="前端模块查询 key">
            <input name="placement_key" required placeholder="resources" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="排序" description="位置列表排序。" placeholder="10" frontPosition="发布位置列表排序">
            <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
          </FieldHelp>
        </div>
        <FieldHelp label="位置说明" description="说明这个位置适合放什么内容。" placeholder="首页精选内容区，适合放最值得先看的内容。" frontPosition="内容发布多选说明">
          <textarea name="description" rows={2} className={textareaClass()} />
        </FieldHelp>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
          启用。停用后不会出现在内容发布多选中。
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">新增发布位置</button>
      </form>
      <div className="mt-5 space-y-3">
        {placements.map((placement) => (
          <div key={placement.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <form action={updatePlacementAction} className="grid gap-3">
              <input type="hidden" name="id" value={placement.id} />
              <div className="grid gap-3 lg:grid-cols-5">
                <input name="name" defaultValue={placement.name} className={fieldClass()} />
                <input name="slug" defaultValue={placement.slug} className={fieldClass()} />
                <input name="page_path" defaultValue={placement.page_path} className={fieldClass()} />
                <input name="placement_key" defaultValue={placement.placement_key} className={fieldClass()} />
                <input name="sort_order" type="number" defaultValue={placement.sort_order} className={fieldClass()} />
              </div>
              <textarea name="description" rows={2} defaultValue={placement.description ?? ""} className={textareaClass()} />
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input name="is_active" type="checkbox" defaultChecked={placement.is_active} className="size-4 accent-cyan-300" />
                  启用
                </label>
                <button className={pillClass(true)}>保存位置</button>
              </div>
            </form>
            <form action={deletePlacementAction} className="mt-2">
              <input type="hidden" name="id" value={placement.id} />
              <ConfirmSubmitButton message={`确认删除发布位置“${placement.name}”？有关联内容时数据库会阻止删除。`} className="rounded-md border border-pink-300/30 bg-pink-300/8 px-3 py-2 text-xs font-semibold text-pink-100">
                删除位置
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function PagesView({
  pages,
  placements,
  relations,
}: {
  pages: ContentPage[];
  placements: ContentPlacement[];
  relations: ContentPlacementRelation[];
}) {
  const activePlacements = placements.filter((placement) => placement.is_active);

  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Pages"
        title="栏目页管理"
        description="这里管理第二层聚合页的标题、说明、SEO、空状态和内容来源位置。页面本身不存内容，内容仍由发布位置关系驱动。"
      />

      <div className="mb-5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-400">
        <p className="font-medium text-cyan-50">先分清两个概念：</p>
        <p className="mt-1">
          首页核心入口是导航卡片，去“首页管理”新增，保存到 home_sections。
          这里的内容来源位置是内容列表来源，来自 content_placements，例如“AI工具页”“教程页”“资源库”。
        </p>
        <p className="mt-1">
          如果你要改 /tools、/roadmap 这些已有栏目，不要在上方重复新增，直接编辑下方已有栏目卡片。
        </p>
      </div>

      <form
        action={createContentPageAction}
        className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4"
      >
        <h3 className="text-base font-semibold text-white">新增栏目页</h3>
        <p className="text-sm leading-6 text-slate-500">
          适合以后新增 TikTok AI、工程 AI、SaaS 产品等二级栏目。默认栏目页可以直接在下方编辑。
        </p>
        <div className="grid gap-4 lg:grid-cols-4">
          <FieldHelp label="页面名称" required description="后台列表中显示的栏目名称。" placeholder="例如：TikTok AI 运营" frontPosition="后台栏目页列表、导航说明">
            <input name="title" required placeholder="TikTok AI 运营" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="Slug" required description="栏目配置唯一标识，建议英文短横线。" placeholder="tiktok-ai" frontPosition="后台配置和 sitemap">
            <input name="slug" required placeholder="tiktok-ai" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="页面路径" required description="用户访问的前端路径。" placeholder="/tiktok-ai" frontPosition="前端第二层页面 URL">
            <input name="page_path" required placeholder="/tiktok-ai" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="内容来源位置" required description="决定该栏目页读取哪个发布位置下的内容。这里不会出现“首页核心入口”，因为首页核心入口是导航卡片，不是内容列表来源。" placeholder="请选择内容来源位置" frontPosition="栏目页内容列表">
            <select name="placement_slug" required className={fieldClass()} defaultValue="">
              <option value="" disabled>选择内容来源位置</option>
              {activePlacements.map((placement) => (
                <option key={placement.id} value={placement.slug}>
                  {placement.name} · {placement.page_path}
                </option>
              ))}
            </select>
          </FieldHelp>
        </div>
        <FieldHelp label="页面 Hero 标题" required description="显示在栏目页顶部最大标题位置。" placeholder="例如：TikTok AI 运营资料库" frontPosition="栏目页 Hero / 大标题">
          <input name="hero_title" required placeholder="TikTok AI 运营资料库" className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="页面描述" description="解释该栏目收录什么内容，给管理员和前台用户一个明确预期。" placeholder="围绕短视频选题、脚本、素材、发布和复盘的 AI 工作流。" frontPosition="栏目页 Hero / 描述">
          <textarea name="hero_description" rows={2} className={textareaClass()} />
        </FieldHelp>
        <input name="hero_subtitle" placeholder="TIKTOK AI OPS" className={fieldClass()} />
        <div className="grid gap-4 lg:grid-cols-2">
          <input name="seo_title" placeholder="SEO 标题，例如：TikTok AI 运营" className={fieldClass()} />
          <input name="seo_description" placeholder="SEO 描述，建议 80-160 字" className={fieldClass()} />
          <input name="empty_state_title" placeholder="空状态标题，例如：内容正在整理中" className={fieldClass()} />
          <input name="empty_state_description" placeholder="空状态说明：管理员到哪里发布内容" className={fieldClass()} />
          <input name="primary_cta_text" placeholder="CTA 文案，例如：进入资源库" className={fieldClass()} />
          <input name="primary_cta_href" placeholder="CTA 链接，例如：/resources" className={fieldClass()} />
          <input name="description" placeholder="后台简介，可选" className={fieldClass()} />
          <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
          启用栏目页配置
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          新增栏目页
        </button>
      </form>

      <div className="mt-5 space-y-4">
        {pages.map((page) => {
          const placement = placementBySlug(placements, page.placement_slug);
          const count = placementContentCount(placement, relations);

          return (
            <div key={page.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{page.title}</h3>
                    <span className={page.is_active ? "rounded-md bg-emerald-300/8 px-2 py-1 text-xs text-emerald-100" : "rounded-md bg-slate-300/8 px-2 py-1 text-xs text-slate-400"}>
                      {page.is_active ? "启用" : "停用"}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                      {page.page_path}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    内容来源位置：{placement ? `${placement.name}（${placement.slug}）` : `未匹配：${page.placement_slug}`} ·
                    当前关联内容 {count} 条
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    前端规则：栏目页读取这个发布位置下 is_published=true 的内容；没有内容时显示你配置的空状态。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={page.page_path} className={pillClass()}>预览</Link>
                  <CopyLinkButton href={page.page_path} className={pillClass()} />
                </div>
              </div>

              <form action={updateContentPageAction} className="grid gap-3">
                <input type="hidden" name="id" value={page.id} />
                <div className="grid gap-3 lg:grid-cols-4">
                  <input name="title" defaultValue={page.title} className={fieldClass()} />
                  <input name="slug" defaultValue={page.slug} className={fieldClass()} />
                  <input name="page_path" defaultValue={page.page_path} className={fieldClass()} />
                  <select name="placement_slug" defaultValue={page.placement_slug} className={fieldClass()}>
                    {placements.map((placementOption) => (
                      <option key={placementOption.id} value={placementOption.slug}>
                        {placementOption.name} · {placementOption.page_path}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <input name="hero_title" defaultValue={page.hero_title} placeholder="Hero 标题" className={fieldClass()} />
                  <input name="hero_subtitle" defaultValue={page.hero_subtitle ?? ""} placeholder="Hero 标签" className={fieldClass()} />
                </div>
                <textarea name="hero_description" rows={2} defaultValue={page.hero_description ?? ""} placeholder="Hero 描述" className={textareaClass()} />
                <div className="grid gap-3 lg:grid-cols-2">
                  <input name="seo_title" defaultValue={page.seo_title ?? ""} placeholder="SEO 标题" className={fieldClass()} />
                  <input name="seo_description" defaultValue={page.seo_description ?? ""} placeholder="SEO 描述" className={fieldClass()} />
                  <input name="empty_state_title" defaultValue={page.empty_state_title ?? ""} placeholder="空状态标题" className={fieldClass()} />
                  <input name="empty_state_description" defaultValue={page.empty_state_description ?? ""} placeholder="空状态描述" className={fieldClass()} />
                  <input name="primary_cta_text" defaultValue={page.primary_cta_text ?? ""} placeholder="CTA 文案" className={fieldClass()} />
                  <input name="primary_cta_href" defaultValue={page.primary_cta_href ?? ""} placeholder="CTA 链接" className={fieldClass()} />
                  <input name="description" defaultValue={page.description ?? ""} placeholder="后台简介" className={fieldClass()} />
                  <input name="sort_order" type="number" defaultValue={page.sort_order} className={fieldClass()} />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input name="is_active" type="checkbox" defaultChecked={page.is_active} className="size-4 accent-cyan-300" />
                    启用
                  </label>
                  <button className={pillClass(true)}>保存栏目页</button>
                </div>
              </form>
              <form action={deleteContentPageAction} className="mt-2">
                <input type="hidden" name="id" value={page.id} />
                <ConfirmSubmitButton
                  message={`确认删除栏目页配置“${page.title}”？这不会删除内容，但该栏目配置会从后台移除。`}
                  className="rounded-md border border-pink-300/30 bg-pink-300/8 px-3 py-2 text-xs font-semibold text-pink-100"
                >
                  删除栏目页配置
                </ConfirmSubmitButton>
              </form>
            </div>
          );
        })}
        {pages.length === 0 ? (
          <EmptyState title="暂无栏目页配置" description="执行 supabase/content_pages.sql 后会写入默认二级栏目页，也可以在这里新增。" />
        ) : null}
      </div>
    </CardShell>
  );
}

function HomepageView({
  settings,
  homeSections,
  contentPages,
  editingSectionId,
}: {
  settings: SiteSettings;
  homeSections: HomeSection[];
  contentPages: ContentPage[];
  editingSectionId?: string;
}) {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Homepage"
        title="首页管理"
        description="首页 Hero、按钮、入口卡片和首页 SEO 都从数据库读取。删除默认值后，按字段说明重新填写即可。"
      />
      <form action={updateSiteSettingsAction} className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <input type="hidden" name="id" defaultValue={settings.id} />
        <FieldHelp label="首页主标题" required description="首页第一屏最大标题，用来说明网站核心价值。" placeholder="AI 工具、工作流与工程数字化实验室" example="AI 产品实验室与资源工作台" frontPosition="首页 Hero 区域 / 大标题">
          <input name="hero_title" defaultValue={settings.hero_title} className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="首页副标题" required description="补充说明长期定位，建议一句话写清平台方向。" placeholder="海外 AI 资源筛选、AI 工具库与工作流教程" frontPosition="首页 Hero 区域 / 主标题下方">
          <input name="hero_subtitle" defaultValue={settings.hero_subtitle} className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="首页描述" required description="显示在 Hero 下方，用 2-3 句话说明这个站帮谁解决什么问题。" placeholder="面向普通人、内容创作者和工程数字化实践者..." frontPosition="首页 Hero 区域 / 描述文字">
          <textarea name="hero_description" rows={3} defaultValue={settings.hero_description} className={textareaClass()} />
        </FieldHelp>
        <div className="grid gap-5 lg:grid-cols-2">
          <FieldHelp label="主按钮文字" required description="Hero 第一按钮文案。" placeholder="进入 AI 资源库" frontPosition="首页 Hero 主 CTA">
            <input name="primary_cta_text" defaultValue={settings.primary_cta_text} className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="主按钮链接" required description="Hero 第一按钮跳转地址。" placeholder="/resources" frontPosition="首页 Hero 主 CTA 链接">
            <input name="primary_cta_href" defaultValue={settings.primary_cta_href} className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="次按钮文字" description="Hero 第二按钮文案。" placeholder="查看新手路线" frontPosition="首页 Hero 次 CTA">
            <input name="secondary_cta_text" defaultValue={settings.secondary_cta_text} className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="次按钮链接" description="Hero 第二按钮跳转地址。" placeholder="/roadmap" frontPosition="首页 Hero 次 CTA 链接">
            <input name="secondary_cta_href" defaultValue={settings.secondary_cta_href} className={fieldClass()} />
          </FieldHelp>
        </div>
        <FieldHelp label="首页 SEO 标题" description="用于首页搜索引擎标题和分享标题。" placeholder="AI资源工作台 | 海外AI工具筛选与AI工作流教程" frontPosition="首页 metadata title">
          <input name="seo_title" defaultValue={settings.seo_title} className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="首页 SEO 描述" description="用于搜索结果摘要，建议 80-160 字。" placeholder="面向普通人和创作者的海外 AI 工具库..." frontPosition="首页 meta description">
          <textarea name="seo_description" rows={2} defaultValue={settings.seo_description} className={textareaClass()} />
        </FieldHelp>
        <input type="hidden" name="brand_name" value={settings.brand_name} />
        <input type="hidden" name="site_tagline" value={settings.site_tagline} />
        <input type="hidden" name="footer_description" value={settings.footer_description} />
        <input type="hidden" name="homepage_featured_title" value={settings.homepage_featured_title} />
        <input type="hidden" name="homepage_featured_description" value={settings.homepage_featured_description} />
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">保存首页文案</button>
      </form>
      <HomeSectionsEditor
        homeSections={homeSections}
        contentPages={contentPages}
        editingSectionId={editingSectionId}
      />
    </CardShell>
  );
}

function HomeSectionsEditor({
  homeSections,
  contentPages,
  editingSectionId,
}: {
  homeSections: HomeSection[];
  contentPages: ContentPage[];
  editingSectionId?: string;
}) {
  const editingSection =
    homeSections.find((section) => section.id === editingSectionId) ?? null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white">首页入口卡片</h3>
      <p className="mt-1 text-sm text-slate-500">
        这里管理前端“核心入口”卡片，保存到 home_sections，不属于发布位置。
        每个入口都应跳到一个明确的二级栏目页，后台会提示是否匹配。
      </p>
      <form
        action={editingSection ? updateHomeSectionAction : createHomeSectionAction}
        className="mt-4 grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4"
      >
        {editingSection ? <input type="hidden" name="id" value={editingSection.id} /> : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-semibold text-white">
              {editingSection ? `编辑入口：${editingSection.title}` : "新增首页入口"}
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              保存后首页入口区立即按排序读取；隐藏后前台不显示，后台仍保留。
            </p>
          </div>
          {editingSection ? (
            <Link href="/admin?section=homepage" className={pillClass()}>
              取消编辑
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <FieldHelp label="入口标题" required description="显示在首页入口卡片顶部，告诉用户要进入哪个栏目。" placeholder="例如：AI 工具库" frontPosition="首页 Hero 下方入口卡片 / 标题">
            <input name="title" required defaultValue={editingSection?.title ?? ""} placeholder="AI 工具库" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="跳转链接" required description="点击入口后进入的第二层页面路径。" placeholder="/tools" frontPosition="首页入口卡片 / 点击目标">
            <input name="href" required defaultValue={editingSection?.href ?? ""} placeholder="/tools" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="Badge" description="显示在入口卡片上的短标签。" placeholder="Tool Library" frontPosition="首页入口卡片 / 小标签">
            <input name="badge" defaultValue={editingSection?.badge ?? ""} placeholder="Tool Library" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="排序" description="数字越小越靠前。" placeholder="10" frontPosition="首页入口卡片排序">
            <input name="sort_order" type="number" defaultValue={editingSection?.sort_order ?? 100} className={fieldClass()} />
          </FieldHelp>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldHelp label="图标" description="暂存 lucide 图标名称，前台按可识别图标渲染。" placeholder="Wrench" frontPosition="首页入口卡片 / 图标">
            <input name="icon" defaultValue={editingSection?.icon ?? ""} placeholder="Wrench" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="所属区域" description="决定入口属于首页哪个区块；第一阶段主要使用 homepage_entry。" placeholder="homepage_entry" frontPosition="首页入口卡片区">
            <input name="section_type" defaultValue={editingSection?.section_type ?? "homepage_entry"} placeholder="homepage_entry" className={fieldClass()} />
          </FieldHelp>
        </div>
        <FieldHelp label="入口说明" required description="显示在入口卡片正文，用一句话说明这个栏目帮用户解决什么。" placeholder="按场景筛选海外 AI 工具，关注可用性、门槛、价格与替代方案。" frontPosition="首页入口卡片 / 描述">
          <textarea name="description" required rows={2} defaultValue={editingSection?.description ?? ""} placeholder="入口说明：这个入口帮助用户做什么？" className={textareaClass()} />
        </FieldHelp>
        <input name="image_url" defaultValue={editingSection?.image_url ?? ""} placeholder="图片 URL，第二阶段接上传" className={fieldClass()} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked={editingSection?.is_active ?? true} className="size-4 accent-cyan-300" />
          显示在首页
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          {editingSection ? "保存修改" : "新增入口"}
        </button>
      </form>
      <div className="mt-4 space-y-3">
        {homeSections.map((section) => {
          const matchedPage = pageByPath(contentPages, section.href);

          return (
            <div key={section.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-white">{section.title}</h4>
                    <span className={section.is_active ? "rounded-md bg-emerald-300/8 px-2 py-1 text-xs text-emerald-100" : "rounded-md bg-slate-300/8 px-2 py-1 text-xs text-slate-400"}>
                      {section.is_active ? "显示" : "隐藏"}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                      排序 {section.sort_order}
                    </span>
                    {section.badge ? (
                      <span className="rounded-md bg-cyan-300/8 px-2 py-1 text-xs text-cyan-100">
                        {section.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{section.description}</p>
                  <div className="mt-3 grid gap-1 text-xs leading-5 text-slate-500">
                    <span>前端位置：首页入口卡片区 / {section.section_type}</span>
                    <span>跳转目标：{section.href}</span>
                    <span>
                      关联栏目：
                      {matchedPage
                        ? `${matchedPage.title}（${matchedPage.page_path}）`
                        : "未匹配到已配置栏目页，请确认链接是否正确"}
                    </span>
                    <span>图标：{section.icon || "未设置"} · 图片：{section.image_url || "未设置"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin?section=homepage&editEntry=${section.id}`} className={pillClass()}>
                    编辑
                  </Link>
                  <Link href={section.href} className={pillClass()}>
                    预览
                  </Link>
                  <CopyLinkButton href={section.href} className={pillClass()} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                <form action={updateHomeSectionAction}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="title" value={section.title} />
                  <input type="hidden" name="description" value={section.description} />
                  <input type="hidden" name="href" value={section.href} />
                  <input type="hidden" name="icon" value={section.icon ?? ""} />
                  <input type="hidden" name="badge" value={section.badge ?? ""} />
                  <input type="hidden" name="sort_order" value={section.sort_order} />
                  <input type="hidden" name="section_type" value={section.section_type} />
                  <input type="hidden" name="image_url" value={section.image_url ?? ""} />
                  {section.is_active ? null : <input type="hidden" name="is_active" value="on" />}
                  <button className={pillClass(true)}>
                    {section.is_active ? "隐藏入口" : "显示入口"}
                  </button>
                </form>
                <form action={deleteHomeSectionAction}>
                  <input type="hidden" name="id" value={section.id} />
                  <ConfirmSubmitButton
                    message={`确认删除首页入口“${section.title}”？删除后首页入口区不会再显示。`}
                    className="rounded-md border border-pink-300/30 bg-pink-300/8 px-3 py-2 text-xs font-semibold text-pink-100"
                  >
                    删除入口
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}
        {homeSections.length === 0 ? (
          <EmptyState title="暂无首页入口" description="新增入口后，首页核心入口区会自动展示。" />
        ) : null}
      </div>
    </div>
  );
}

function SettingsView({ settings }: { settings: SiteSettings }) {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Settings"
        title="网站设置"
        description="这里放品牌名、站点定位、Footer 和全站基础描述。首页文案请到“首页管理”。"
      />
      <form action={updateSiteSettingsAction} className="grid gap-5">
        <input type="hidden" name="id" defaultValue={settings.id} />
        <div className="grid gap-5 lg:grid-cols-2">
          <FieldHelp label="品牌名" required description="显示在 Header、Footer 和部分 SEO 中。" placeholder="AI资源工作台" frontPosition="导航栏品牌、Footer">
            <input name="brand_name" defaultValue={settings.brand_name} className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="网站定位" required description="一句话说明长期方向。" placeholder="AI + 工程数字化 + TikTok 商业运营 + SaaS 实验" frontPosition="首页 Hero 顶部标签">
            <input name="site_tagline" defaultValue={settings.site_tagline} className={fieldClass()} />
          </FieldHelp>
        </div>
        <FieldHelp label="Footer 简介" description="显示在页脚，用来解释网站定位。" placeholder="一个面向 AI 工具和工程数字化的内容平台。" frontPosition="全站 Footer">
          <textarea name="footer_description" rows={2} defaultValue={settings.footer_description} className={textareaClass()} />
        </FieldHelp>
        <FieldHelp label="首页精选区标题" description="首页精选内容模块的标题。" placeholder="精选资源与工作流" frontPosition="首页精选模块标题">
          <input name="homepage_featured_title" defaultValue={settings.homepage_featured_title} className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="首页精选区描述" description="首页精选内容模块说明。" placeholder="优先展示经过筛选、适合上手的资源。" frontPosition="首页精选模块描述">
          <textarea name="homepage_featured_description" rows={2} defaultValue={settings.homepage_featured_description} className={textareaClass()} />
        </FieldHelp>
        <input type="hidden" name="hero_title" value={settings.hero_title} />
        <input type="hidden" name="hero_subtitle" value={settings.hero_subtitle} />
        <input type="hidden" name="hero_description" value={settings.hero_description} />
        <input type="hidden" name="primary_cta_text" value={settings.primary_cta_text} />
        <input type="hidden" name="primary_cta_href" value={settings.primary_cta_href} />
        <input type="hidden" name="secondary_cta_text" value={settings.secondary_cta_text} />
        <input type="hidden" name="secondary_cta_href" value={settings.secondary_cta_href} />
        <input type="hidden" name="seo_title" value={settings.seo_title} />
        <input type="hidden" name="seo_description" value={settings.seo_description} />
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">保存网站设置</button>
      </form>
    </CardShell>
  );
}

function TaxonomyView({ resources }: { resources: Resource[] }) {
  const categories = Array.from(new Set(resources.map((item) => item.category).filter(Boolean))).sort();
  const tags = Array.from(new Set(resources.flatMap((item) => item.tags))).sort();

  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Taxonomy"
        title="分类与标签"
        description="第一阶段先从内容表中汇总分类和标签，避免硬做假功能。第二阶段可升级 categories、tags、resource_tags 独立表。"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-base font-semibold text-white">当前分类</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => <span key={category} className={pillClass()}>{category}</span>)}
          </div>
          {categories.length === 0 ? <EmptyState title="暂无分类" description="发布内容时填写分类后，这里会自动汇总。" /> : null}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-base font-semibold text-white">当前标签</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => <span key={tag} className={pillClass()}>#{tag}</span>)}
          </div>
          {tags.length === 0 ? <EmptyState title="暂无标签" description="发布内容时填写标签后，这里会自动汇总。" /> : null}
        </div>
      </div>
    </CardShell>
  );
}

function UserContentView() {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Moderation"
        title="用户内容管理"
        description="当前没有投稿、评论、反馈、举报表，不做假数据；这里先把权限逻辑和后台入口预留清楚。"
      />
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-400">
        <p>未来如果开启用户投稿、评论、反馈、举报：</p>
        <p className="mt-2">普通用户只能编辑或删除自己发布的内容；管理员可以在后台审核、隐藏、删除所有用户内容。</p>
        <p className="mt-2">被隐藏或删除的用户内容前台不再展示；删除必须二次确认，重要操作后应记录操作日志。</p>
      </div>
    </CardShell>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const activeSection = getActiveSection(params?.section);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
          <CardShell className="w-full p-6 text-center sm:p-7" glow="pink">
            <LockKeyhole className="mx-auto mb-4 text-pink-200" size={34} />
            <h1 className="text-2xl font-semibold text-white">无权限访问</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              当前账号不在 ADMIN_EMAILS 管理员邮箱列表中。
            </p>
            <Link href="/" className="mt-5 inline-flex rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
              返回首页
            </Link>
          </CardShell>
        </div>
      </main>
    );
  }

  const {
    configured,
    users,
    resources,
    downloads,
    settings,
    homeSections,
    contentPages,
    contentTypes,
    contentPlacements,
    placementRelations,
  } = await getAdminData();
  const activeTypes = contentTypes.filter((type) => type.is_active);
  const activePlacements = contentPlacements.filter((placement) => placement.is_active);
  const editingResource = resources.find((resource) => resource.id === params?.id);

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />
      {params?.status && statusMessages[params.status] ? <AdminToast message={statusMessages[params.status]} /> : null}

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <CardShell className="p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
              CMS Admin
            </p>
            <h1 className="mt-2 text-xl font-semibold text-white">内容运营后台</h1>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              后台是内容源头，前台只展示已发布且已选择发布位置的内容。
            </p>
            <nav className="mt-5 grid gap-2">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/admin?section=${section.id}`}
                  className={activeSection === section.id ? "rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-cyan-50" : "rounded-lg border border-white/8 bg-white/[0.03] p-3 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-100"}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {section.icon}
                    {section.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {section.description}
                  </span>
                </Link>
              ))}
            </nav>
          </CardShell>
        </aside>

        <div className="space-y-6">
          {!configured ? (
            <CardShell glow="pink">
              <h2 className="text-lg font-semibold text-white">Supabase 尚未配置</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                请先配置 Supabase 环境变量并执行 migration SQL。
              </p>
            </CardShell>
          ) : null}

          {activeSection === "dashboard" ? (
            <DashboardView
              resources={resources}
              contentTypes={contentTypes}
              placements={contentPlacements}
              downloadsCount={downloads.length}
            />
          ) : null}

          {activeSection === "content-publish" ? (
            <CardShell className="p-6">
              <SectionHeader
                eyebrow="Create"
                title="内容发布"
                description="先选内容类型，再选发布位置，最后决定保存草稿还是发布上线。选择了发布位置后，前台对应页面才会显示。"
              />
              <ResourceEditor
                action={createResourceAction}
                contentTypes={activeTypes}
                placements={activePlacements}
                submitLabel="保存内容"
              />
            </CardShell>
          ) : null}

          {activeSection === "content-management" ? (
            <ContentManagementView
              resources={resources}
              contentTypes={contentTypes}
              placements={contentPlacements}
              relations={placementRelations}
              q={params?.q}
              type={params?.type}
              placement={params?.placement}
              state={params?.state}
            />
          ) : null}

          {activeSection === "pages" ? (
            <PagesView
              pages={contentPages}
              placements={contentPlacements}
              relations={placementRelations}
            />
          ) : null}

          {activeSection === "edit-content" ? (
            <CardShell className="p-6">
              <SectionHeader
                eyebrow="Edit"
                title="编辑内容"
                description="修改内容类型、发布位置、正文和展示属性后，前台会按新的发布关系展示。"
              />
              {editingResource ? (
                <ResourceEditor
                  action={updateResourceAction}
                  resource={editingResource}
                  contentTypes={activeTypes}
                  placements={activePlacements}
                  selectedIds={relationIds(editingResource.id, placementRelations)}
                  submitLabel="保存修改"
                />
              ) : (
                <EmptyState title="内容不存在" description="请回到内容管理选择要编辑的内容。" />
              )}
            </CardShell>
          ) : null}

          {activeSection === "content-types" ? <ContentTypesView contentTypes={contentTypes} /> : null}
          {activeSection === "placements" ? <PlacementsView placements={contentPlacements} /> : null}
          {activeSection === "homepage" ? (
            <HomepageView
              settings={settings}
              homeSections={homeSections}
              contentPages={contentPages}
              editingSectionId={params?.editEntry}
            />
          ) : null}
          {activeSection === "taxonomy" ? <TaxonomyView resources={resources} /> : null}
          {activeSection === "settings" ? <SettingsView settings={settings} /> : null}
          {activeSection === "user-content" ? <UserContentView /> : null}

          <p className="pb-6 text-xs text-slate-600">
            当前登录管理员：{session.user.email} · 用户数 {users.length}
          </p>
        </div>
      </div>
    </main>
  );
}

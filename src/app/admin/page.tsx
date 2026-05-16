import {
  ArrowRight,
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
  createTaxonomyTermAction,
  deleteContentPageAction,
  deleteContentTypeAction,
  deleteHomeSectionAction,
  deletePlacementAction,
  deleteTaxonomyTermAction,
  restoreCoreResourcePageAction,
  updateContentPageAction,
  updateContentTypeAction,
  updateHomeSectionAction,
  updateHeroPanelAction,
  updatePlacementAction,
  updateSiteSettingsAction,
  updateTaxonomyTermAction,
} from "@/app/actions/cms";
import {
  createResourceAction,
  deleteResourceAction,
  quickUpdateResourceAction,
  updateResourceAction,
} from "@/app/actions/resources";
import {
  approveSubmissionAction,
  deleteSubmissionAction,
  rejectSubmissionAction,
  restrictSubmissionUserAction,
} from "@/app/actions/submissions";
import { AdminToast } from "@/components/admin-toast";
import { TagPicker } from "@/components/admin/tag-picker";
import { CardShell } from "@/components/card-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { isAdminEmail } from "@/lib/auth-utils";
import { getAdminData, type SubmissionWithUser } from "@/lib/data";
import type {
  ContentPlacement,
  ContentPlacementRelation,
  ContentPage,
  ContentType,
  HomeSection,
  Resource,
  SiteSettings,
  TaxonomyTerm,
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
  | "review"
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
  "home-section-missing": "首页入口缺少标题或说明。",
  "content-page-home-section-taken": "该首页入口已挂载栏目页，请换一个第一层入口或编辑已有栏目。",
  "home-section-missing-id": "首页入口缺少 ID。",
  "home-section-update-failed": "首页入口更新失败。",
  "home-section-delete-failed": "首页入口删除失败。",
  "content-page-created": "栏目页已创建，会按内容来源位置展示内容。",
  "content-page-updated": "栏目页配置已更新。",
  "content-page-deleted": "栏目页配置已删除。",
  "content-page-missing": "栏目页缺少标题、第一层入口或内容来源位置。",
  "content-page-duplicate": "栏目页创建失败：slug 或页面路径已经存在。默认栏目请在下方已有栏目卡片里编辑，不要重复新增。",
  "content-page-failed": "栏目页创建失败。",
  "content-page-update-failed": "栏目页更新失败。",
  "content-page-delete-failed": "栏目页删除失败。",
  "content-page-locked": "综合资源是核心栏目，不能删除；你可以编辑它的标题、描述和 SEO。",
  "content-page-restored": "综合资源核心栏目已恢复，现在可以在第二层栏目管理里编辑。",
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
  "taxonomy-created": "标签/分类已新增，发布内容时可以选择。",
  "taxonomy-updated": "标签/分类已保存。",
  "taxonomy-deleted": "标签/分类已删除。",
  "taxonomy-missing": "请填写名称。",
  "taxonomy-failed": "标签/分类保存失败，请确认已执行最新 Supabase SQL。",
  "submission-approved": "投稿已审核通过，并已转为正式资源。",
  "submission-rejected": "投稿已拒绝，用户会在个人中心看到原因。",
  "submission-deleted": "投稿已删除，前台不会展示。",
  "submission-user-restricted": "用户已被限制投稿，并记录了一次违规。",
  "submission-review-failed": "投稿审核操作失败，请检查数据库迁移是否已执行。",
};

const sections: Array<{
  id: AdminSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "dashboard",
    label: "运营总览",
    description: "按三层结构看网站：首页、栏目、内容",
    icon: <BarChart3 size={17} />,
  },
  {
    id: "homepage",
    label: "第一层：首页管理",
    description: "首页 Hero、入口卡片、首页精选模块和 SEO",
    icon: <Home size={17} />,
  },
  {
    id: "pages",
    label: "第二层：栏目管理",
    description: "管理 /resources、/tools、/workflows 等聚合页",
    icon: <BookOpenText size={17} />,
  },
  {
    id: "content-management",
    label: "第三层：内容管理",
    description: "搜索、编辑、发布、下架、推荐和删除内容",
    icon: <FolderKanban size={17} />,
  },
  {
    id: "content-publish",
    label: "发布新内容",
    description: "新增资源、教程、工具、工作流或路线内容",
    icon: <FilePlus2 size={17} />,
  },
  {
    id: "review",
    label: "投稿审核",
    description: "审核用户投稿，通过后进入正式资源库",
    icon: <ShieldCheck size={17} />,
  },
  {
    id: "settings",
    label: "网站设置",
    description: "品牌、站点定位、Footer 与基础 SEO",
    icon: <Settings2 size={17} />,
  },
  {
    id: "placements",
    label: "发布位置配置",
    description: "定义内容可以显示到哪个页面或首页模块",
    icon: <Flag size={17} />,
  },
  {
    id: "content-types",
    label: "内容类型配置",
    description: "配置工具、教程、工作流等业务类型",
    icon: <Layers3 size={17} />,
  },
  {
    id: "taxonomy",
    label: "标签分类",
    description: "先维护标签和分类，发布内容时从这里选择",
    icon: <Tags size={17} />,
  },
  {
    id: "user-content",
    label: "用户内容",
    description: "预留投稿、评论、反馈、举报审核入口",
    icon: <ShieldCheck size={17} />,
  },
];

const sectionGroups: Array<{
  title: string;
  description: string;
  ids: AdminSection[];
}> = [
  {
    title: "运营路径",
    description: "日常主要按这个顺序操作",
    ids: ["dashboard", "homepage", "pages", "content-management", "content-publish", "review", "taxonomy"],
  },
  {
    title: "基础配置",
    description: "只保留经常需要改的站点文案",
    ids: ["settings"],
  },
  {
    title: "用户与审核",
    description: "社区内容治理预留",
    ids: ["user-content"],
  },
];

function sectionById(id: AdminSection) {
  return sections.find((section) => section.id === id);
}

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

function pageByHomeSection(pages: ContentPage[], sectionId: string) {
  return pages.find((page) => page.home_section_id === sectionId) ?? null;
}

function isCoreResourcePage(page: ContentPage) {
  return page.slug === "resources" || page.page_path === "/resources";
}

function resourcesInPlacement(
  resources: Resource[],
  placements: ContentPlacement[],
  relations: ContentPlacementRelation[],
  placementSlug: string,
) {
  const placement = placementBySlug(placements, placementSlug);
  if (!placement) {
    return [] as Resource[];
  }

  const resourceIds = new Set(
    relations
      .filter(
        (relation) =>
          relation.placement_id === placement.id && relation.is_active,
      )
      .map((relation) => relation.resource_id),
  );

  return resources.filter(
    (resource) => resource.is_published && resourceIds.has(resource.id),
  );
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

function LinkPicker({
  name,
  label,
  description,
  placeholder,
  frontPosition,
  contentPages,
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  frontPosition: string;
  contentPages: ContentPage[];
  defaultValue?: string;
  required?: boolean;
}) {
  const matchedPage = contentPages.find((page) => page.page_path === defaultValue);
  const customValue = matchedPage ? "" : defaultValue;

  return (
    <FieldHelp
      label={label}
      required={required}
      description={description}
      placeholder={placeholder}
      frontPosition={frontPosition}
    >
      <div className="grid gap-2">
        <select
          name={`${name}_select`}
          defaultValue={matchedPage?.page_path ?? ""}
          className={fieldClass()}
        >
          <option value="">从已创建栏目里选择</option>
          {contentPages.map((page) => (
            <option key={page.id} value={page.page_path}>
              {page.title} · {page.page_path}
            </option>
          ))}
        </select>
        <input
          name={name}
          defaultValue={customValue}
          required={required && contentPages.length === 0}
          placeholder={placeholder}
          className={fieldClass()}
        />
        <span className="text-xs leading-5 text-slate-600">
          优先使用上面的下拉选择；如果要跳转到自定义路径，再填写下面这个输入框。
        </span>
      </div>
    </FieldHelp>
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

function publishingTargets(
  homeSections: HomeSection[],
  pages: ContentPage[],
  placements: ContentPlacement[],
) {
  return homeSections
    .filter((section) => section.section_type === "homepage_entry" && section.is_active)
    .map((section) => {
      const page = pageByHomeSection(pages, section.id);
      const placement = page ? placementBySlug(placements, page.placement_slug) : null;

      return { section, page, placement };
    })
    .filter(
      (
        target,
      ): target is {
        section: HomeSection;
        page: ContentPage;
        placement: ContentPlacement;
      } => Boolean(target.page && target.placement && target.placement.is_active),
    );
}

function PublishingTargetChecklist({
  homeSections,
  pages,
  placements,
  selectedIds,
}: {
  homeSections: HomeSection[];
  pages: ContentPage[];
  placements: ContentPlacement[];
  selectedIds?: Set<string>;
}) {
  const targets = publishingTargets(homeSections, pages, placements);
  const selectedTarget =
    targets.find(({ placement }) => selectedIds?.has(placement.id))?.placement.id ??
    "";

  if (targets.length === 0) {
    return (
      <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-4">
        <h3 className="text-sm font-semibold text-amber-100">还没有可发布的栏目</h3>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          请先完成：第一层创建首页核心入口 → 第二层把栏目页挂载到入口。完成后，这里会自动出现可选发布目标。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.055] px-3 py-2 text-xs leading-5 text-slate-400">
        只要内容设为“已发布”，就会进入锁定的「综合资源」页。下面这些选项决定它额外出现在哪个首页入口对应的二层栏目里。
      </div>
      <select name="placement_ids" defaultValue={selectedTarget} className={fieldClass()}>
        <option value="">选择发布栏目</option>
        {targets.map(({ section, placement }) => (
          <option key={placement.id} value={placement.id}>
            {section.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResourceEditor({
  action,
  resource,
  taxonomyTerms,
  contentTypes,
  placements,
  homeSections,
  contentPages,
  selectedIds,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  resource?: Resource;
  taxonomyTerms: TaxonomyTerm[];
  contentTypes: ContentType[];
  placements: ContentPlacement[];
  homeSections: HomeSection[];
  contentPages: ContentPage[];
  selectedIds?: Set<string>;
  submitLabel: string;
}) {
  const fallbackContentTypeId = resource?.content_type_id ?? contentTypes[0]?.id ?? "";
  const tagTerms = taxonomyTerms.filter((term) => term.kind === "tag" && term.is_active);
  const categoryTerms = taxonomyTerms.filter(
    (term) => term.kind === "category" && term.is_active,
  );

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-6">
      {resource ? <input type="hidden" name="id" defaultValue={resource.id} /> : null}
      <input type="hidden" name="content_type_id" value={fallbackContentTypeId} />
      <input type="hidden" name="resource_type" value={resource?.resource_type ?? "resource"} />
      <input type="hidden" name="official_url" value={resource?.official_url ?? resource?.source_url ?? ""} />
      <input type="hidden" name="download_url" value={resource?.download_url ?? ""} />
      <input type="hidden" name="target_audience" value={resource?.target_audience ?? resource?.audience ?? ""} />
      <input type="hidden" name="use_cases" value={resource?.use_cases ?? ""} />
      <input type="hidden" name="pros" value={resource?.pros ?? ""} />
      <input type="hidden" name="cons" value={resource?.cons ?? ""} />
      <input
        type="hidden"
        name="beginner_friendly_level"
        value={resource?.beginner_friendly_level ?? 3}
      />
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

      <FieldHelp
        label="发布到哪个首页入口 / 二层栏目"
        description="这里不再让你同时选择内容类型和发布位置。只显示第一层首页核心入口已经挂载好的二层栏目，勾选后内容会出现在对应栏目。"
        placeholder="先在第一层创建入口，再在第二层挂载栏目"
        example="TikTok 运营 / AI工具分享 / 未来 SaaS 产品 / 工程数字化"
        frontPosition="首页核心入口 → 二层栏目页 → 三层详情页"
      >
        <PublishingTargetChecklist
          homeSections={homeSections}
          pages={contentPages}
          placements={placements}
          selectedIds={selectedIds}
        />
      </FieldHelp>

      <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">标签与分类</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            先写标签，再给一个主分类。标签用于搜索和筛选，分类用于把内容归到更大的主题里。
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <FieldHelp
            label="标签"
            description="只能选择左侧“标签分类”里启用的标签。需要新标签时，先去标签分类新增。"
            placeholder="先在标签分类里新增标签"
            example="AI搜索,资料检索,研究助手"
            frontPosition="资源卡片、详情页标签、资源库搜索筛选"
          >
            {tagTerms.length > 0 ? (
              <TagPicker
                name="tags"
                options={tagTerms.map((tag) => ({ id: tag.id, name: tag.name }))}
                defaultValue={resource?.tags ?? []}
              />
            ) : (
              <EmptyState title="还没有可选标签" description="先到左侧“标签分类”新增标签，发布内容时这里才会出现可选项。" />
            )}
          </FieldHelp>
          <FieldHelp
            label="主分类"
            description="只能选择左侧“标签分类”里启用的分类。分类比标签更粗，用于大类筛选。"
            placeholder="选择主分类"
            example="AI搜索"
            frontPosition="资源列表筛选、详情页分类徽标"
          >
            <select
              name="category"
              defaultValue={resource?.category ?? ""}
              className={fieldClass()}
            >
              <option value="">
                {categoryTerms.length > 0 ? "选择分类" : "请先新增分类"}
              </option>
              {categoryTerms.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </FieldHelp>
        </div>
      </div>

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

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">视频 / 图片 / 附件</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          可上传图片、MP4/WebM 视频、PDF、压缩包或文档。前台显示顺序是：视频、图片、附件、正文；只有附件文件才显示下载按钮。
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <FieldHelp
            label="媒体类型"
            description="选择 none 表示仅文字内容；上传文件后系统会自动识别视频或文件。"
            placeholder="none"
            frontPosition="资源详情页媒体区"
          >
            <select
              name="media_type"
              defaultValue={resource?.media_type ?? "none"}
              className={fieldClass()}
            >
              <option value="none">无附件</option>
              <option value="file">上传文件</option>
              <option value="video">上传视频</option>
              <option value="image">上传图片</option>
            </select>
          </FieldHelp>
          <FieldHelp
            label="上传文件"
            description="最大 50MB。保存时会上传到 Supabase Storage。"
            placeholder="选择文件"
            frontPosition="资源详情页"
          >
            <input name="media_file" type="file" className={fieldClass()} />
          </FieldHelp>
        </div>
        {resource?.media_url ? (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
            <p>
              当前：
              {resource.media_type === "video"
                ? "视频"
                : resource.media_type === "image"
                  ? "图片"
                  : resource.media_type === "file"
                    ? "文件"
                    : "链接"}
              {resource.media_file_name ? ` · ${resource.media_file_name}` : ""}
            </p>
            <p className="mt-1 break-all text-slate-500">{resource.media_url}</p>
            <label className="mt-3 flex items-center gap-2 text-sm text-pink-100">
              <input name="clear_media" type="checkbox" className="size-4 accent-pink-300" />
              清除当前附件/视频
            </label>
          </div>
        ) : null}
        <input
          type="hidden"
          name="media_url"
          value={resource?.media_type === "link" ? resource.media_url ?? "" : ""}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
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
  homeSections,
  contentPages,
  downloadsCount,
  submissions,
}: {
  resources: Resource[];
  homeSections: HomeSection[];
  contentPages: ContentPage[];
  downloadsCount: number;
  submissions: SubmissionWithUser[];
}) {
  const published = resources.filter((item) => item.is_published);
  const drafts = resources.filter((item) => !item.is_published);
  const featured = resources.filter((item) => item.is_featured);
  const pendingSubmissions = submissions.filter(
    (item) => item.review_status === "pending" && item.status !== "deleted",
  );
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
        title="三层内容运营总览"
        description="后台按前台结构管理：第一层首页负责入口，第二层栏目负责聚合，第三层内容负责详情。先走这条路径，别在配置里迷路。"
      />
      <div className="mb-5 grid gap-3 lg:grid-cols-3">
        <FlowCard
          index="01"
          title="第一层：首页"
          description="管理首页 Hero 和入口卡片。入口决定用户第一步去哪个栏目。"
          href="/admin?section=homepage"
          stat={`${homeSections.length} 个入口`}
        />
        <FlowCard
          index="02"
          title="第二层：栏目页"
          description="管理 /tools、/resources 这类聚合页。栏目决定页面文案和内容来源。"
          href="/admin?section=pages"
          stat={`${contentPages.length} 个栏目`}
        />
        <FlowCard
          index="03"
          title="第三层：内容"
          description="发布工具、教程、工作流。选择发布位置后才会出现在对应栏目。"
          href="/admin?section=content-management"
          stat={`${published.length} 条已发布`}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<BookOpenText size={20} />} label="全部内容" value={resources.length} />
        <StatCard icon={<Eye size={20} />} label="已发布" value={published.length} />
        <StatCard icon={<FilePlus2 size={20} />} label="草稿/下架" value={drafts.length} />
        <StatCard icon={<BarChart3 size={20} />} label="推荐内容" value={featured.length} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Home size={20} />} label="首页入口" value={homeSections.length} />
        <StatCard icon={<BookOpenText size={20} />} label="栏目页" value={contentPages.length} />
        <StatCard icon={<UsersRound size={20} />} label="下载记录" value={downloadsCount} />
        <StatCard icon={<ShieldCheck size={20} />} label="待审核投稿" value={pendingSubmissions.length} />
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
            <Link href="/admin?section=homepage" className={pillClass()}>编辑首页</Link>
            <Link href="/admin?section=pages" className={pillClass()}>管理栏目</Link>
            <Link href="/admin?section=content-management" className={pillClass()}>管理内容</Link>
            <Link href="/admin?section=content-publish" className={pillClass()}>新增内容</Link>
            <Link href="/admin?section=review" className={pillClass()}>审核投稿</Link>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function FlowCard({
  index,
  title,
  description,
  href,
  stat,
}: {
  index: string;
  title: string;
  description: string;
  href: string;
  stat: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-cyan-300/15 bg-cyan-300/[0.055] p-4 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-cyan-200">{index}</span>
        <span className="rounded-md bg-black/25 px-2 py-1 text-xs text-slate-400">
          {stat}
        </span>
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-100">
        进入管理 <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
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
        eyebrow="Layer 03"
        title="第三层：内容管理"
        description="这里管理详情页内容。内容只有选择了发布位置并且处于已发布状态，才会显示到第一层首页或第二层栏目。"
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
        eyebrow="Config"
        title="内容类型配置"
        description="这里是基础配置，不是日常发布入口。内容类型决定一条内容是什么，例如工具、教程、工作流。"
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
        eyebrow="Config"
        title="发布位置配置"
        description="这里是基础配置，用来定义内容能出现在哪里。日常发布内容时，只需要在内容表单里勾选这些位置。"
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

function availableHomeSectionsForPage(
  homeSections: HomeSection[],
  pages: ContentPage[],
  currentPageId?: string,
) {
  const takenIds = new Set(
    pages
      .filter((page) => page.id !== currentPageId && page.home_section_id)
      .map((page) => page.home_section_id as string),
  );

  return homeSections.filter(
    (section) =>
      section.section_type === "homepage_entry" &&
      section.is_active &&
      !takenIds.has(section.id),
  );
}

function PagesView({
  pages,
  placements,
  relations,
  homeSections,
}: {
  pages: ContentPage[];
  placements: ContentPlacement[];
  relations: ContentPlacementRelation[];
  homeSections: HomeSection[];
}) {
  const activePlacements = placements.filter((placement) => placement.is_active);
  const availableEntries = availableHomeSectionsForPage(homeSections, pages);
  const editablePages = pages.filter((page) => !isCoreResourcePage(page));

  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Layer 02"
        title="第二层：栏目管理"
        description="这里管理用户从首页入口点进去看到的栏目页，例如 /tools、/resources、/workflows。栏目页不直接存内容，只决定页面文案和读取哪个发布位置。"
      />

      <div className="mb-5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-slate-400">
        <p className="font-medium text-cyan-50">正确顺序：先第一层，再第二层</p>
        <p className="mt-1">
          请先在「第一层：首页管理」创建入口，再在这里把栏目页挂载到该入口。前台点击第一层卡片会进入第二层。
        </p>
        <p className="mt-1">
          已有 /tools、/roadmap 等默认栏目请在下方编辑，不要重复新增。
        </p>
      </div>

      <form
        action={createContentPageAction}
        className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4"
      >
        <h3 className="text-base font-semibold text-white">新增栏目页</h3>
        <p className="text-sm leading-6 text-slate-500">
          必须选择尚未绑定栏目的第一层入口。Slug、路径、内容来源可留空自动生成。
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldHelp
            label="挂载到第一层入口"
            required
            description="只能选还没有栏目页的首页入口。"
            placeholder="选择入口"
            frontPosition="首页入口 → 本栏目"
          >
            <select name="home_section_id" required className={fieldClass()} defaultValue="">
              <option value="" disabled>
                {availableEntries.length > 0 ? "选择第一层入口" : "请先到第一层创建入口"}
              </option>
              {availableEntries.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </FieldHelp>
          <FieldHelp label="页面名称" required description="栏目名称。" placeholder="TikTok AI 运营" frontPosition="栏目列表">
            <input name="title" required placeholder="TikTok AI 运营" className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="页面描述" description="栏目说明。" placeholder="短视频 AI 工作流..." frontPosition="栏目 Hero">
            <textarea name="hero_description" rows={3} className={textareaClass()} />
          </FieldHelp>
        </div>

        <details className="rounded-lg border border-white/10 bg-black/20 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-cyan-50">
            高级设置：路径、内容来源、SEO
          </summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <FieldHelp label="Slug" description="可以留空，系统会自动生成。建议英文短横线。" placeholder="tiktok-ai" frontPosition="后台配置和 sitemap">
              <input name="slug" placeholder="可留空自动生成" className={fieldClass()} />
            </FieldHelp>
            <FieldHelp label="页面路径" description="可以留空，系统会根据 slug 自动生成。" placeholder="/tiktok-ai" frontPosition="前端第二层页面 URL">
              <input name="page_path" placeholder="可留空自动生成" className={fieldClass()} />
            </FieldHelp>
            <FieldHelp label="内容来源位置" description="可以留空，系统会自动创建同名内容来源位置。也可以选择已有位置复用。" placeholder="选择已有位置或留空自动创建" frontPosition="栏目页内容列表">
              <select name="placement_slug" className={fieldClass()} defaultValue="">
                <option value="">自动创建同名内容来源</option>
              {activePlacements.map((placement) => (
                <option key={placement.id} value={placement.slug}>
                  {placement.name} · {placement.page_path}
                </option>
              ))}
              </select>
            </FieldHelp>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <input name="hero_title" placeholder="Hero 标题，可留空默认等于页面名称" className={fieldClass()} />
            <input name="hero_subtitle" placeholder="Hero 标签，例如 TIKTOK AI OPS" className={fieldClass()} />
            <input name="seo_title" placeholder="SEO 标题，可选" className={fieldClass()} />
            <input name="seo_description" placeholder="SEO 描述，建议 80-160 字，可选" className={fieldClass()} />
            <input name="empty_state_title" placeholder="空状态标题，可选" className={fieldClass()} />
            <input name="empty_state_description" placeholder="空状态说明，可选" className={fieldClass()} />
            <input name="primary_cta_text" placeholder="CTA 文案，可选" className={fieldClass()} />
            <input name="primary_cta_href" placeholder="CTA 链接，可选" className={fieldClass()} />
            <input name="description" placeholder="后台简介，可选" className={fieldClass()} />
            <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
          </div>
        </details>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
          启用栏目页
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          新增栏目页
        </button>
      </form>

      <div className="mt-5 space-y-4">
        {editablePages.map((page) => {
          const placement = placementBySlug(placements, page.placement_slug);
          const count = placementContentCount(placement, relations);
          const lockedResourcePage = isCoreResourcePage(page);

          return (
            <div key={page.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {lockedResourcePage ? `综合资源${page.title === "综合资源" ? "" : ` · ${page.title}`}` : page.title}
                    </h3>
                    <span className={page.is_active ? "rounded-md bg-emerald-300/8 px-2 py-1 text-xs text-emerald-100" : "rounded-md bg-slate-300/8 px-2 py-1 text-xs text-slate-400"}>
                      {page.is_active ? "启用" : "停用"}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                      {page.page_path}
                    </span>
                    {lockedResourcePage ? (
                      <span className="rounded-md bg-cyan-300/8 px-2 py-1 text-xs text-cyan-100">
                        锁定核心栏目
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {lockedResourcePage
                      ? "综合资源页读取全部已发布内容，是网站内容核心入口。"
                      : `内容来源位置：${placement ? `${placement.name}（${placement.slug}）` : `未匹配：${page.placement_slug}`} · 当前关联内容 ${count} 条`}
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
                <div className="grid gap-3 lg:grid-cols-5">
                  {lockedResourcePage ? (
                    <input
                      value="综合资源核心页"
                      disabled
                      className={`${fieldClass()} opacity-70`}
                    />
                  ) : (
                    <select
                      name="home_section_id"
                      defaultValue={page.home_section_id ?? ""}
                      className={fieldClass()}
                    >
                      {[
                        ...availableHomeSectionsForPage(homeSections, pages, page.id),
                        ...(page.home_section_id
                          ? homeSections.filter((s) => s.id === page.home_section_id)
                          : []),
                      ].map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  )}
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
              {lockedResourcePage ? (
                <p className="mt-2 text-xs text-cyan-200">
                  综合资源为锁定栏目，不提供删除。所有内容最终都可以在这里检索和进入详情。
                </p>
              ) : (
                <form action={deleteContentPageAction} className="mt-2">
                  <input type="hidden" name="id" value={page.id} />
                  <ConfirmSubmitButton
                    message={`确认删除栏目页配置“${page.title}”？这不会删除内容，但该栏目配置会从后台移除。`}
                    className="rounded-md border border-pink-300/30 bg-pink-300/8 px-3 py-2 text-xs font-semibold text-pink-100"
                  >
                    删除栏目页配置
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          );
        })}
        {editablePages.length === 0 ? (
          <EmptyState title="暂无普通二层栏目" description="综合资源已移动到“网站设置”里管理。这里用于管理首页入口点进去的普通栏目页。" />
        ) : null}
      </div>
    </CardShell>
  );
}

function HomepageModulesEditor({
  settings,
  resources,
  placements,
  relations,
}: {
  settings: SiteSettings;
  resources: Resource[];
  placements: ContentPlacement[];
  relations: ContentPlacementRelation[];
}) {
  const featured = resourcesInPlacement(resources, placements, relations, "home-featured");
  const hot = resourcesInPlacement(resources, placements, relations, "home-hot");
  const latest = resourcesInPlacement(resources, placements, relations, "home-latest");

  const modules = [
    {
      key: "featured",
      label: settings.homepage_featured_title,
      toggle: "show_homepage_featured",
      enabled: settings.show_homepage_featured,
      items: featured,
      hint: "在内容发布时勾选「推荐」，或加入「首页精选」发布位置",
    },
    {
      key: "hot",
      label: "热门内容",
      toggle: "show_homepage_hot",
      enabled: settings.show_homepage_hot,
      items: hot,
      hint: "勾选「热门」或加入「首页热门」发布位置",
    },
    {
      key: "latest",
      label: "最新发布",
      toggle: "show_homepage_latest",
      enabled: settings.show_homepage_latest,
      items: latest,
      hint: "将内容发布到「首页最新」发布位置",
    },
  ] as const;

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-semibold text-white">首页推荐列表（文字链接）</h3>
      <p className="mt-1 text-sm text-slate-500">
        下方开关控制前台是否显示对应区块。只有开启且列表中有内容时才会出现。在「第三层：内容管理」为内容选择发布位置。
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FieldHelp label="精选区标题" description="首页精选区块标题。" placeholder="精选资源与工作流" frontPosition="首页 Featured 标题">
          <input name="homepage_featured_title" defaultValue={settings.homepage_featured_title} className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="精选区说明" description="首页精选区块副标题。" placeholder="优先展示..." frontPosition="首页 Featured 描述">
          <input name="homepage_featured_description" defaultValue={settings.homepage_featured_description} className={fieldClass()} />
        </FieldHelp>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input name="show_homepage_featured" type="checkbox" defaultChecked={settings.show_homepage_featured} className="size-4 accent-cyan-300" />
          显示精选区
        </label>
        <label className="flex items-center gap-2">
          <input name="show_homepage_hot" type="checkbox" defaultChecked={settings.show_homepage_hot} className="size-4 accent-cyan-300" />
          显示热门区
        </label>
        <label className="flex items-center gap-2">
          <input name="show_homepage_latest" type="checkbox" defaultChecked={settings.show_homepage_latest} className="size-4 accent-cyan-300" />
          显示最新区
        </label>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <div key={module.key} className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">{module.label}</h4>
              <span className={module.enabled ? "text-xs text-emerald-300" : "text-xs text-slate-500"}>
                {module.enabled ? "已开启" : "已关闭"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{module.hint}</p>
            <p className="mt-2 text-xs text-slate-400">当前 {module.items.length} 条</p>
            {module.items.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-cyan-100">
                {module.items.slice(0, 5).map((item) => (
                  <li key={item.id} className="truncate">
                    {item.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-600">暂无内容</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HomepageView({
  settings,
  homeSections,
  contentPages,
  resources,
  placements,
  relations,
  editingSectionId,
}: {
  settings: SiteSettings;
  homeSections: HomeSection[];
  contentPages: ContentPage[];
  resources: Resource[];
  placements: ContentPlacement[];
  relations: ContentPlacementRelation[];
  editingSectionId?: string;
}) {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Layer 01"
        title="第一层：首页管理"
        description="这里管理用户打开网站第一眼看到的内容：Hero、按钮、首页入口卡片和首页 SEO。首页入口负责把用户带到第二层栏目页。"
      />
      <form action={updateSiteSettingsAction} className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <input type="hidden" name="id" defaultValue={settings.id} />
        <input type="hidden" name="redirect_section" value="homepage" />
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
          <LinkPicker
            name="primary_cta_href"
            label="主按钮链接"
            required
            description="Hero 第一按钮跳转地址。优先从已有栏目中选，不用手打路径。"
            placeholder="/resources"
            frontPosition="首页 Hero 主 CTA 链接"
            contentPages={contentPages}
            defaultValue={settings.primary_cta_href}
          />
          <FieldHelp label="次按钮文字" description="Hero 第二按钮文案。" placeholder="查看新手路线" frontPosition="首页 Hero 次 CTA">
            <input name="secondary_cta_text" defaultValue={settings.secondary_cta_text} className={fieldClass()} />
          </FieldHelp>
          <LinkPicker
            name="secondary_cta_href"
            label="次按钮链接"
            description="Hero 第二按钮跳转地址。可以从已有栏目中选择。"
            placeholder="/roadmap"
            frontPosition="首页 Hero 次 CTA 链接"
            contentPages={contentPages}
            defaultValue={settings.secondary_cta_href}
          />
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
        <HomepageModulesEditor
          settings={settings}
          resources={resources}
          placements={placements}
          relations={relations}
        />
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">保存首页文案与推荐区</button>
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
        先在这里创建第一层入口（标题、说明、图标）。第二层栏目页会挂载到入口上；前台点击卡片后进入已挂载的栏目。
        不要在这里填写跳转链接。
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
          const matchedPage = pageByHomeSection(contentPages, section.id);

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
                      第二层栏目：
                      {matchedPage
                        ? `${matchedPage.title}（${matchedPage.page_path}）`
                        : "尚未挂载，请到「第二层：栏目管理」创建并选择本入口"}
                    </span>
                    <span>图标：{section.icon || "未设置"} · 图片：{section.image_url || "未设置"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin?section=homepage&editEntry=${section.id}`} className={pillClass()}>
                    编辑
                  </Link>
                  {matchedPage ? (
                    <>
                      <Link href={matchedPage.page_path} className={pillClass()}>
                        预览栏目
                      </Link>
                      <CopyLinkButton href={matchedPage.page_path} className={pillClass()} />
                    </>
                  ) : null}
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

function SettingsView({
  settings,
  contentPages,
}: {
  settings: SiteSettings;
  contentPages: ContentPage[];
}) {
  const coreResourcePage =
    contentPages.find((page) => isCoreResourcePage(page)) ?? null;

  return (
    <CardShell className="space-y-6 p-6">
      <SectionHeader
        eyebrow="Settings"
        title="网站设置"
        description="这里分三个独立板块：网站基础信息、综合资源核心页、首页右侧 Resource OS 面板。"
      />
      <form action={updateSiteSettingsAction} className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div>
          <h3 className="text-base font-semibold text-white">网站基础信息</h3>
          <p className="mt-1 text-sm text-slate-500">
            管理品牌名、网站定位、页脚和首页精选模块说明。
          </p>
        </div>
        <input type="hidden" name="id" defaultValue={settings.id} />
        <input type="hidden" name="redirect_section" value="settings" />
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
        {settings.show_homepage_featured ? <input type="hidden" name="show_homepage_featured" value="on" /> : null}
        {settings.show_homepage_hot ? <input type="hidden" name="show_homepage_hot" value="on" /> : null}
        {settings.show_homepage_latest ? <input type="hidden" name="show_homepage_latest" value="on" /> : null}
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">保存网站设置</button>
      </form>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">综合资源核心页</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              这是锁定栏目，对应前台 /resources。可以编辑文案和 SEO，但不能删除。
            </p>
          </div>
          <Link href="/resources" className={pillClass()}>
            预览综合资源
          </Link>
        </div>
        {coreResourcePage ? (
          <form action={updateContentPageAction} className="grid gap-4">
            <input type="hidden" name="id" value={coreResourcePage.id} />
            <input type="hidden" name="slug" value="resources" />
            <input type="hidden" name="page_path" value="/resources" />
            <input type="hidden" name="placement_slug" value="resources" />
            <input type="hidden" name="redirect_section" value="settings" />
            <input type="hidden" name="sort_order" value={coreResourcePage.sort_order} />
            <input type="hidden" name="is_active" value="on" />
            <div className="grid gap-4 lg:grid-cols-2">
              <FieldHelp label="栏目名称" required description="后台和部分前台位置显示的栏目名称。" placeholder="综合资源" frontPosition="/resources 页面配置">
                <input name="title" defaultValue={coreResourcePage.title} className={fieldClass()} />
              </FieldHelp>
              <FieldHelp label="Hero 标题" required description="显示在综合资源页顶部大标题。" placeholder="综合资源" frontPosition="/resources 顶部标题">
                <input name="hero_title" defaultValue={coreResourcePage.hero_title} className={fieldClass()} />
              </FieldHelp>
            </div>
            <FieldHelp label="Hero 标签" description="显示在综合资源页顶部小标签。" placeholder="RESOURCE OS" frontPosition="/resources 顶部标签">
              <input name="hero_subtitle" defaultValue={coreResourcePage.hero_subtitle ?? ""} className={fieldClass()} />
            </FieldHelp>
            <FieldHelp label="页面描述" description="显示在综合资源页顶部，用来说明这个总资源库的价值。" placeholder="这里汇总所有已发布内容..." frontPosition="/resources 顶部描述">
              <textarea name="hero_description" rows={3} defaultValue={coreResourcePage.hero_description ?? ""} className={textareaClass()} />
            </FieldHelp>
            <div className="grid gap-4 lg:grid-cols-2">
              <FieldHelp label="SEO 标题" description="综合资源页的搜索标题。" placeholder="AI 综合资源库" frontPosition="/resources metadata title">
                <input name="seo_title" defaultValue={coreResourcePage.seo_title ?? ""} className={fieldClass()} />
              </FieldHelp>
              <FieldHelp label="SEO 描述" description="综合资源页的搜索摘要。" placeholder="建议 80-160 字。" frontPosition="/resources meta description">
                <input name="seo_description" defaultValue={coreResourcePage.seo_description ?? ""} className={fieldClass()} />
              </FieldHelp>
              <FieldHelp label="空状态标题" description="综合资源没有内容时显示。" placeholder="综合资源正在整理中" frontPosition="/resources 空状态">
                <input name="empty_state_title" defaultValue={coreResourcePage.empty_state_title ?? ""} className={fieldClass()} />
              </FieldHelp>
              <FieldHelp label="空状态描述" description="综合资源没有内容时的说明。" placeholder="内容整理中..." frontPosition="/resources 空状态">
                <input name="empty_state_description" defaultValue={coreResourcePage.empty_state_description ?? ""} className={fieldClass()} />
              </FieldHelp>
            </div>
            <input name="description" type="hidden" value={coreResourcePage.description ?? ""} />
            <input name="primary_cta_text" type="hidden" value={coreResourcePage.primary_cta_text ?? ""} />
            <input name="primary_cta_href" type="hidden" value={coreResourcePage.primary_cta_href ?? ""} />
            <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
              保存综合资源
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/[0.08] p-4">
            <p className="text-sm leading-6 text-slate-400">
              综合资源核心栏目未找到，可能之前被删除了。点击恢复后就能编辑。
            </p>
            <form action={restoreCoreResourcePageAction} className="mt-3">
              <button className="rounded-md bg-amber-200 px-4 py-2.5 text-sm font-semibold text-slate-950">
                恢复综合资源栏目
              </button>
            </form>
          </div>
        )}
      </div>

      <form action={updateHeroPanelAction} className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div>
          <h3 className="text-base font-semibold text-white">首页右侧 Resource OS 面板</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            对应首页 Hero 右侧的小卡片，可以编辑标题说明和三个小指标名称。
          </p>
        </div>
        <input type="hidden" name="id" defaultValue={settings.id} />
        <FieldHelp label="面板小标题" description="显示在右侧卡片顶部。" placeholder="RESOURCE OS" frontPosition="首页 Hero 右侧卡片">
          <input name="hero_panel_eyebrow" defaultValue={settings.hero_panel_eyebrow} className={fieldClass()} />
        </FieldHelp>
        <FieldHelp label="面板说明" description="显示在右侧卡片中间，用一句话说明这个站的资源系统。" placeholder="围绕 AI 工具、工作流和教程沉淀可复用资源。" frontPosition="首页 Hero 右侧卡片说明">
          <textarea name="hero_panel_description" rows={2} defaultValue={settings.hero_panel_description} className={textareaClass()} />
        </FieldHelp>
        <div className="grid gap-4 lg:grid-cols-3">
          <FieldHelp label="01 文案" description="第一个小指标名称。" placeholder="入口" frontPosition="首页 Hero 右侧 01">
            <input name="hero_panel_stat_1_label" defaultValue={settings.hero_panel_stat_1_label} className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="02 文案" description="第二个小指标名称。" placeholder="精选" frontPosition="首页 Hero 右侧 02">
            <input name="hero_panel_stat_2_label" defaultValue={settings.hero_panel_stat_2_label} className={fieldClass()} />
          </FieldHelp>
          <FieldHelp label="03 文案" description="第三个小指标名称。" placeholder="教程" frontPosition="首页 Hero 右侧 03">
            <input name="hero_panel_stat_3_label" defaultValue={settings.hero_panel_stat_3_label} className={fieldClass()} />
          </FieldHelp>
        </div>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          保存 Resource OS 面板
        </button>
      </form>
    </CardShell>
  );
}

function TaxonomyView({ terms }: { terms: TaxonomyTerm[] }) {
  const tags = terms.filter((term) => term.kind === "tag");
  const categories = terms.filter((term) => term.kind === "category");

  return (
    <CardShell className="space-y-6 p-6">
      <SectionHeader
        eyebrow="Taxonomy"
        title="标签分类"
        description="这里是发布内容前先维护的标签库和分类库。发布内容时只能从这里选择，避免越填越乱。"
      />

      <TaxonomyTermList
        title="标签库"
        emptyTitle="暂无标签"
        kind="tag"
        inputPlaceholder="输入标签名称，例如：AI搜索"
        addLabel="新增标签"
        terms={tags}
      />
      <TaxonomyTermList
        title="分类库"
        emptyTitle="暂无分类"
        kind="category"
        inputPlaceholder="输入分类名称，例如：视频创作"
        addLabel="新增分类"
        terms={categories}
      />
    </CardShell>
  );
}

function TaxonomyTermList({
  title,
  emptyTitle,
  kind,
  inputPlaceholder,
  addLabel,
  terms,
}: {
  title: string;
  emptyTitle: string;
  kind: "tag" | "category";
  inputPlaceholder: string;
  addLabel: string;
  terms: TaxonomyTerm[];
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">
        启用后会出现在“发布新内容”的可选项里；点右侧 × 可以直接删除。
      </p>
      <form action={createTaxonomyTermAction} className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-black/20 p-3 lg:grid-cols-[1fr_110px_auto]">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="description" value="" />
        <input type="hidden" name="is_active" value="on" />
        <input name="name" required placeholder={inputPlaceholder} className={fieldClass()} />
        <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          {addLabel}
        </button>
      </form>
      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
        {terms.map((term) => (
          <form key={term.id} action={deleteTaxonomyTermAction} className="mr-2 mb-2 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-xs text-slate-200">
              {term.kind === "tag" ? `#${term.name}` : term.name}
              <input type="hidden" name="id" value={term.id} />
              <ConfirmSubmitButton
                message={`确认删除“${term.name}”？删除后发布内容时不能再选择它。`}
                className="rounded-sm px-1 text-slate-400 transition hover:bg-pink-300/10 hover:text-pink-100"
              >
                ×
              </ConfirmSubmitButton>
            </span>
          </form>
        ))}
        {terms.length === 0 ? (
          <EmptyState title={emptyTitle} description="先在上方新增，发布内容时才会出现可选项。" />
        ) : null}
      </div>
      {terms.length > 0 ? (
        <details className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer text-xs font-semibold text-slate-400">
            高级编辑：改名称、排序、启用状态
          </summary>
          <div className="mt-3 space-y-3">
            {terms.map((term) => (
              <form
                key={term.id}
                action={updateTaxonomyTermAction}
                className="grid gap-3 rounded-md border border-white/10 bg-black/20 p-3 lg:grid-cols-[120px_1fr_90px_auto_auto]"
              >
                <input type="hidden" name="id" value={term.id} />
                <input type="hidden" name="description" value={term.description ?? ""} />
                <select name="kind" defaultValue={term.kind} className={fieldClass()}>
                  <option value="tag">标签</option>
                  <option value="category">分类</option>
                </select>
                <input name="name" defaultValue={term.name} className={fieldClass()} />
                <input name="sort_order" type="number" defaultValue={term.sort_order} className={fieldClass()} />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input name="is_active" type="checkbox" defaultChecked={term.is_active} className="size-4 accent-cyan-300" />
                  启用
                </label>
                <button className={pillClass(true)}>保存</button>
              </form>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function UserContentView() {
  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Moderation"
        title="用户内容管理"
        description="投稿审核已经进入“投稿审核”板块；这里预留未来评论、反馈、举报和用户投稿扩展治理。"
      />
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-400">
        <p>未来如果开启评论、反馈、举报和更多用户生成内容：</p>
        <p className="mt-2">普通用户只能编辑或删除自己发布的内容；管理员可以在后台审核、隐藏、删除所有用户内容。</p>
        <p className="mt-2">被隐藏或删除的用户内容前台不再展示；删除必须二次确认，重要操作后应记录操作日志。</p>
      </div>
    </CardShell>
  );
}

function submissionTypeLabel(type: string) {
  const labels: Record<string, string> = {
    tool: "AI 工具",
    workflow: "AI 工作流",
    tutorial: "教程文章",
    resource: "AI 资源",
    prompt: "AI 提示词",
    experience: "经验分享",
  };

  return labels[type] ?? type;
}

function reviewStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };

  return labels[status] ?? status;
}

function ReviewSubmissionsView({ submissions }: { submissions: SubmissionWithUser[] }) {
  const pending = submissions.filter(
    (submission) => submission.review_status === "pending" && submission.status !== "deleted",
  );
  const reviewed = submissions
    .filter((submission) => submission.review_status !== "pending" || submission.status === "deleted")
    .slice(0, 12);

  return (
    <CardShell className="p-6">
      <SectionHeader
        eyebrow="Review"
        title="投稿审核"
        description="普通用户提交的内容不会直接公开。管理员审核通过后，第一阶段会转成正式资源，并保留 source_submission_id 和 contributor_user_id，后续可扩展到文章、提示词或经验分享。"
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StatCard icon={<ShieldCheck size={20} />} label="待审核" value={pending.length} />
        <StatCard icon={<Eye size={20} />} label="全部投稿" value={submissions.length} />
        <StatCard
          icon={<UsersRound size={20} />}
          label="已拒绝/删除"
          value={submissions.filter((item) => item.review_status === "rejected" || item.status === "deleted").length}
        />
      </div>

      <div className="space-y-4">
        {pending.map((submission) => (
          <div key={submission.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-cyan-300/10 px-2 py-1 text-cyan-100">
                    {submissionTypeLabel(submission.submission_type)}
                  </span>
                  <span className="rounded-md bg-amber-300/10 px-2 py-1 text-amber-100">
                    {reviewStatusLabel(submission.review_status)}
                  </span>
                  <span className="rounded-md bg-white/5 px-2 py-1 text-slate-400">
                    风险：{submission.risk_level}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{submission.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  {submission.summary}
                </p>
                <div className="mt-3 grid gap-1 text-xs leading-5 text-slate-500">
                  <p>投稿用户：{submission.user?.email ?? submission.user_id}</p>
                  <p>
                    用户状态：{submission.user?.status ?? "unknown"} · 信誉 {submission.user?.reputation ?? 0} · 违规 {submission.user?.violation_count ?? 0}
                  </p>
                  <p>分类：{submission.category || "未分类"}</p>
                  <p>标签：{submission.tags.length > 0 ? submission.tags.map((tag) => `#${tag}`).join(" ") : "未选择"}</p>
                  {submission.resource_url ? (
                    <p className="break-all">外链：{submission.resource_url}</p>
                  ) : null}
                  {submission.media_url ? (
                    <p className="break-all">
                      附件：{submission.media_type} · {submission.media_file_name || submission.media_url}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="grid min-w-44 gap-2">
                <form action={approveSubmissionAction}>
                  <input type="hidden" name="id" value={submission.id} />
                  <ConfirmSubmitButton
                    message="确认审核通过？通过后会生成一条正式资源。"
                    className="w-full rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950"
                  >
                    通过并发布
                  </ConfirmSubmitButton>
                </form>
                <form action={restrictSubmissionUserAction}>
                  <input type="hidden" name="user_id" value={submission.user_id} />
                  <ConfirmSubmitButton
                    message="确认限制该用户投稿？这会把用户状态改为 restricted。"
                    className="w-full rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100"
                  >
                    限制投稿
                  </ConfirmSubmitButton>
                </form>
                <form action={deleteSubmissionAction}>
                  <input type="hidden" name="id" value={submission.id} />
                  <ConfirmSubmitButton
                    message="确认删除这条投稿？"
                    className="w-full rounded-md border border-pink-300/30 bg-pink-300/10 px-3 py-2 text-sm font-semibold text-pink-100"
                  >
                    删除违规内容
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>

            {submission.content ? (
              <details className="mt-4 rounded-md border border-white/8 bg-black/20 p-3">
                <summary className="cursor-pointer text-sm font-medium text-slate-200">
                  查看正文
                </summary>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                  {submission.content}
                </div>
              </details>
            ) : null}

            <form action={rejectSubmissionAction} className="mt-4 grid gap-2 lg:grid-cols-[1fr_auto]">
              <input type="hidden" name="id" value={submission.id} />
              <input
                name="review_reason"
                placeholder="拒绝原因，例如：内容介绍过短、外链不可访问、疑似广告或版权风险。"
                className={fieldClass()}
              />
              <ConfirmSubmitButton
                message="确认拒绝这条投稿？用户会看到拒绝原因。"
                className="rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-100"
              >
                拒绝投稿
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}

        {pending.length === 0 ? (
          <EmptyState title="暂无待审核投稿" description="用户从 /submit 提交内容后，会先进入这里等待审核。" />
        ) : null}
      </div>

      {reviewed.length > 0 ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-base font-semibold text-white">最近已处理</h3>
          <div className="mt-3 divide-y divide-white/8">
            {reviewed.map((submission) => (
              <div key={submission.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{submission.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {submissionTypeLabel(submission.submission_type)} · {reviewStatusLabel(submission.review_status)} · {submission.user?.email ?? "未知用户"}
                  </p>
                </div>
                {submission.published_resource_id ? (
                  <span className="rounded-md bg-emerald-300/10 px-2 py-1 text-xs text-emerald-100">
                    已生成资源
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
    taxonomyTerms,
    submissions,
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
          <CardShell className="max-h-[calc(100vh-3rem)] overflow-y-auto p-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
              CMS Admin
            </p>
            <h1 className="mt-2 text-xl font-semibold text-white">内容运营后台</h1>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              后台是内容源头，前台只展示已发布且已选择发布位置的内容。
            </p>
            <nav className="mt-4 grid gap-4">
              {sectionGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-slate-300">{group.title}</p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-600">
                      {group.description}
                    </p>
                  </div>
                  <div className="grid gap-1.5">
                    {group.ids.map((id) => {
                      const section = sectionById(id);

                      if (!section) {
                        return null;
                      }

                      return (
                        <Link
                          key={section.id}
                          href={`/admin?section=${section.id}`}
                          className={activeSection === section.id ? "rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2.5 text-cyan-50" : "rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-100"}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {section.icon}
                            {section.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                            {section.description}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
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
              homeSections={homeSections}
              contentPages={contentPages}
              downloadsCount={downloads.length}
              submissions={submissions}
            />
          ) : null}

          {activeSection === "content-publish" ? (
            <CardShell className="p-6">
              <SectionHeader
                eyebrow="Create"
                title="内容发布"
                description="直接选择要发布到哪个首页核心入口下的二层栏目。内容类型和底层发布位置由系统兼容处理，日常运营不用管。"
              />
              <ResourceEditor
                action={createResourceAction}
                taxonomyTerms={taxonomyTerms}
                contentTypes={activeTypes}
                placements={activePlacements}
                homeSections={homeSections}
                contentPages={contentPages}
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
              homeSections={homeSections}
            />
          ) : null}

          {activeSection === "edit-content" ? (
            <CardShell className="p-6">
              <SectionHeader
                eyebrow="Edit"
                title="编辑内容"
                description="修改内容正文和所属栏目后，前台会按新的栏目关系展示。"
              />
              {editingResource ? (
                <ResourceEditor
                  action={updateResourceAction}
                  resource={editingResource}
                  taxonomyTerms={taxonomyTerms}
                  contentTypes={activeTypes}
                  placements={activePlacements}
                  homeSections={homeSections}
                  contentPages={contentPages}
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
              resources={resources}
              placements={contentPlacements}
              relations={placementRelations}
              editingSectionId={params?.editEntry}
            />
          ) : null}
          {activeSection === "taxonomy" ? <TaxonomyView terms={taxonomyTerms} /> : null}
          {activeSection === "settings" ? (
            <SettingsView settings={settings} contentPages={contentPages} />
          ) : null}
          {activeSection === "review" ? <ReviewSubmissionsView submissions={submissions} /> : null}
          {activeSection === "user-content" ? <UserContentView /> : null}

          <p className="pb-6 text-xs text-slate-600">
            当前登录管理员：{session.user.email} · 用户数 {users.length}
          </p>
        </div>
      </div>
    </main>
  );
}

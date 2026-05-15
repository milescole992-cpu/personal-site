import {
  BarChart3,
  Boxes,
  FilePlus2,
  Flag,
  FolderKanban,
  Home,
  Layers3,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createContentTypeAction,
  createHomeSectionAction,
  createPlacementAction,
  deleteContentTypeAction,
  deletePlacementAction,
  updateContentTypeAction,
  updateHomeSectionAction,
  updatePlacementAction,
  updateSiteSettingsAction,
} from "@/app/actions/cms";
import {
  createResourceAction,
  deleteResourceAction,
  updateResourceAction,
} from "@/app/actions/resources";
import { AdminToast } from "@/components/admin-toast";
import { CardShell } from "@/components/card-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { isAdminEmail } from "@/lib/auth-utils";
import { getAdminData } from "@/lib/data";
import type {
  ContentPlacement,
  ContentPlacementRelation,
  ContentType,
  HomeSection,
  Resource,
} from "@/lib/supabase";
import { getResourceSlug } from "@/lib/slug";

export const metadata = {
  title: "管理后台 | AI资源工作台",
};

type AdminPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusMessages: Record<string, string> = {
  "settings-saved": "网站设置已保存。",
  "settings-failed": "网站设置保存失败，请检查日志。",
  "home-section-created": "首页入口已新增。",
  "home-section-updated": "首页入口已保存。",
  "home-section-failed": "首页入口保存失败。",
  "home-section-missing": "首页入口缺少必填字段。",
  "content-type-created": "内容类型已新增。",
  "content-type-missing": "内容类型缺少名称或 slug。",
  "content-type-updated": "内容类型已保存。",
  "content-type-deleted": "内容类型已删除。",
  "content-type-failed": "内容类型保存失败。",
  "content-type-update-failed": "内容类型更新失败。",
  "content-type-delete-failed": "内容类型删除失败，可能仍有关联内容。",
  "placement-created": "发布位置已新增。",
  "placement-missing": "发布位置缺少必填字段。",
  "placement-updated": "发布位置已保存。",
  "placement-deleted": "发布位置已删除。",
  "placement-failed": "发布位置保存失败。",
  "placement-update-failed": "发布位置更新失败。",
  "placement-delete-failed": "发布位置删除失败，可能仍有关联内容。",
  "resource-created": "内容已发布到所选位置。",
  "resource-updated": "内容已保存。",
  "resource-deleted": "内容已删除。",
  "create-resource-failed": "内容创建失败，请检查必填项或数据库日志。",
  "resource-update-failed": "内容更新失败。",
  "resource-delete-failed": "内容删除失败。",
  "missing-resource-fields": "标题和简介为必填项。",
  "supabase-not-configured": "Supabase 尚未配置。",
};

const adminNav = [
  { label: "总览", href: "#dashboard" },
  { label: "内容发布", href: "#content-publish" },
  { label: "内容管理", href: "#content-management" },
  { label: "内容类型", href: "#content-types" },
  { label: "发布位置", href: "#placements" },
  { label: "首页管理", href: "#home-sections" },
  { label: "网站设置", href: "#site-settings" },
  { label: "用户内容", href: "#user-content" },
];

const sectionTypeLabels: Record<string, string> = {
  homepage_entry: "首页 Hero 下方核心入口区",
  homepage_direction: "首页方向模块",
  product_entry: "首页产品入口区",
  footer_nav: "Footer 导航区",
};

function fieldClass() {
  return "rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50";
}

function textareaClass() {
  return "rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300/50";
}

function getRelationIds(
  resourceId: string,
  relations: ContentPlacementRelation[],
) {
  return new Set(
    relations
      .filter((relation) => relation.resource_id === resourceId && relation.is_active)
      .map((relation) => relation.placement_id),
  );
}

function contentTypeName(types: ContentType[], id?: string | null) {
  return types.find((type) => type.id === id)?.name ?? "未选择类型";
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
      {placements.map((placement) => (
        <label
          key={placement.id}
          className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"
        >
          <input
            name="placement_ids"
            type="checkbox"
            value={placement.id}
            defaultChecked={selectedIds?.has(placement.id)}
            className="mt-1 size-4 accent-cyan-300"
          />
          <span>
            <span className="block font-medium text-white">{placement.name}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {placement.page_path} · {placement.placement_key}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

function ResourceFields({
  resource,
  contentTypes,
  placements,
  selectedIds,
}: {
  resource?: Resource;
  contentTypes: ContentType[];
  placements: ContentPlacement[];
  selectedIds?: Set<string>;
}) {
  return (
    <div className="grid gap-5">
      {resource ? <input type="hidden" name="id" defaultValue={resource.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          标题 <span className="text-xs text-cyan-200">必填</span>
          <input
            name="title"
            required
            defaultValue={resource?.title ?? ""}
            placeholder="例如：ChatGPT 官方入口与基础用法"
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          Slug
          <input
            name="slug"
            defaultValue={resource?.slug ?? ""}
            placeholder="可留空自动生成"
            className={fieldClass()}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-slate-300">
          内容类型
          <select
            name="content_type_id"
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
          <span className="text-xs leading-5 text-slate-500">
            选项来自 content_types，可在后台增删改停用。
          </span>
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          分类
          <input
            name="category"
            defaultValue={resource?.category ?? ""}
            placeholder="例如：通用助手"
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          兼容资源类型
          <input
            name="resource_type"
            defaultValue={resource?.resource_type ?? "resource"}
            placeholder="保留旧逻辑兼容"
            className={fieldClass()}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-slate-300">
        发布位置
        <PlacementChecklist placements={placements} selectedIds={selectedIds} />
        <span className="text-xs leading-5 text-slate-500">
          一个内容可以同时发布到资源库、工具页、首页精选等多个位置。
        </span>
      </label>

      <label className="grid gap-2 text-sm text-slate-300">
        简介 <span className="text-xs text-cyan-200">必填</span>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={resource?.description ?? ""}
          placeholder="一句话说明这个内容解决什么问题。"
          className={textareaClass()}
        />
      </label>

      <label className="grid gap-2 text-sm text-slate-300">
        详细内容
        <textarea
          name="content"
          rows={6}
          defaultValue={resource?.content ?? ""}
          placeholder="教程正文、资源说明、使用步骤或评测内容。"
          className={textareaClass()}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          标签，英文逗号分隔
          <input
            name="tags"
            defaultValue={resource?.tags.join(",") ?? ""}
            placeholder="AI助手,写作,工作流"
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          封面图 URL
          <input
            name="cover_image_url"
            defaultValue={resource?.cover_image_url ?? ""}
            placeholder="第二阶段接 Supabase Storage"
            className={fieldClass()}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          适合人群
          <textarea
            name="target_audience"
            rows={3}
            defaultValue={resource?.target_audience ?? resource?.audience ?? ""}
            placeholder="例如：AI 新手、内容创作者、副业创业者"
            className={textareaClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          使用场景
          <textarea
            name="use_cases"
            rows={3}
            defaultValue={resource?.use_cases ?? ""}
            placeholder="例如：选题调研、脚本生成、资料总结"
            className={textareaClass()}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          优点
          <textarea
            name="pros"
            rows={3}
            defaultValue={resource?.pros ?? ""}
            className={textareaClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          缺点 / 注意事项
          <textarea
            name="cons"
            rows={3}
            defaultValue={resource?.cons ?? ""}
            className={textareaClass()}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          官方 / 来源链接
          <input
            name="official_url"
            type="url"
            defaultValue={resource?.official_url ?? resource?.source_url ?? ""}
            placeholder="官方介绍页、文档或来源"
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          下载 / 访问链接
          <input
            name="download_url"
            type="url"
            defaultValue={resource?.download_url ?? ""}
            placeholder="登录后展示的访问或下载链接"
            className={fieldClass()}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-slate-300">
          推荐指数
          <input
            name="rating"
            type="number"
            min="1"
            max="5"
            defaultValue={resource?.rating ?? 3}
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          新手友好度
          <input
            name="beginner_friendly_level"
            type="number"
            min="1"
            max="5"
            defaultValue={resource?.beginner_friendly_level ?? 3}
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          排序权重
          <input
            name="sort_order"
            type="number"
            defaultValue={resource?.sort_order ?? 100}
            className={fieldClass()}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          SEO 标题
          <input
            name="seo_title"
            defaultValue={resource?.seo_title ?? ""}
            className={fieldClass()}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-slate-300">
        SEO 描述
        <textarea
          name="seo_description"
          rows={2}
          defaultValue={resource?.seo_description ?? ""}
          className={textareaClass()}
        />
      </label>

      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
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
  );
}

function TypeManager({ contentTypes }: { contentTypes: ContentType[] }) {
  return (
    <CardShell id="content-types" className="p-5 scroll-mt-24">
      <SectionTitle
        icon={<Layers3 size={18} />}
        title="内容类型管理"
        description="内容类型来自 content_types，发布内容时的下拉选项不再写死在代码里。"
      />
      <form action={createContentTypeAction} className="mt-5 grid gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">新增内容类型</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <input name="name" required placeholder="名称" className={fieldClass()} />
          <input name="slug" required placeholder="slug" className={fieldClass()} />
          <input name="icon" placeholder="图标名" className={fieldClass()} />
          <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
            启用
          </label>
        </div>
        <textarea name="description" rows={2} placeholder="类型说明" className={textareaClass()} />
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          新增类型
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {contentTypes.map((type) => (
          <div key={type.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <form action={updateContentTypeAction} className="grid gap-3">
              <input type="hidden" name="id" defaultValue={type.id} />
              <div className="grid gap-3 md:grid-cols-5">
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
                <button className="rounded-md border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-semibold text-cyan-100">
                  保存类型
                </button>
              </div>
            </form>
            <form action={deleteContentTypeAction} className="mt-2">
              <input type="hidden" name="id" defaultValue={type.id} />
              <ConfirmSubmitButton
                message={`确认删除内容类型“${type.name}”？如果已有内容关联，数据库会拒绝删除。`}
                className="rounded-md border border-pink-300/30 bg-pink-300/8 px-4 py-2 text-sm font-semibold text-pink-100"
              >
                删除类型
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function PlacementManager({ placements }: { placements: ContentPlacement[] }) {
  return (
    <CardShell id="placements" className="p-5 scroll-mt-24">
      <SectionTitle
        icon={<Flag size={18} />}
        title="发布位置管理"
        description="发布位置决定内容会出现在哪个前台页面或模块，管理员发布内容时可以多选。"
      />
      <form action={createPlacementAction} className="mt-5 grid gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">新增发布位置</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <input name="name" required placeholder="名称" className={fieldClass()} />
          <input name="slug" required placeholder="slug" className={fieldClass()} />
          <input name="page_path" required placeholder="/resources" className={fieldClass()} />
          <input name="placement_key" required placeholder="resources" className={fieldClass()} />
          <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
        </div>
        <textarea name="description" rows={2} placeholder="这个位置对应哪个前端页面或模块" className={textareaClass()} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
          启用
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          新增位置
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {placements.map((placement) => (
          <div key={placement.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <form action={updatePlacementAction} className="grid gap-3">
              <input type="hidden" name="id" defaultValue={placement.id} />
              <div className="grid gap-3 md:grid-cols-5">
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
                <button className="rounded-md border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-semibold text-cyan-100">
                  保存位置
                </button>
              </div>
            </form>
            <form action={deletePlacementAction} className="mt-2">
              <input type="hidden" name="id" defaultValue={placement.id} />
              <ConfirmSubmitButton
                message={`确认删除发布位置“${placement.name}”？如果已有内容关联，数据库会拒绝删除。`}
                className="rounded-md border border-pink-300/30 bg-pink-300/8 px-4 py-2 text-sm font-semibold text-pink-100"
              >
                删除位置
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function HomeSectionManager({ homeSections }: { homeSections: HomeSection[] }) {
  return (
    <CardShell id="home-sections" className="p-5 scroll-mt-24">
      <SectionTitle
        icon={<Home size={18} />}
        title="首页入口管理"
        description="这里管理首页入口卡片。section_type 会显示成具体前台区域，避免不知道入口出现在哪里。"
      />
      <form action={createHomeSectionAction} className="mt-5 grid gap-4 rounded-md border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">新增入口</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="title" required placeholder="标题" className={fieldClass()} />
          <input name="href" required placeholder="/tools" className={fieldClass()} />
          <input name="badge" placeholder="Badge" className={fieldClass()} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="icon" placeholder="Wrench / Route / Workflow" className={fieldClass()} />
          <input name="sort_order" type="number" defaultValue="100" className={fieldClass()} />
          <select name="section_type" defaultValue="homepage_entry" className={fieldClass()}>
            {Object.entries(sectionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <textarea name="description" required rows={2} placeholder="入口说明" className={textareaClass()} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input name="is_active" type="checkbox" defaultChecked className="size-4 accent-cyan-300" />
          显示在首页
        </label>
        <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
          新增入口
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {homeSections.map((section) => (
          <form key={section.id} action={updateHomeSectionAction} className="grid gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4">
            <input type="hidden" name="id" defaultValue={section.id} />
            <div className="grid gap-3 md:grid-cols-4">
              <input name="title" defaultValue={section.title} className={fieldClass()} />
              <input name="href" defaultValue={section.href} className={fieldClass()} />
              <input name="badge" defaultValue={section.badge ?? ""} className={fieldClass()} />
              <input name="sort_order" type="number" defaultValue={section.sort_order} className={fieldClass()} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input name="icon" defaultValue={section.icon ?? ""} className={fieldClass()} />
              <select name="section_type" defaultValue={section.section_type} className={fieldClass()}>
                {Object.entries(sectionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input name="image_url" defaultValue={section.image_url ?? ""} placeholder="图片 URL" className={fieldClass()} />
            </div>
            <p className="text-xs text-cyan-100">
              前台显示位置：{sectionTypeLabels[section.section_type] ?? section.section_type}
            </p>
            <textarea name="description" rows={2} defaultValue={section.description} className={textareaClass()} />
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input name="is_active" type="checkbox" defaultChecked={section.is_active} className="size-4 accent-cyan-300" />
                首页显示
              </label>
              <button className="rounded-md border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-semibold text-cyan-100">
                保存入口
              </button>
            </div>
          </form>
        ))}
        {homeSections.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
            暂无首页入口。后台不配置时，前台核心入口区会显示空状态。
          </p>
        ) : null}
      </div>
    </CardShell>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const status = params?.status;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
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
    contentTypes,
    contentPlacements,
    placementRelations,
  } = await getAdminData();
  const activeTypes = contentTypes.filter((type) => type.is_active);
  const activePlacements = contentPlacements.filter((placement) => placement.is_active);

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />
      {status && statusMessages[status] ? <AdminToast message={statusMessages[status]} /> : null}

      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            CMS ADMIN
          </p>
          <h1 className="text-3xl font-semibold text-white">内容管理后台</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            后台配置内容类型与发布位置，管理员发布内容时选择对应位置；前台只展示已发布、已关联位置的内容。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {adminNav.map((item) => (
              <a key={item.href} href={item.href} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-100">
                {item.label}
              </a>
            ))}
          </div>
        </CardShell>

        {!configured ? (
          <CardShell glow="pink">
            <h2 className="text-lg font-semibold text-white">Supabase 尚未配置</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              请先在 Vercel 配置 Supabase 环境变量，并执行最新 migration SQL。
            </p>
          </CardShell>
        ) : null}

        <section id="dashboard" className="scroll-mt-24 grid gap-4 md:grid-cols-4">
          <CardShell><UsersRound className="mb-4 text-cyan-200" size={22} /><p className="font-mono text-2xl text-white">{users.length}</p><p className="mt-1 text-sm text-slate-400">用户</p></CardShell>
          <CardShell><FilePlus2 className="mb-4 text-cyan-200" size={22} /><p className="font-mono text-2xl text-white">{resources.length}</p><p className="mt-1 text-sm text-slate-400">内容</p></CardShell>
          <CardShell><Boxes className="mb-4 text-cyan-200" size={22} /><p className="font-mono text-2xl text-white">{contentTypes.length}</p><p className="mt-1 text-sm text-slate-400">内容类型</p></CardShell>
          <CardShell><BarChart3 className="mb-4 text-cyan-200" size={22} /><p className="font-mono text-2xl text-white">{downloads.length}</p><p className="mt-1 text-sm text-slate-400">下载记录</p></CardShell>
        </section>

        <CardShell id="content-publish" className="p-5 scroll-mt-24">
          <SectionTitle
            icon={<FilePlus2 size={18} />}
            title="内容发布"
            description="发布内容时选择内容类型和多个发布位置。只有已发布内容会进入前台。"
          />
          <form action={createResourceAction} className="mt-5">
            <ResourceFields contentTypes={activeTypes} placements={activePlacements} />
            <button className="mt-5 rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
              保存并发布内容
            </button>
          </form>
        </CardShell>

        <CardShell id="content-management" className="p-5 scroll-mt-24">
          <SectionTitle
            icon={<FolderKanban size={18} />}
            title="内容管理"
            description="这里可以编辑、删除、发布、下架、设置推荐/热门和修改前台发布位置。"
          />
          <div className="mt-5 space-y-4">
            {resources.map((resource) => {
              const selectedIds = getRelationIds(resource.id, placementRelations);
              return (
                <details key={resource.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-white">{resource.title}</h3>
                          <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">{contentTypeName(contentTypes, resource.content_type_id)}</span>
                          <span className={resource.is_published ? "rounded-md bg-emerald-300/8 px-2 py-1 text-xs text-emerald-100" : "rounded-md bg-slate-300/8 px-2 py-1 text-xs text-slate-400"}>
                            {resource.is_published ? "已发布" : "草稿/下架"}
                          </span>
                          {resource.is_featured ? <span className="rounded-md bg-amber-300/8 px-2 py-1 text-xs text-amber-100">推荐</span> : null}
                          {resource.is_hot ? <span className="rounded-md bg-pink-300/8 px-2 py-1 text-xs text-pink-100">热门</span> : null}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{resource.description}</p>
                      </div>
                      <Link href={`/resources/${getResourceSlug(resource)}`} className="text-sm text-cyan-100 hover:text-cyan-50">
                        前台预览
                      </Link>
                    </div>
                  </summary>
                  <form action={updateResourceAction} className="mt-5 border-t border-white/10 pt-5">
                    <ResourceFields
                      resource={resource}
                      contentTypes={activeTypes}
                      placements={activePlacements}
                      selectedIds={selectedIds}
                    />
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button className="rounded-md border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-semibold text-cyan-100">
                        保存内容
                      </button>
                    </div>
                  </form>
                  <form action={deleteResourceAction} className="mt-3">
                    <input type="hidden" name="id" defaultValue={resource.id} />
                    <ConfirmSubmitButton
                      message={`确认删除内容“${resource.title}”？删除后前台不再显示。`}
                      className="rounded-md border border-pink-300/30 bg-pink-300/8 px-4 py-2 text-sm font-semibold text-pink-100"
                    >
                      删除内容
                    </ConfirmSubmitButton>
                  </form>
                </details>
              );
            })}
            {resources.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
                暂无内容。请先在“内容发布”新增第一条内容。
              </p>
            ) : null}
          </div>
        </CardShell>

        <TypeManager contentTypes={contentTypes} />
        <PlacementManager placements={contentPlacements} />
        <HomeSectionManager homeSections={homeSections} />

        <CardShell id="site-settings" className="p-5 scroll-mt-24">
          <SectionTitle
            icon={<Settings2 size={18} />}
            title="网站设置"
            description="首页 Hero、SEO、品牌名和 Footer 简介从 site_settings 读取。"
          />
          <form action={updateSiteSettingsAction} className="mt-5 grid gap-4">
            <input type="hidden" name="id" defaultValue={settings.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <input name="brand_name" defaultValue={settings.brand_name} placeholder="品牌名" className={fieldClass()} />
              <input name="site_tagline" defaultValue={settings.site_tagline} placeholder="网站定位" className={fieldClass()} />
              <input name="hero_title" defaultValue={settings.hero_title} placeholder="首页主标题" className={fieldClass()} />
              <input name="hero_subtitle" defaultValue={settings.hero_subtitle} placeholder="首页副标题" className={fieldClass()} />
              <input name="primary_cta_text" defaultValue={settings.primary_cta_text} placeholder="主按钮文字" className={fieldClass()} />
              <input name="primary_cta_href" defaultValue={settings.primary_cta_href} placeholder="主按钮链接" className={fieldClass()} />
              <input name="secondary_cta_text" defaultValue={settings.secondary_cta_text} placeholder="次按钮文字" className={fieldClass()} />
              <input name="secondary_cta_href" defaultValue={settings.secondary_cta_href} placeholder="次按钮链接" className={fieldClass()} />
              <input name="seo_title" defaultValue={settings.seo_title} placeholder="首页 SEO 标题" className={fieldClass()} />
              <input name="homepage_featured_title" defaultValue={settings.homepage_featured_title} placeholder="精选区标题" className={fieldClass()} />
            </div>
            <textarea name="hero_description" rows={3} defaultValue={settings.hero_description} placeholder="首页描述" className={textareaClass()} />
            <textarea name="seo_description" rows={2} defaultValue={settings.seo_description} placeholder="首页 SEO 描述" className={textareaClass()} />
            <textarea name="footer_description" rows={2} defaultValue={settings.footer_description} placeholder="Footer 简介" className={textareaClass()} />
            <textarea name="homepage_featured_description" rows={2} defaultValue={settings.homepage_featured_description} placeholder="精选区描述" className={textareaClass()} />
            <button className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">
              保存网站设置
            </button>
          </form>
        </CardShell>

        <CardShell id="user-content" className="p-5 scroll-mt-24">
          <SectionTitle
            icon={<ShieldCheck size={18} />}
            title="用户内容管理"
            description="当前没有投稿、评论、反馈表，不做假数据。这里预留审核、隐藏、删除、标记已处理的后台入口。"
          />
          <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-500">
            第二阶段如新增 user_submissions、comments、feedbacks，管理员可在这里查看、审核通过、审核拒绝、隐藏或删除；普通用户只允许管理自己提交的内容。
          </p>
        </CardShell>
      </div>
    </main>
  );
}

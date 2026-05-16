import type { Session } from "next-auth";
import {
  getSupabaseServiceClient,
  isSupabaseConfigured,
  type ContentPage,
  type ContentPlacement,
  type ContentPlacementRelation,
  type ContentType,
  type DbUser,
  type Download,
  type Favorite,
  type HomeSection,
  type HomeSectionWithPage,
  type Resource,
  type SiteSettings,
  type TaxonomyTerm,
  type UserSubmission,
} from "@/lib/supabase";
import { isAdminEmail } from "@/lib/auth-utils";
import { getResourceSlug } from "@/lib/slug";

export type ResourceWithState = Resource & {
  isFavorite: boolean;
};

export type ResourceWithPlacements = Resource & {
  placementIds: string[];
};

export type ActivityItem = {
  id: string;
  created_at: string;
  resource: Resource | null;
};

export type SubmissionWithUser = UserSubmission & {
  user?: DbUser | null;
};

export const defaultSiteSettings: SiteSettings = {
  id: "default",
  hero_title: "AI 产品实验室与资源工作台",
  hero_subtitle: "海外 AI 资源筛选、AI 工具库、工程数字化与 TikTok 商业运营内容中心",
  hero_description:
    "这里会持续沉淀可落地的 AI 工具、工作流、教程和未来 SaaS 实验入口，面向内容创作者、AI 工具玩家、副业创业者和工程数字化实践者。",
  primary_cta_text: "进入 AI 资源库",
  primary_cta_href: "/resources",
  secondary_cta_text: "查看新手路线",
  secondary_cta_href: "/roadmap",
  site_tagline: "AI + 工程数字化 + TikTok 商业运营 + SaaS 实验",
  seo_title: "AI资源工作台 | 海外AI工具筛选与AI工作流教程",
  seo_description:
    "面向普通人、内容创作者、AI工具玩家和副业创业者的海外 AI 资源筛选、AI 工具库与 AI 工作流分享站。",
  brand_name: "AI资源工作台",
  footer_description:
    "一个面向 AI 工具、工程数字化、TikTok 运营和未来 SaaS 产品的个人品牌内容平台。",
  homepage_featured_title: "精选资源与工作流",
  homepage_featured_description:
    "优先展示经过筛选、适合上手、能服务真实工作流的资源与内容。",
  show_homepage_featured: false,
  show_homepage_hot: true,
  show_homepage_latest: true,
  hero_panel_eyebrow: "RESOURCE OS",
  hero_panel_description: "围绕 AI 工具、工作流和教程沉淀可复用资源。",
  hero_panel_stat_1_label: "入口",
  hero_panel_stat_2_label: "精选",
  hero_panel_stat_3_label: "教程",
  created_at: "",
  updated_at: "",
};

export const defaultHomeSections: HomeSection[] = [
  {
    id: "tools",
    title: "AI 工具库",
    description: "按场景筛选海外 AI 工具，关注可用性、门槛、价格与替代方案。",
    href: "/tools",
    icon: "Wrench",
    badge: "Tool Library",
    sort_order: 10,
    is_active: true,
    section_type: "homepage_entry",
    image_url: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "workflows",
    title: "AI 工作流",
    description: "沉淀从选题、资料、生成、自动化到发布的可复用流程。",
    href: "/workflows",
    icon: "Workflow",
    badge: "Workflow",
    sort_order: 20,
    is_active: true,
    section_type: "homepage_entry",
    image_url: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "roadmap",
    title: "AI 新手路线",
    description: "把 AI 学习路径拆成通用助手、搜索研究、知识库、创作工具和自动化几个阶段。",
    href: "/roadmap",
    icon: "Route",
    badge: "Roadmap",
    sort_order: 30,
    is_active: true,
    section_type: "homepage_entry",
    image_url: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "tutorials",
    title: "AI 教程",
    description: "后续用于发布长文教程、操作指南、工具评测和实战案例。",
    href: "/tutorials",
    icon: "BookOpenText",
    badge: "Tutorial",
    sort_order: 40,
    is_active: true,
    section_type: "homepage_entry",
    image_url: null,
    created_at: "",
    updated_at: "",
  },
];

export const defaultContentPages: ContentPage[] = [
  {
    id: "resources",
    title: "综合资源",
    slug: "resources",
    page_path: "/resources",
    description: "海外 AI 工具、教程、工作流和资源入口的总索引。",
    hero_title: "综合资源",
    hero_subtitle: "CURATED AI RESOURCE LIBRARY",
    hero_description:
      "这里不是简单堆链接，而是按普通人、内容创作者、AI 工具玩家和副业创业者的真实场景，筛选可上手的 AI 工具、知识库、创作工具和工作流入口。",
    seo_title: "AI 资源库",
    seo_description:
      "收录海外 AI 工具、AI 搜索、知识库、图片视频生成、语音配音和工作流资源，适合普通人、创作者和副业创业者长期收藏。",
    empty_state_title: "综合资源正在整理中",
    empty_state_description:
      "管理员可以进入后台“内容发布”，选择发布位置“资源库”后，这里会自动展示。",
    primary_cta_text: "发布资源",
    primary_cta_href: "/admin?section=content-publish",
    placement_slug: "resources",
    home_section_id: null,
    sort_order: 10,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "tools",
    title: "AI 工具库",
    slug: "tools",
    page_path: "/tools",
    description: "从资源库中以工具视角筛选可用的海外 AI 工具。",
    hero_title: "AI 工具库",
    hero_subtitle: "AI TOOL LIBRARY",
    hero_description:
      "这是资源库的工具视角，优先筛选通用助手、AI 搜索、知识库、设计、图片、视频、音频和开发类工具。",
    seo_title: "AI 工具库",
    seo_description:
      "从资源库中按工具视角筛选可用的海外 AI 工具、创作工具、搜索工具和开发资源。",
    empty_state_title: "工具内容暂无发布",
    empty_state_description:
      "在后台新增内容，并选择发布位置“AI工具页”后，这里会自动展示。",
    primary_cta_text: "进入资源库",
    primary_cta_href: "/resources",
    placement_slug: "tools",
    home_section_id: null,
    sort_order: 20,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "workflows",
    title: "AI 工作流",
    slug: "workflows",
    page_path: "/workflows",
    description: "沉淀 AI 内容创作、资料整理、自动化发布和工程数字化的可复用工作流。",
    hero_title: "AI 工作流",
    hero_subtitle: "WORKFLOWS",
    hero_description:
      "这里展示后台发布到“工作流页”的内容，用来沉淀可复用的 AI 内容生产、资料整理、自动化和工程数字化流程。",
    seo_title: "AI 工作流",
    seo_description:
      "沉淀 AI 内容创作、资料整理、自动化发布和工程数字化的可复用工作流。",
    empty_state_title: "工作流内容正在搭建",
    empty_state_description:
      "在后台新增内容，并选择发布位置“工作流页”后，这里会自动展示。",
    primary_cta_text: "发布工作流",
    primary_cta_href: "/admin?section=content-publish",
    placement_slug: "workflows",
    home_section_id: null,
    sort_order: 30,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "tutorials",
    title: "AI 教程",
    slug: "tutorials",
    page_path: "/tutorials",
    description: "AI 工具教程、TikTok AI 运营、工程 AI 应用和产品化实验的内容入口。",
    hero_title: "AI 教程",
    hero_subtitle: "TUTORIALS",
    hero_description:
      "这里展示后台发布到“教程页”的内容，后续可扩展为文章、视频、附件和工作流步骤混合的 CMS 内容页。",
    seo_title: "AI 教程",
    seo_description:
      "AI 工具教程、TikTok AI 运营、工程 AI 应用和产品化实验的内容入口。",
    empty_state_title: "教程内容正在搭建",
    empty_state_description:
      "在后台新增内容，并选择发布位置“教程页”后，这里会自动展示。",
    primary_cta_text: "发布教程",
    primary_cta_href: "/admin?section=content-publish",
    placement_slug: "tutorials",
    home_section_id: null,
    sort_order: 40,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "roadmap",
    title: "AI 新手路线",
    slug: "roadmap",
    page_path: "/roadmap",
    description: "面向 AI 新手、TikTok AI 运营、工程 AI 应用和未来 SaaS 实验的学习路线入口。",
    hero_title: "AI 新手路线",
    hero_subtitle: "ROADMAP",
    hero_description:
      "这个页面展示后台发布到“新手路线页”的内容，用来把 AI 学习和应用路径拆成可执行阶段。",
    seo_title: "AI 新手路线",
    seo_description:
      "面向 AI 新手、TikTok AI 运营、工程 AI 应用和未来 SaaS 实验的学习路线入口。",
    empty_state_title: "路线内容暂无发布",
    empty_state_description:
      "在后台新增内容，并选择发布位置“新手路线页”后，这里会自动展示。",
    primary_cta_text: "发布路线内容",
    primary_cta_href: "/admin?section=content-publish",
    placement_slug: "roadmap",
    home_section_id: null,
    sort_order: 50,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export async function getSiteSettings() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return defaultSiteSettings;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load site settings", error.message);
    return defaultSiteSettings;
  }

  if (!data) {
    return defaultSiteSettings;
  }

  return {
    ...defaultSiteSettings,
    ...data,
    show_homepage_featured:
      data.show_homepage_featured ?? defaultSiteSettings.show_homepage_featured,
    show_homepage_hot:
      data.show_homepage_hot ?? defaultSiteSettings.show_homepage_hot,
    show_homepage_latest:
      data.show_homepage_latest ?? defaultSiteSettings.show_homepage_latest,
  };
}

export async function getHomeSections(includeInactive = false) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as HomeSectionWithPage[];
  }

  let query = supabase
    .from("home_sections")
    .select("*")
    .eq("section_type", "homepage_entry")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data: sections, error } = await query;

  if (error) {
    console.error("Failed to load home sections", error.message);
    return [] as HomeSectionWithPage[];
  }

  if (!sections?.length) {
    return [] as HomeSectionWithPage[];
  }

  const sectionIds = sections.map((section) => section.id);
  const { data: pages, error: pagesError } = await supabase
    .from("content_pages")
    .select("home_section_id, page_path, title, is_active")
    .in("home_section_id", sectionIds);

  if (pagesError) {
    console.error("Failed to load linked content pages", pagesError.message);
  }

  const pageBySection = new Map(
    (pages ?? []).map((page) => [page.home_section_id, page]),
  );

  return sections.map((section) => {
    const linked = pageBySection.get(section.id);
    const linkedActive = linked?.is_active ?? false;

    return {
      ...section,
      linked_page_path:
        linked && (includeInactive || linkedActive) ? linked.page_path : null,
      linked_page_title:
        linked && (includeInactive || linkedActive) ? linked.title : null,
    };
  });
}

export async function getContentPages(includeInactive = false) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return defaultContentPages;
  }

  let query = supabase
    .from("content_pages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load content pages", error.message);
    return defaultContentPages.filter((page) => includeInactive || page.is_active);
  }

  return data?.length ? data : defaultContentPages;
}

export async function getContentPageBySlug(slug: string) {
  const pages = await getContentPages(true);
  return (
    pages.find((page) => page.slug === slug) ??
    defaultContentPages.find((page) => page.slug === slug) ??
    defaultContentPages[0]
  );
}

export async function getContentPageByPath(pagePath: string, includeInactive = false) {
  const normalizedPath = normalizeContentPagePath(pagePath);
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    const fallback = defaultContentPages.find(
      (page) =>
        normalizeContentPagePath(page.page_path) === normalizedPath &&
        (includeInactive || page.is_active),
    );
    return fallback ?? null;
  }

  const { data, error } = await supabase
    .from("content_pages")
    .select("*")
    .eq("page_path", normalizedPath)
    .maybeSingle();

  if (error) {
    console.error("Failed to load content page by path", error.message);
    return null;
  }

  if (!data || (!includeInactive && !data.is_active)) {
    return null;
  }

  return data;
}

export const HOME_PREVIEW_LIMIT = 4;

export function resolvePlacementMoreHref(
  placementSlug: string,
  contentPages: ContentPage[],
  placements: ContentPlacement[] = [],
) {
  const linkedPage = contentPages.find(
    (page) => page.placement_slug === placementSlug && page.is_active,
  );
  if (linkedPage?.page_path) {
    return linkedPage.page_path;
  }

  const placement = placements.find((item) => item.slug === placementSlug);
  const path = placement?.page_path?.trim();
  if (path && path !== "/") {
    return path;
  }

  return "/resources";
}

export function normalizeContentPagePath(pagePath: string) {
  const trimmedPath = pagePath.trim();
  if (!trimmedPath || trimmedPath === "/") {
    return "/";
  }

  return `/${trimmedPath.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export async function getContentTypes(includeInactive = false) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as ContentType[];
  }

  let query = supabase
    .from("content_types")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load content types", error.message);
    return [];
  }

  return data ?? [];
}

export async function getContentPlacements(includeInactive = false) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as ContentPlacement[];
  }

  let query = supabase
    .from("content_placements")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load content placements", error.message);
    return [];
  }

  return data ?? [];
}

export async function getPlacementRelations() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as ContentPlacementRelation[];
  }

  const { data, error } = await supabase
    .from("content_placement_relations")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load placement relations", error.message);
    return [];
  }

  return data ?? [];
}

export async function syncUserFromSession(
  sessionUser: Session["user"] | undefined,
  provider?: string,
  providerAccountId?: string,
) {
  const email = sessionUser?.email;
  const supabase = getSupabaseServiceClient();

  if (!email || !supabase) {
    return null;
  }

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("users")
      .update({
        name: sessionUser.name,
        avatar_url: sessionUser.image,
        provider: provider ?? existing.provider,
        provider_account_id: providerAccountId ?? existing.provider_account_id,
        role: isAdminEmail(email) ? "admin" : existing.role,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to sync user", error.message);
      return existing;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      name: sessionUser.name,
      avatar_url: sessionUser.image,
      provider,
      provider_account_id: providerAccountId,
      role: isAdminEmail(email) ? "admin" : "user",
      status: "active",
      can_submit: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to sync user", error.message);
    return null;
  }

  return data;
}

export async function getActiveTaxonomyTerms() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as TaxonomyTerm[];
  }

  const { data, error } = await supabase
    .from("taxonomy_terms")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load taxonomy terms", error.message);
    return [];
  }

  return data ?? [];
}

export async function getUserByEmail(email?: string | null) {
  const supabase = getSupabaseServiceClient();

  if (!email || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Failed to load user", error.message);
    return null;
  }

  return data;
}

export async function getOrCreateUser(sessionUser: Session["user"] | undefined) {
  const existing = await getUserByEmail(sessionUser?.email);
  if (!existing) {
    return syncUserFromSession(sessionUser);
  }

  if (isAdminEmail(existing.email) && existing.role !== "admin") {
    const supabase = getSupabaseServiceClient();
    await supabase?.from("users").update({ role: "admin" }).eq("id", existing.id);
    return { ...existing, role: "admin" as const };
  }

  return existing;
}

export async function getResourcesForUser(user?: DbUser | null) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      resources: [] as ResourceWithState[],
    };
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load resources", error.message);
    return { configured: isSupabaseConfigured(), resources: [] };
  }

  let favoriteIds = new Set<string>();

  if (user) {
    const { data: favorites, error: favoriteError } = await supabase
      .from("favorites")
      .select("resource_id")
      .eq("user_id", user.id);

    if (favoriteError) {
      console.error("Failed to load favorites", favoriteError.message);
    } else {
      favoriteIds = new Set(favorites?.map((item) => item.resource_id) ?? []);
    }
  }

  return {
    configured: true,
    resources: (data ?? []).map((resource) => ({
      ...resource,
      isFavorite: favoriteIds.has(resource.id),
    })),
  };
}

export async function getResourcesByPlacement(
  placementSlug: string,
  user?: DbUser | null,
) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as ResourceWithState[];
  }

  const { data: placement, error: placementError } = await supabase
    .from("content_placements")
    .select("*")
    .eq("slug", placementSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (placementError || !placement) {
    if (placementError) {
      console.error("Failed to load placement", placementError.message);
    }
    return [];
  }

  const { data: relations, error: relationError } = await supabase
    .from("content_placement_relations")
    .select("*")
    .eq("placement_id", placement.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (relationError) {
    console.error("Failed to load placement content", relationError.message);
    return [];
  }

  const resourceIds = relations?.map((item) => item.resource_id) ?? [];

  if (resourceIds.length === 0) {
    return [];
  }

  const { data: resources, error: resourceError } = await supabase
    .from("resources")
    .select("*")
    .in("id", resourceIds)
    .eq("is_published", true);

  if (resourceError) {
    console.error("Failed to load placement resources", resourceError.message);
    return [];
  }

  let favoriteIds = new Set<string>();

  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("resource_id")
      .eq("user_id", user.id);

    favoriteIds = new Set(favorites?.map((item) => item.resource_id) ?? []);
  }

  const sortMap = new Map(
    (relations ?? []).map((item) => [item.resource_id, item.sort_order]),
  );

  return (resources ?? [])
    .map((resource) => ({
      ...resource,
      isFavorite: favoriteIds.has(resource.id),
    }))
    .sort(
      (a, b) =>
        (sortMap.get(a.id) ?? a.sort_order) - (sortMap.get(b.id) ?? b.sort_order),
    );
}

export async function getResourcesByView(
  view: "tools" | "workflows" | "tutorials",
) {
  const placementSlug =
    view === "tools" ? "tools" : view === "workflows" ? "workflows" : "tutorials";
  return getResourcesByPlacement(placementSlug);
}

export async function getResourceById(id: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load resource", error.message);
    return null;
  }

  return data;
}

export async function getResourceBySlug(slug: string, user?: DbUser | null) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      resource: null as ResourceWithState | null,
      related: [] as Resource[],
    };
  }

  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load resource by slug", error.message);
    return { configured: true, resource: null, related: [] };
  }

  const resource =
    resources?.find((item) => getResourceSlug(item) === slug) ?? null;

  if (!resource) {
    return { configured: true, resource: null, related: [] };
  }

  let isFavorite = false;

  if (user) {
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resource.id)
      .maybeSingle();

    if (favoriteError) {
      console.error("Failed to load favorite state", favoriteError.message);
    } else {
      isFavorite = Boolean(favorite);
    }
  }

  const related = (resources ?? [])
    .filter(
      (item) => item.id !== resource.id && item.category === resource.category,
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return {
    configured: true,
    resource: { ...resource, isFavorite },
    related,
  };
}

export async function getAllResources() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as Resource[];
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load all resources", error.message);
    return [];
  }

  return data ?? [];
}

export async function getDashboardData(user: DbUser | null) {
  const supabase = getSupabaseServiceClient();

  if (!user || !supabase) {
    return {
      configured: Boolean(supabase),
      favorites: [] as ActivityItem[],
      downloads: [] as ActivityItem[],
      submissions: [] as UserSubmission[],
    };
  }

  const [{ data: favorites }, { data: downloads }, { data: submissions }] = await Promise.all([
    supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("downloads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const resourceIds = [
    ...new Set(
      [
        ...((favorites as Favorite[] | null)?.map((item) => item.resource_id) ??
          []),
        ...((downloads as Download[] | null)?.map((item) => item.resource_id) ??
          []),
      ].filter(Boolean),
    ),
  ];

  const resourceMap = new Map<string, Resource>();

  if (resourceIds.length > 0) {
    const { data: resources } = await supabase
      .from("resources")
      .select("*")
      .in("id", resourceIds);

    for (const resource of resources ?? []) {
      resourceMap.set(resource.id, resource);
    }
  }

  return {
    configured: true,
    favorites: ((favorites as Favorite[] | null) ?? []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      resource: resourceMap.get(item.resource_id) ?? null,
    })),
    downloads: ((downloads as Download[] | null) ?? []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      resource: resourceMap.get(item.resource_id) ?? null,
    })),
    submissions: (submissions as UserSubmission[] | null) ?? [],
  };
}

export async function getAdminData() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      users: [] as DbUser[],
      resources: [] as Resource[],
      downloads: [] as Download[],
      settings: defaultSiteSettings,
      homeSections: [] as HomeSection[],
      contentPages: [] as ContentPage[],
      contentTypes: [] as ContentType[],
      contentPlacements: [] as ContentPlacement[],
      placementRelations: [] as ContentPlacementRelation[],
      taxonomyTerms: [] as TaxonomyTerm[],
      submissions: [] as SubmissionWithUser[],
    };
  }

  const [
    { data: users },
    { data: resources },
    { data: downloads },
    { data: settings },
    { data: homeSections },
    { data: contentPages, error: contentPagesError },
    { data: contentTypes },
    { data: contentPlacements },
    { data: placementRelations },
    { data: taxonomyTerms, error: taxonomyTermsError },
    { data: submissions },
  ] = await Promise.all([
    supabase.from("users").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("resources").select("*").order("published_at", {
      ascending: false,
    }),
    supabase.from("downloads").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    supabase.from("home_sections").select("*").order("sort_order", {
      ascending: true,
    }),
    supabase.from("content_pages").select("*").order("sort_order", {
      ascending: true,
    }),
    supabase.from("content_types").select("*").order("sort_order", {
      ascending: true,
    }),
    supabase.from("content_placements").select("*").order("sort_order", {
      ascending: true,
    }),
    supabase
      .from("content_placement_relations")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("taxonomy_terms").select("*").order("sort_order", {
      ascending: true,
    }),
    supabase
      .from("user_submissions")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const userMap = new Map((users ?? []).map((user) => [user.id, user]));

  return {
    configured: true,
    users: users ?? [],
    resources: resources ?? [],
    downloads: downloads ?? [],
    settings: settings ? { ...defaultSiteSettings, ...settings } : defaultSiteSettings,
    homeSections: homeSections ?? [],
    contentPages: contentPagesError ? defaultContentPages : (contentPages ?? []),
    contentTypes: contentTypes ?? [],
    contentPlacements: contentPlacements ?? [],
    placementRelations: placementRelations ?? [],
    taxonomyTerms: taxonomyTermsError ? [] : (taxonomyTerms ?? []),
    submissions: ((submissions as UserSubmission[] | null) ?? []).map((submission) => ({
      ...submission,
      user: userMap.get(submission.user_id) ?? null,
    })),
  };
}

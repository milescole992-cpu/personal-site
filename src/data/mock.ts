import {
  Archive,
  BookOpenText,
  Boxes,
  Code2,
  Compass,
  Cpu,
  FileText,
  GalleryHorizontalEnd,
  ImageIcon,
  Layers3,
  MessageCircle,
  Rocket,
  ScanSearch,
  Shield,
  Sparkles,
  TerminalSquare,
  Wrench,
  Zap,
} from "lucide-react";

export const navItems = [
  { label: "首页", href: "#" },
  { label: "文章", href: "#" },
  { label: "工具", href: "#" },
  { label: "项目", href: "#" },
  { label: "关于", href: "#" },
];

export const recommendedLinks = [
  {
    title: "示例入口 01",
    description: "用于放置常用页面、项目集合或长期维护的内容入口。",
    href: "#",
    icon: Rocket,
    accent: "cyan",
  },
  {
    title: "示例入口 02",
    description: "适合作为工具箱、资源导航或作品展示的快捷入口。",
    href: "#",
    icon: Compass,
    accent: "violet",
  },
  {
    title: "示例入口 03",
    description: "后期可以替换为你的专题页、学习路线或个人履历。",
    href: "#",
    icon: Sparkles,
    accent: "pink",
  },
  {
    title: "示例入口 04",
    description: "预留给在线小工具、收藏夹或实验性作品。",
    href: "#",
    icon: Boxes,
    accent: "emerald",
  },
];

export const latestArticles = Array.from({ length: 7 }, (_, index) => ({
  id: `latest-${index + 1}`,
  title: `示例文章标题 ${String(index + 1).padStart(2, "0")}`,
  category: ["编程", "AI", "工具", "生活", "项目", "随记", "设计"][index],
  excerpt: "这里是文章摘要占位，用于展示一段简短介绍，后期替换为真实内容。",
  date: `2026-05-${String(14 - index).padStart(2, "0")}`,
  readTime: `${4 + index} 分钟`,
  views: `${(index + 2) * 321}`,
}));

export const hotArticles = Array.from({ length: 6 }, (_, index) => ({
  id: `hot-${index + 1}`,
  title: `热门示例文章 ${String(index + 1).padStart(2, "0")}`,
  category: ["工具", "编程", "AI", "项目", "生活", "效率"][index],
  views: `${(index + 4) * 1280}`,
  date: `05/${String(14 - index).padStart(2, "0")}`,
}));

export const tools = [
  { name: "示例工具 01", description: "文本处理", icon: TerminalSquare },
  { name: "示例工具 02", description: "图片压缩", icon: ImageIcon },
  { name: "示例工具 03", description: "代码片段", icon: Code2 },
  { name: "示例工具 04", description: "资源检索", icon: ScanSearch },
  { name: "示例工具 05", description: "安全检查", icon: Shield },
  { name: "示例工具 06", description: "效率面板", icon: Zap },
  { name: "示例工具 07", description: "归档索引", icon: Archive },
  { name: "示例工具 08", description: "灵感画廊", icon: GalleryHorizontalEnd },
];

export const tags = [
  "AI",
  "工具",
  "编程",
  "生活",
  "项目",
  "前端",
  "Next.js",
  "效率",
  "设计",
  "笔记",
  "开源",
  "阅读",
  "极客",
  "二次元",
  "赛博",
  "导航",
];

export const stats = [
  { label: "文章数", value: "000", icon: FileText },
  { label: "工具数", value: "000", icon: Wrench },
  { label: "标签数", value: "000", icon: Layers3 },
  { label: "评论数", value: "000", icon: MessageCircle },
];

export const profileLinks = [
  { label: "文章归档", icon: BookOpenText },
  { label: "工具导航", icon: Cpu },
  { label: "项目展示", icon: Rocket },
];

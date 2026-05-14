export const siteUrl = "https://personal-site-jet-zeta.vercel.app";

export const siteName = "AI资源工作台";

export const siteDescription =
  "面向普通人、内容创作者、AI工具玩家和副业创业者的海外 AI 资源筛选、AI 工具库与 AI 工作流分享站。";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

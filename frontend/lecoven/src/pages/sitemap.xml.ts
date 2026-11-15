import type { APIRoute } from "astro";
import { eventHref, getEvents } from "../lib/events";

export const prerender = true;

const staticPaths = [
  "/", "/le-coven", "/collectifs", "/partenaires", "/events",
  "/blue-moon", "/contact", "/mentions-legales",
];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  })[character]!);
}

export const GET: APIRoute = async () => {
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL || "https://lecoven.fr").replace(/\/$/, "");
  const events = await getEvents();
  const paths = [...staticPaths, ...events.map(eventHref)];
  const urls = paths.map(path => `  <url><loc>${escapeXml(new URL(path, `${siteUrl}/`).href)}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

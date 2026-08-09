/**
 * Post-build SEO for GitHub Pages + CRA SPA.
 *
 * 1. Rewrites meta/canonical on each route's HTML shell
 * 2. Writes build/<route>/index.html so deep links return HTTP 200
 *    (instead of GitHub Pages serving 404.html)
 * 3. Writes build/sitemap.xml from src/seo.json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const SEO = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "seo.json"), "utf8")
);

function absoluteUrl(routePath) {
  if (routePath === "/") return `${SEO.siteUrl}/`;
  return `${SEO.siteUrl}${routePath}`;
}

function replaceAttr(html, attrPattern, value) {
  const re = new RegExp(attrPattern, "i");
  if (!re.test(html)) {
    console.warn(`Meta pattern not found: ${attrPattern}`);
    return html;
  }
  // Groups: (prefix)(oldValue)(suffix)
  return html.replace(re, (_, prefix, _old, suffix) => `${prefix}${value}${suffix}`);
}

function upsertCanonical(html, url) {
  if (/rel=["']canonical["']/i.test(html)) {
    return html.replace(
      /(<link[^>]*rel=["']canonical["'][^>]*href=["'])([^"']*)(["'][^>]*>)/i,
      `$1${url}$3`
    );
  }
  return html.replace(/<\/head>/i, `  <link rel="canonical" href="${url}" />\n</head>`);
}

function upsertJsonLd(html, route) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: SEO.siteName,
    alternateName: "NUS Palette Lab",
    url: SEO.siteUrl,
    description: route.description,
    image: SEO.defaultImage,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "National University of Singapore",
      url: "https://www.nus.edu.sg/",
    },
  };
  const tag = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  if (/application\/ld\+json/i.test(html)) {
    return html.replace(
      /<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i,
      tag
    );
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function applyRouteMeta(html, route) {
  const url = absoluteUrl(route.path);
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${route.title}</title>`);
  out = replaceAttr(
    out,
    `(<meta\\s+name=["']description["']\\s+content=["'])([^"']*)(["'])`,
    route.description
  );
  out = replaceAttr(
    out,
    `(<meta\\s+itemprop=["']name["']\\s+content=["'])([^"']*)(["'])`,
    SEO.siteName
  );
  out = replaceAttr(
    out,
    `(<meta\\s+itemprop=["']description["']\\s+content=["'])([^"']*)(["'])`,
    route.description
  );
  out = replaceAttr(
    out,
    `(<meta\\s+property=["']og:url["']\\s+content=["'])([^"']*)(["'])`,
    url
  );
  out = replaceAttr(
    out,
    `(<meta\\s+property=["']og:title["']\\s+content=["'])([^"']*)(["'])`,
    route.title
  );
  out = replaceAttr(
    out,
    `(<meta\\s+property=["']og:description["']\\s+content=["'])([^"']*)(["'])`,
    route.description
  );
  out = replaceAttr(
    out,
    `(<meta\\s+property=["']og:image["']\\s+content=["'])([^"']*)(["'])`,
    SEO.defaultImage
  );
  out = replaceAttr(
    out,
    `(<meta\\s+name=["']twitter:title["']\\s+content=["'])([^"']*)(["'])`,
    route.title
  );
  out = replaceAttr(
    out,
    `(<meta\\s+name=["']twitter:description["']\\s+content=["'])([^"']*)(["'])`,
    route.description
  );
  out = replaceAttr(
    out,
    `(<meta\\s+name=["']twitter:image["']\\s+content=["'])([^"']*)(["'])`,
    SEO.defaultImage
  );

  out = upsertCanonical(out, url);

  if (route.path === "/") {
    out = upsertJsonLd(out, route);
  }

  return out;
}

function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = SEO.routes
    .map((route) => {
      const loc = absoluteUrl(route.path);
      const priority = route.path === "/" ? "1.0" : "0.8";
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(path.join(BUILD, "sitemap.xml"), xml);
  console.log("Wrote build/sitemap.xml");
}

function main() {
  const indexPath = path.join(BUILD, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("build/index.html not found. Run this after npm run build.");
    process.exit(1);
  }

  const template = fs.readFileSync(indexPath, "utf8");

  for (const route of SEO.routes) {
    const html = applyRouteMeta(template, route);
    if (route.path === "/") {
      fs.writeFileSync(indexPath, html);
      console.log("Updated build/index.html meta");
      continue;
    }

    const dir = path.join(BUILD, route.path.replace(/^\//, ""));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`Wrote build${route.path}/index.html`);
  }

  writeSitemap();
}

main();

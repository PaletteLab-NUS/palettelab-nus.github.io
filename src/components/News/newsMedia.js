const newsImages = require.context(
  "../../assets/events",
  false,
  /\.(png|jpe?g|webp|gif)$/i
);

function resolveLocalPhoto(path) {
  if (!path) return null;

  try {
    return newsImages(`./${path}`);
  } catch (e) {
    console.warn(`News photo not found: ${path}`);
    return null;
  }
}

function normalizePhotoItem(item, index) {
  if (typeof item === "string") {
    return {
      id: `photo-${index}`,
      src: resolveLocalPhoto(item),
      caption: "",
    };
  }

  const { path, url, caption = "" } = item || {};
  const src = url || resolveLocalPhoto(path);

  return {
    id: `${path || url || "photo"}-${index}`,
    src,
    caption,
  };
}

export function normalizePhotos(entry) {
  const rawPhotos = entry.photos || entry.photo || [];

  return rawPhotos
    .map((item, index) => normalizePhotoItem(item, index))
    .filter((photo) => photo.src);
}

export function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }

      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
    }
  } catch (e) {
    return null;
  }

  return null;
}

export function formatDate(dateString) {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function buildGallery(entries) {
  const photos = [];
  const entryPhotoOffsets = [];

  entries.forEach((entry) => {
    entryPhotoOffsets.push(photos.length);
    const about = entry.about?.trim() || "";

    normalizePhotos(entry).forEach((photo) => {
      photos.push({
        ...photo,
        date: entry.date || "",
        about,
      });
    });
  });

  return { photos, entryPhotoOffsets };
}

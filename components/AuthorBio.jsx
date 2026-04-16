"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * AuthorBio – reusable author card for blog posts and article pages.
 *
 * Props:
 *  @param {string}   name        – Author full name
 *  @param {string}   title       – Author professional title / role
 *  @param {string}   bio         – Short bio (2–3 lines)
 *  @param {string[]} tags        – Expertise / topic tags
 *  @param {string}   [imageSrc]  – Path to author photo (relative to /public).
 *                                  Falls back to an initials avatar when omitted.
 *  @param {string}   [imageAlt]  – Alt text for the author photo
 */
export default function AuthorBio({
  name = "Krishanmohan Kumar",
  title = "PDF & Document Tools Expert",
  bio = "5+ years of experience in document management and PDF workflows. Passionate about helping students and professionals work smarter with digital files.",
  tags = ["PDF Tools", "Document Management", "Productivity"],
  imageSrc = "/authors/media__1774285319900.jpg",
  imageAlt,
}) {
  const [imgError, setImgError] = useState(false);

  /** Derive initials for the fallback avatar (up to 2 letters) */
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /**
   * Show initials avatar when:
   *  - no imageSrc was provided, OR
   *  - the image failed to load
   */
  const showFallback = !imageSrc || imgError;

  return (
    <aside
      aria-label={`About the author: ${name}`}
      className="flex flex-col sm:flex-row items-center sm:items-start gap-5
                 rounded-2xl border border-gray-100 bg-white p-6
                 shadow-sm ring-1 ring-gray-100
                 transition-shadow duration-300 hover:shadow-md
                 max-w-2xl mx-auto w-full"
    >
      {/* ── Avatar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0">
        {showFallback ? (
          /* Initials fallback */
          <span
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full
                       bg-gradient-to-br from-blue-600 to-indigo-700
                       text-white text-2xl font-bold select-none
                       ring-4 ring-blue-100"
          >
            {initials}
          </span>
        ) : (
          /* Author photo via next/image */
          <div className="relative h-20 w-20 rounded-full overflow-hidden
                          ring-4 ring-blue-100">
            <Image
              src={imageSrc}
              alt={imageAlt ?? `Photo of ${name}`}
              fill
              sizes="80px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </div>

      {/* ── Text content ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        {/* Label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          About the Author
        </p>

        {/* Name + title */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {name}
          </h3>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>

        {/* Expertise tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full
                           bg-blue-50 px-3 py-0.5
                           text-xs font-semibold text-blue-700
                           border border-blue-100
                           transition-colors duration-200 hover:bg-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

import { defineSchema } from "@plume-press/cli/schema";

export const schema = defineSchema({
  collections: [
    {
      name: "blog",
      label: "Blog Posts",
      previewPath: "/blog/{slug}",
      fields: [
        { name: "slug", label: "URL Slug", kind: "slug", from: "title", required: true },
        { name: "title", label: "Title", kind: "text", required: true },
        { name: "description", label: "Description", kind: "text", multiline: true, required: true },
        { name: "body", label: "Post Text", kind: "richText", required: true },
        { name: "pubDate", label: "Publication Date", kind: "date", required: true },
        { name: "heroImage", label: "Hero Image", kind: "image" },
      ],
    },
  ],
});

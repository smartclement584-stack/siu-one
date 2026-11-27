import { contentRouter, checkText } from "../contentRouter.js";

const TAG_COLORS = ["", "orange"]; // "" is the default green tag

export default contentRouter({
  file: "announcements",
  label: "Announcement",
  fields: ["tag", "tagColor", "title", "body", "author"],
  validate(values) {
    values.tag = values.tag.toUpperCase();
    if (!TAG_COLORS.includes(values.tagColor)) return "Invalid tag colour.";
    return checkText(values, [
      ["tag", "Tag", 20],
      ["title", "Title", 120],
      ["body", "Message", 1000],
      ["author", "Author", 60],
    ]);
  },
  // Newest first.
  compare: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  toResponse: ({ id, tag, tagColor, title, body, author }) => ({
    id,
    tag,
    tagColor,
    title,
    body,
    author,
  }),
});

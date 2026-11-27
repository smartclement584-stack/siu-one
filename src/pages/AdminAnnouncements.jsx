import ContentManager from "../components/ContentManager";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../api";

const api = {
  list: getAnnouncements,
  create: createAnnouncement,
  update: updateAnnouncement,
  remove: deleteAnnouncement,
};

const fields = [
  { name: "title", label: "Title", maxLength: 120 },
  { name: "tag", label: "Tag", maxLength: 20 },
  { name: "tagColor", label: "Tag Colour", options: [["", "Green"], ["orange", "Orange"]] },
  { name: "author", label: "Author", maxLength: 60 },
  { name: "body", label: "Message", maxLength: 1000, multiline: true },
];

const initialValues = {
  title: "",
  tag: "ACADEMIC",
  tagColor: "",
  author: "University Administration",
  body: "",
};

function AdminAnnouncements() {
  return (
    <ContentManager
      noun="Announcement"
      intro="The newest announcement appears first."
      fields={fields}
      initialValues={initialValues}
      api={api}
      describe={(item) => ({
        heading: item.title,
        detail: `${item.tag} · ${item.author} · ${item.body}`,
      })}
    />
  );
}

export default AdminAnnouncements;

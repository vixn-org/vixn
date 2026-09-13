import { permanentRedirect } from "next/navigation";

export default function BlogsAliasPage() {
  permanentRedirect("/blog");
}

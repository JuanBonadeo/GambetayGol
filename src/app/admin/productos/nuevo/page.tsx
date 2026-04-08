import { redirect } from "next/navigation";

export default function NuevoProductoRedirect() {
  redirect("/admin/productos");
}

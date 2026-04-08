import { redirect } from "next/navigation";

export default function EditarProductoRedirect() {
  redirect("/admin/productos");
}

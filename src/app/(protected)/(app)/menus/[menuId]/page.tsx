import { MenuEditor } from "@/components/menus/menu-editor";

export default async function MenuEditorPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;
  return <MenuEditor menuId={menuId} />;
}

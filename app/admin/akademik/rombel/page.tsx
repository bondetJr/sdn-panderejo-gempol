import { getAllClassRoomsAdmin, getTeachersForSelectAdmin } from "@/lib/admin-akademik-data";
import { ClassRoomManager } from "@/components/admin/ClassRoomManager";

export const metadata = { title: "Rombongan Belajar Manager" };

export default async function AdminRombelPage() {
  const [classRooms, teachers] = await Promise.all([
    getAllClassRoomsAdmin(),
    getTeachersForSelectAdmin(),
  ]);
  return <ClassRoomManager classRooms={classRooms} teachers={teachers} />;
}

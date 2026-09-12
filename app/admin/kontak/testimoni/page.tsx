import { getAllTestimonialsAdmin } from "@/lib/admin-kontak-data";
import { TestimonialModeration } from "@/components/admin/TestimonialModeration";

export const metadata = { title: "Moderasi Testimoni" };

export default async function AdminTestimoniPage() {
  const testimonials = await getAllTestimonialsAdmin();
  return <TestimonialModeration testimonials={testimonials} />;
}

import { getSchoolProfile } from "@/lib/school";
import {
  getPengumumanPenting,
  getFasilitasUnggulan,
  getBeritaTerbaru,
  getTestimoniUnggulan,
} from "@/lib/homepage-data";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";
import { getAchievements } from "@/lib/profil-data";

import { Hero } from "@/components/home/Hero";
import { PengumumanPenting } from "@/components/home/PengumumanPenting";
import { ProgramUnggulan } from "@/components/home/ProgramUnggulan";
import { PrestasiPreview } from "@/components/home/PrestasiPreview";
import { FasilitasPreview } from "@/components/home/FasilitasPreview";
import { BeritaTerbaru } from "@/components/home/BeritaTerbaru";
import { TestimoniWali } from "@/components/home/TestimoniWali";

export default async function BerandaPage() {
  const [school, pengumuman, programs, achievements, fasilitas, berita, testimoni] = await Promise.all([
    getSchoolProfile(),
    getPengumumanPenting(),
    getFlagshipPrograms(),
    getAchievements(),
    getFasilitasUnggulan(),
    getBeritaTerbaru(),
    getTestimoniUnggulan(),
  ]);

  return (
    <>
      <Hero school={school} />

      <div className="pt-6 sm:pt-8">
        <PengumumanPenting pengumuman={pengumuman} />
      </div>

      <ProgramUnggulan programs={programs} />
      <PrestasiPreview achievements={achievements} />
      <FasilitasPreview fasilitas={fasilitas} />
      <BeritaTerbaru berita={berita} />
      <TestimoniWali testimoni={testimoni} />
    </>
  );
}

import { Header } from "@/components/header"
import { NovelCard } from "@/components/novel-card"
import { RecentChapters } from "@/components/recent-chapters"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()
    userProfile = data
  }

  const { data: novels } = await supabase
    .from("novels")
    .select(
      `
      *,
      users:author_id (
        display_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-6 md:py-8 px-4">
        {/* Hero Section */}
        <section className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-balance">اكتشف عالم الروايات</h1>
          <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 text-pretty max-w-2xl mx-auto px-4">
            منصة احترافية لقراءة وكتابة الروايات العربية. انضم إلى مجتمعنا واستمتع بآلاف الروايات المميزة
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
            <Button asChild size="default" className="w-full sm:w-auto">
              <Link href="/novels">تصفح الروايات</Link>
            </Button>
            <Button asChild size="default" variant="outline" className="w-full sm:w-auto bg-transparent">
              <Link href={user ? "/author/request" : "/auth/sign-up"}>ابدأ الكتابة</Link>
            </Button>
          </div>
        </section>

        <section className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold">آخر التحديثات</h2>
            <Button asChild variant="link" className="text-primary text-sm md:text-base">
              <Link href="/novels" className="flex items-center gap-1">
                عرض المزيد
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </Button>
          </div>
          <RecentChapters />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold">استكشف الروايات المضافة مؤخراً</h2>
            <Button asChild variant="ghost" className="text-sm md:text-base">
              <Link href="/novels" className="flex items-center gap-1">
                عرض الكل
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </Button>
          </div>

          {novels && novels.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                direction: "rtl",
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {novels.map((novel: any) => (
                  <CarouselItem
                    key={novel.id}
                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <NovelCard novel={novel} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          ) : (
            <div className="text-center py-8 md:py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">لا توجد روايات حالياً</p>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">كن أول من ينشر رواية</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

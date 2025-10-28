import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Clock } from "lucide-react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export async function RecentChapters() {
  const supabase = await createClient()

  const { data: chapters } = await supabase
    .from("chapters")
    .select(
      `
      *,
      novels:novel_id (
        id,
        title,
        cover_image_url,
        author_id,
        users:author_id (
          display_name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(12)

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد فصول حديثة</p>
      </div>
    )
  }

  return (
    <Carousel
      opts={{
        align: "start",
        direction: "rtl",
        slidesToScroll: 1,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {chapters.map((chapter: any) => (
          <CarouselItem key={chapter.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
            <Link href={`/novels/${chapter.novels.id}/chapters/${chapter.chapter_number}`} className="group block">
              <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                  {chapter.novels.cover_image_url ? (
                    <Image
                      src={chapter.novels.cover_image_url || "/placeholder.svg"}
                      alt={chapter.novels.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-muted-foreground">No img</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {chapter.novels.title}
                  </h4>
                  <p className="text-xs text-primary mb-2 line-clamp-1">
                    الفصل {chapter.chapter_number} - {chapter.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(chapter.created_at), { addSuffix: true, locale: ar })}</span>
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  )
}

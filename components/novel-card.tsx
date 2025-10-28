import Link from "next/link"
import { BookOpen } from "lucide-react"
import type { Novel } from "@/lib/types"
import Image from "next/image"

interface NovelCardProps {
  novel: Novel
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <Link href={`/novels/${novel.id}`}>
      <div className="group relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
          {novel.cover_image_url ? (
            <Image
              src={novel.cover_image_url || "/placeholder.svg"}
              alt={novel.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 drop-shadow-lg">{novel.title}</h3>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{novel.total_chapters} فصل</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

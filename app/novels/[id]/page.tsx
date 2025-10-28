import { Header } from "@/components/header"
import { BookmarkButton } from "@/components/bookmark-button"
import { ReviewForm } from "@/components/review-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Eye, Star, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default async function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get novel details
  const { data: novel, error } = await supabase
    .from("novels")
    .select(
      `
      *,
      author:author_id (
        id,
        display_name
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error || !novel) {
    notFound()
  }

  // Get chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", id)
    .order("chapter_number", { ascending: true })

  // Get reviews with average rating
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      user:user_id (
        display_name
      )
    `,
    )
    .eq("novel_id", id)
    .order("created_at", { ascending: false })

  const averageRating =
    reviews && reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0

  // Check if user bookmarked
  let isBookmarked = false
  let userReview = null

  if (user) {
    const { data: bookmark } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("novel_id", id)
      .eq("user_id", user.id)
      .maybeSingle()

    isBookmarked = !!bookmark

    const { data: review } = await supabase
      .from("reviews")
      .select("*")
      .eq("novel_id", id)
      .eq("user_id", user.id)
      .maybeSingle()

    userReview = review
  }

  const statusLabels = {
    ongoing: "مستمرة",
    completed: "مكتملة",
    hiatus: "متوقفة",
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-4 md:py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Novel Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="relative w-full md:w-48 aspect-[3/4] overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    {novel.cover_image_url ? (
                      <Image
                        src={novel.cover_image_url || "/placeholder.svg"}
                        alt={novel.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 md:space-y-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{novel.title}</h1>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-3">
                        <User className="h-4 w-4" />
                        <Link href={`/author/${novel.author.id}`} className="hover:text-primary">
                          {novel.author.display_name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs md:text-sm">
                        <Badge variant={novel.status === "completed" ? "default" : "secondary"}>
                          {statusLabels[novel.status]}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({reviews?.length || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{novel.total_chapters} فصل</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{novel.total_views}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{novel.description}</p>

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      {user && <BookmarkButton novelId={id} isBookmarked={isBookmarked} />}
                      {chapters && chapters.length > 0 && (
                        <Button asChild>
                          <Link href={`/novels/${id}/chapters/${chapters[0].chapter_number}`}>ابدأ القراءة</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapters List */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">الفصول ({chapters?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {chapters && chapters.length > 0 ? (
                  <div className="space-y-2">
                    {chapters.map((chapter: any) => (
                      <Link
                        key={chapter.id}
                        href={`/novels/${id}/chapters/${chapter.chapter_number}`}
                        className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">
                            الفصل {chapter.chapter_number}: {chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(chapter.created_at), { addSuffix: true, locale: ar })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{chapter.views}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6 md:py-8 text-sm md:text-base">
                    لا توجد فصول بعد
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews Sidebar */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {user && (
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">{userReview ? "تعديل تقييمك" : "أضف تقييمك"}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <ReviewForm novelId={id} existingReview={userReview} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">التقييمات ({reviews?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-start gap-2 md:gap-3">
                          <Avatar className="h-7 w-7 md:h-8 md:w-8">
                            <AvatarFallback>{review.user.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs md:text-sm truncate">
                                {review.user.display_name}
                              </span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                            </p>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-3 md:py-4 text-xs md:text-sm">
                    لا توجد تقييمات بعد
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

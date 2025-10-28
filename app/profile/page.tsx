import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Settings, BookMarked, History, Star } from "lucide-react"
import { NovelCard } from "@/components/novel-card"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get bookmarks with novel details
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      *,
      novel:novel_id (
        *,
        author:author_id (
          display_name
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get reading history with chapter and novel details
  const { data: readingHistory } = await supabase
    .from("reading_history")
    .select(
      `
      *,
      chapter:chapter_id (
        id,
        chapter_number,
        title
      ),
      novel:novel_id (
        id,
        title,
        cover_image_url
      )
    `,
    )
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false })
    .limit(20)

  // Get user reviews with novel details
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      novel:novel_id (
        id,
        title,
        cover_image_url
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const roleLabels = {
    reader: "قارئ",
    author: "كاتب",
    admin: "مدير",
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-4 md:py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 mx-auto sm:mx-0">
                <AvatarFallback className="text-xl md:text-2xl">{userProfile?.display_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-right w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{userProfile?.display_name}</h1>
                  <Badge>{roleLabels[userProfile?.role as keyof typeof roleLabels]}</Badge>
                </div>
                <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">{user.email}</p>
                <div className="flex gap-4 md:gap-6 text-sm justify-center sm:justify-start">
                  <div>
                    <span className="text-muted-foreground">المفضلة: </span>
                    <span className="font-semibold">{bookmarks?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">التقييمات: </span>
                    <span className="font-semibold">{reviews?.length || 0}</span>
                  </div>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                <Link href="/settings">
                  <Settings className="ml-2 h-4 w-4" />
                  الإعدادات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="bookmarks" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10 gap-1 sm:gap-0">
            <TabsTrigger value="bookmarks" className="py-3 sm:py-2">
              <BookMarked className="ml-2 h-4 w-4" />
              المفضلة
            </TabsTrigger>
            <TabsTrigger value="history" className="py-3 sm:py-2">
              <History className="ml-2 h-4 w-4" />
              سجل القراءة
            </TabsTrigger>
            <TabsTrigger value="reviews" className="py-3 sm:py-2">
              <Star className="ml-2 h-4 w-4" />
              تقييماتي
            </TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">رواياتي المفضلة ({bookmarks?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {bookmarks && bookmarks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {bookmarks.map((bookmark: any) => (
                      <NovelCard key={bookmark.id} novel={bookmark.novel} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <BookMarked className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                    <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
                      لم تقم بإضافة أي رواية للمفضلة بعد
                    </p>
                    <Button asChild size="sm">
                      <Link href="/novels">تصفح الروايات</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">سجل القراءة</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {readingHistory && readingHistory.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {readingHistory.map((history: any) => (
                      <Link
                        key={history.id}
                        href={`/novels/${history.novel.id}/chapters/${history.chapter.chapter_number}`}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="relative w-12 h-16 md:w-16 md:h-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {history.novel.cover_image_url ? (
                            <img
                              src={history.novel.cover_image_url || "/placeholder.svg"}
                              alt={history.novel.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookMarked className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate text-sm md:text-base">{history.novel.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">
                            الفصل {history.chapter.chapter_number}: {history.chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(history.last_read_at), { addSuffix: true, locale: ar })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <History className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                    <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">لم تقرأ أي فصل بعد</p>
                    <Button asChild size="sm">
                      <Link href="/novels">ابدأ القراءة</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">تقييماتي ({reviews?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {reviews.map((review: any) => (
                      <Link
                        key={review.id}
                        href={`/novels/${review.novel.id}`}
                        className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="relative w-12 h-16 md:w-16 md:h-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {review.novel.cover_image_url ? (
                            <img
                              src={review.novel.cover_image_url || "/placeholder.svg"}
                              alt={review.novel.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookMarked className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-2 text-sm md:text-base">{review.novel.title}</h3>
                          <div className="flex mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 md:h-4 md:w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Star className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                    <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
                      لم تقم بتقييم أي رواية بعد
                    </p>
                    <Button asChild size="sm">
                      <Link href="/novels">تصفح الروايات</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

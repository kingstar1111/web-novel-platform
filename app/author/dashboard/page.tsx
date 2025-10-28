import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, BookOpen, Eye, Edit } from "lucide-react"
import Image from "next/image"
import { DeleteNovelButton } from "@/components/delete-novel-button"

export default async function AuthorDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userProfile || (userProfile.role !== "author" && userProfile.role !== "admin")) {
    redirect("/")
  }

  // Get author's novels with stats
  const { data: novels } = await supabase
    .from("novels")
    .select(
      `
      *,
      chapters:chapters(count)
    `,
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate total stats
  const totalNovels = novels?.length || 0
  const totalChapters = novels?.reduce((acc, novel: any) => acc + (novel.chapters[0]?.count || 0), 0) || 0
  const totalViews = novels?.reduce((acc, novel) => acc + novel.total_views, 0) || 0

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-4 md:py-8 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">لوحة الكاتب</h1>
            <p className="text-muted-foreground text-sm md:text-base">إدارة رواياتك وفصولك</p>
          </div>
          <Button asChild size="default" className="w-full sm:w-auto">
            <Link href="/author/novels/new">
              <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              رواية جديدة
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-sm font-medium">إجمالي الروايات</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-2xl font-bold">{totalNovels}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-sm font-medium">إجمالي الفصول</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-2xl font-bold">{totalChapters}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-2xl font-bold">{totalViews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Novels List */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">رواياتي</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {novels && novels.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {novels.map((novel: any) => (
                  <div
                    key={novel.id}
                    className="flex flex-col sm:flex-row items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="relative w-full sm:w-20 md:w-24 h-28 sm:h-28 md:h-32 flex-shrink-0 overflow-hidden rounded bg-muted">
                      {novel.cover_image_url ? (
                        <Image
                          src={novel.cover_image_url || "/placeholder.svg"}
                          alt={novel.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-bold text-base md:text-lg mb-1">{novel.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2 md:mb-3">
                        {novel.description}
                      </p>
                      <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{novel.chapters[0]?.count || 0} فصل</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{novel.total_views}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none text-xs md:text-sm bg-transparent h-8 md:h-9"
                      >
                        <Link href={`/author/novels/${novel.id}/chapters`}>
                          <BookOpen className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                          الفصول
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none text-xs md:text-sm bg-transparent h-8 md:h-9"
                      >
                        <Link href={`/author/novels/${novel.id}/edit`}>
                          <Edit className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                          تعديل
                        </Link>
                      </Button>
                      <DeleteNovelButton novelId={novel.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">لم تقم بإنشاء أي رواية بعد</p>
                <Button asChild size="sm">
                  <Link href="/author/novels/new">
                    <Plus className="ml-2 h-4 w-4" />
                    إنشاء رواية جديدة
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

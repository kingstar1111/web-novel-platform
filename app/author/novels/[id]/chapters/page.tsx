import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Eye, ArrowLeft } from "lucide-react"
import { DeleteChapterButton } from "@/components/delete-chapter-button"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default async function NovelChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: novel, error } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single()

  if (error || !novel) {
    notFound()
  }

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", id)
    .order("chapter_number", { ascending: true })

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/author/dashboard">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للوحة التحكم
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
              <p className="text-muted-foreground">إدارة فصول الرواية</p>
            </div>
            <Button asChild size="lg">
              <Link href={`/author/novels/${id}/chapters/new`}>
                <Plus className="ml-2 h-5 w-5" />
                فصل جديد
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>الفصول ({chapters?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {chapters && chapters.length > 0 ? (
              <div className="space-y-3">
                {chapters.map((chapter: any) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        الفصل {chapter.chapter_number}: {chapter.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{chapter.views} مشاهدة</span>
                        </div>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(chapter.created_at), { addSuffix: true, locale: ar })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/author/novels/${id}/chapters/${chapter.id}/edit`}>
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </Link>
                      </Button>
                      <DeleteChapterButton chapterId={chapter.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">لم تقم بإضافة أي فصل بعد</p>
                <Button asChild>
                  <Link href={`/author/novels/${id}/chapters/new`}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة فصل جديد
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

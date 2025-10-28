import { Header } from "@/components/header"
import { CommentSection } from "@/components/comment-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ChevronLeft, List } from "lucide-react"
import { FontSizeControls } from "@/components/font-size-controls" // Declare FontSizeControls

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterNumber: string }>
}) {
  const { id, chapterNumber } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get chapter
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select(
      `
      *,
      novel:novel_id (
        id,
        title,
        author_id
      )
    `,
    )
    .eq("novel_id", id)
    .eq("chapter_number", Number.parseInt(chapterNumber))
    .single()

  if (error || !chapter) {
    notFound()
  }

  // Update chapter views
  await supabase
    .from("chapters")
    .update({ views: chapter.views + 1 })
    .eq("id", chapter.id)

  // Update novel views
  const { data: novel } = await supabase.from("novels").select("total_views").eq("id", id).maybeSingle()

  if (novel) {
    await supabase
      .from("novels")
      .update({ total_views: novel.total_views + 1 })
      .eq("id", id)
  }

  // Track reading history if user is logged in
  if (user) {
    await supabase.from("reading_history").upsert(
      {
        user_id: user.id,
        chapter_id: chapter.id,
        novel_id: id,
        last_read_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,chapter_id",
      },
    )
  }

  // Get previous and next chapters
  const { data: prevChapter } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("novel_id", id)
    .lt("chapter_number", Number.parseInt(chapterNumber))
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: nextChapter } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("novel_id", id)
    .gt("chapter_number", Number.parseInt(chapterNumber))
    .order("chapter_number", { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-4xl py-4 md:py-8 px-4">
        {/* Chapter Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
            <Link href={`/novels/${id}`}>
              <List className="ml-2 h-4 w-4" />
              قائمة الفصول
            </Link>
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            {prevChapter ? (
              <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                <Link href={`/novels/${id}/chapters/${prevChapter.chapter_number}`}>
                  <ChevronRight className="ml-2 h-4 w-4" />
                  السابق
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled size="sm" className="flex-1 sm:flex-none bg-transparent">
                <ChevronRight className="ml-2 h-4 w-4" />
                السابق
              </Button>
            )}
            {nextChapter ? (
              <Button asChild size="sm" className="flex-1 sm:flex-none">
                <Link href={`/novels/${id}/chapters/${nextChapter.chapter_number}`}>
                  التالي
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button disabled size="sm" className="flex-1 sm:flex-none">
                التالي
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Chapter Content */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-8">
            <div className="mb-6">
              <Link
                href={`/novels/${id}`}
                className="text-xs md:text-sm text-muted-foreground hover:text-primary mb-2 block"
              >
                {chapter.novel.title}
              </Link>
              <h1 className="text-xl md:text-3xl font-bold mb-2">
                الفصل {chapter.chapter_number}: {chapter.title}
              </h1>
            </div>
            <Separator className="mb-6" />
            {user && <FontSizeControls />}
            <div className="prose prose-invert max-w-none">
              <div id="chapter-content" className="whitespace-pre-wrap leading-relaxed text-foreground text-base">
                {chapter.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
          {prevChapter ? (
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
              <Link href={`/novels/${id}/chapters/${prevChapter.chapter_number}`}>
                <ChevronRight className="ml-2 h-4 w-4" />
                الفصل السابق
              </Link>
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
          {nextChapter ? (
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href={`/novels/${id}/chapters/${nextChapter.chapter_number}`}>
                الفصل التالي
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        {/* Comments */}
        <Card>
          <CardContent className="p-6">
            <CommentSection chapterId={chapter.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

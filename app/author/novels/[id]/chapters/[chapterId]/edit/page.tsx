import { Header } from "@/components/header"
import { ChapterForm } from "@/components/chapter-form"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>
}) {
  const { id, chapterId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: novel, error: novelError } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single()

  if (novelError || !novel) {
    notFound()
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .eq("novel_id", id)
    .single()

  if (chapterError || !chapter) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-2">تعديل الفصل</h1>
        <p className="text-muted-foreground mb-8">{novel.title}</p>
        <ChapterForm novelId={id} chapter={chapter} />
      </main>
    </div>
  )
}

import { Header } from "@/components/header"
import { ChapterForm } from "@/components/chapter-form"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"

export default async function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get the next chapter number
  const { data: lastChapter } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("novel_id", id)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .single()

  const nextChapterNumber = lastChapter ? lastChapter.chapter_number + 1 : 1

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-2">إضافة فصل جديد</h1>
        <p className="text-muted-foreground mb-8">{novel.title}</p>
        <ChapterForm novelId={id} nextChapterNumber={nextChapterNumber} />
      </main>
    </div>
  )
}

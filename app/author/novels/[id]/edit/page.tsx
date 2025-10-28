import { Header } from "@/components/header"
import { NovelForm } from "@/components/novel-form"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"

export default async function EditNovelPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-3xl py-8">
        <h1 className="text-3xl font-bold mb-8">تعديل الرواية</h1>
        <NovelForm novel={novel} />
      </main>
    </div>
  )
}

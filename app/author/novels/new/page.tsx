import { Header } from "@/components/header"
import { NovelForm } from "@/components/novel-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function NewNovelPage() {
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-3xl py-8">
        <h1 className="text-3xl font-bold mb-8">إنشاء رواية جديدة</h1>
        <NovelForm />
      </main>
    </div>
  )
}

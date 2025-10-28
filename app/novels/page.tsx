import { Header } from "@/components/header"
import { NovelCard } from "@/components/novel-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/server"
import { Search } from "lucide-react"

interface NovelsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    sort?: string
  }>
}

export default async function NovelsPage({ searchParams }: NovelsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("novels").select(
    `
      *,
      users:author_id (
        display_name
      )
    `,
  )

  // Apply search filter
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  // Apply status filter
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status)
  }

  // Apply sorting
  switch (params.sort) {
    case "views":
      query = query.order("total_views", { ascending: false })
      break
    case "chapters":
      query = query.order("total_chapters", { ascending: false })
      break
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: novels } = await query

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-4 md:py-8 px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">تصفح الروايات</h1>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن رواية..."
                className="pr-10"
                name="search"
                defaultValue={params.search}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select name="status" defaultValue={params.status || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="ongoing">مستمرة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="hiatus">متوقفة</SelectItem>
                </SelectContent>
              </Select>
              <Select name="sort" defaultValue={params.sort || "newest"}>
                <SelectTrigger>
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="oldest">الأقدم</SelectItem>
                  <SelectItem value="views">الأكثر مشاهدة</SelectItem>
                  <SelectItem value="chapters">الأكثر فصولاً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Novels Grid */}
        {novels && novels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {novels.map((novel: any) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4 text-sm md:text-base">لم يتم العثور على روايات</p>
            <Button asChild size="sm">
              <a href="/novels">مسح الفلاتر</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

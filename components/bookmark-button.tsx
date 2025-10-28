"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface BookmarkButtonProps {
  novelId: string
  isBookmarked: boolean
}

export function BookmarkButton({ novelId, isBookmarked: initialBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleBookmark = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (isBookmarked) {
        const { error } = await supabase.from("bookmarks").delete().eq("novel_id", novelId).eq("user_id", user.id)

        if (error) throw error
        setIsBookmarked(false)
        toast.success("تمت إزالة الرواية من المفضلة")
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          novel_id: novelId,
          user_id: user.id,
        })

        if (error) throw error
        setIsBookmarked(true)
        toast.success("تمت إضافة الرواية إلى المفضلة")
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Error toggling bookmark:", error)
      toast.error("حدث خطأ أثناء تحديث المفضلة")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleToggleBookmark} disabled={isLoading} variant={isBookmarked ? "default" : "outline"}>
      <Bookmark className={`ml-2 h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      {isBookmarked ? "في المفضلة" : "إضافة للمفضلة"}
    </Button>
  )
}

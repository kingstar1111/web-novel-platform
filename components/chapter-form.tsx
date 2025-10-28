"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { Chapter } from "@/lib/types"

interface ChapterFormProps {
  novelId: string
  chapter?: Chapter
  nextChapterNumber?: number
}

export function ChapterForm({ novelId, chapter, nextChapterNumber }: ChapterFormProps) {
  const [chapterNumber, setChapterNumber] = useState(chapter?.chapter_number || nextChapterNumber || 1)
  const [title, setTitle] = useState(chapter?.title || "")
  const [content, setContent] = useState(chapter?.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      if (!title.trim() || !content.trim()) {
        toast.error("يرجى ملء جميع الحقول المطلوبة")
        setIsLoading(false)
        return
      }

      if (chapter) {
        // Update existing chapter
        const { error } = await supabase
          .from("chapters")
          .update({
            chapter_number: chapterNumber,
            title,
            content,
          })
          .eq("id", chapter.id)

        if (error) throw error
        toast.success("تم تحديث الفصل بنجاح")
      } else {
        // Create new chapter
        const { error } = await supabase.from("chapters").insert({
          novel_id: novelId,
          chapter_number: chapterNumber,
          title,
          content,
        })

        if (error) throw error
        toast.success("تم إضافة الفصل بنجاح")
      }

      router.push(`/author/novels/${novelId}/chapters`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving chapter:", error)
      toast.error("حدث خطأ أثناء حفظ الفصل")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="chapterNumber">رقم الفصل *</Label>
            <Input
              id="chapterNumber"
              type="number"
              min="1"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(Number.parseInt(e.target.value))}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="title">عنوان الفصل *</Label>
            <Input
              id="title"
              type="text"
              placeholder="أدخل عنوان الفصل"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="content">محتوى الفصل *</Label>
            <Textarea
              id="content"
              placeholder="اكتب محتوى الفصل هنا..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="mt-2 font-sans"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : chapter ? "تحديث الفصل" : "إضافة الفصل"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

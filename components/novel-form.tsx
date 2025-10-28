"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { Novel } from "@/lib/types"

interface NovelFormProps {
  novel?: Novel
}

export function NovelForm({ novel }: NovelFormProps) {
  const [title, setTitle] = useState(novel?.title || "")
  const [description, setDescription] = useState(novel?.description || "")
  const [coverImageUrl, setCoverImageUrl] = useState(novel?.cover_image_url || "")
  const [status, setStatus] = useState<"ongoing" | "completed" | "hiatus">(novel?.status || "ongoing")
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

      if (!title.trim() || !description.trim()) {
        toast.error("يرجى ملء جميع الحقول المطلوبة")
        setIsLoading(false)
        return
      }

      if (novel) {
        const { error } = await supabase
          .from("novels")
          .update({
            title,
            description,
            cover_image_url: coverImageUrl || null,
            status,
          })
          .eq("id", novel.id)

        if (error) throw error
        toast.success("تم تحديث الرواية بنجاح")

        // Refresh and redirect using window.location for full page reload
        router.refresh()
        setTimeout(() => {
          window.location.href = "/author/dashboard"
        }, 500)
      } else {
        const { data: newNovel, error } = await supabase
          .from("novels")
          .insert({
            title,
            description,
            cover_image_url: coverImageUrl || null,
            status,
            author_id: user.id,
          })
          .select()
          .single()

        if (error) throw error
        toast.success("تم إنشاء الرواية بنجاح")
        // Redirect to chapter management to add first chapter
        router.push(`/author/novels/${newNovel.id}/chapters`)
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving novel:", error)
      toast.error("حدث خطأ أثناء حفظ الرواية")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">عنوان الرواية *</Label>
            <Input
              id="title"
              type="text"
              placeholder="أدخل عنوان الرواية"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              placeholder="اكتب وصفاً مختصراً للرواية"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="coverImageUrl">رابط صورة الغلاف</Label>
            <Input
              id="coverImageUrl"
              type="url"
              placeholder="https://example.com/cover.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">اختياري - يمكنك إضافة رابط صورة الغلاف</p>
          </div>

          <div>
            <Label htmlFor="status">حالة الرواية</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">مستمرة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="hiatus">متوقفة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : novel ? "تحديث الرواية" : "إنشاء الرواية"}
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

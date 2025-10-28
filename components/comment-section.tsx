"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import type { Comment } from "@/lib/types"

interface CommentSectionProps {
  chapterId: string
}

export function CommentSection({ chapterId }: CommentSectionProps) {
  const [comments, setComments] = useState<(Comment & { user: { display_name: string } })[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadComments()
  }, [chapterId])

  const loadComments = async () => {
    const supabase = createClient()
    setIsLoadingComments(true)

    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:user_id (
            display_name
          )
        `,
        )
        .eq("chapter_id", chapterId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setComments(data as any)
    } catch (error) {
      console.error("[v0] Error loading comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

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

      if (!newComment.trim()) {
        toast.error("يرجى كتابة تعليق")
        setIsLoading(false)
        return
      }

      const { error } = await supabase.from("comments").insert({
        chapter_id: chapterId,
        user_id: user.id,
        content: newComment,
      })

      if (error) throw error

      setNewComment("")
      toast.success("تم إضافة تعليقك بنجاح")
      loadComments()
    } catch (error) {
      console.error("[v0] Error submitting comment:", error)
      toast.error("حدث خطأ أثناء إضافة التعليق")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">التعليقات ({comments.length})</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="اكتب تعليقك هنا..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الإضافة..." : "إضافة تعليق"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {isLoadingComments ? (
          <p className="text-center text-muted-foreground">جاري تحميل التعليقات...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{comment.user.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.user.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">لا توجد تعليقات بعد. كن أول من يعلق!</p>
        )}
      </div>
    </div>
  )
}

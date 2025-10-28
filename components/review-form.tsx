"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface ReviewFormProps {
  novelId: string
  existingReview?: {
    rating: number
    comment?: string
  }
}

export function ReviewForm({ novelId, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || "")
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

      if (rating === 0) {
        toast.error("يرجى اختيار تقييم")
        setIsLoading(false)
        return
      }

      if (existingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            comment: comment || null,
          })
          .eq("novel_id", novelId)
          .eq("user_id", user.id)

        if (error) throw error
        toast.success("تم تحديث تقييمك بنجاح")
      } else {
        const { error } = await supabase.from("reviews").insert({
          novel_id: novelId,
          user_id: user.id,
          rating,
          comment: comment || null,
        })

        if (error) throw error
        toast.success("تم إضافة تقييمك بنجاح")
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
      toast.error("حدث خطأ أثناء حفظ التقييم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>التقييم</Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="comment">التعليق (اختياري)</Label>
        <Textarea
          id="comment"
          placeholder="شاركنا رأيك في الرواية..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-2"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : existingReview ? "تحديث التقييم" : "إضافة التقييم"}
      </Button>
    </form>
  )
}

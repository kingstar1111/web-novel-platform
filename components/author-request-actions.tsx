"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AuthorRequestActionsProps {
  requestId: string
  userId: string
}

export function AuthorRequestActions({ requestId, userId }: AuthorRequestActionsProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleApprove(formData: FormData) {
    setIsLoading(true)
    const supabase = createClient()
    const adminNote = formData.get("admin_note") as string

    // Update request status
    const { error: requestError } = await supabase
      .from("author_requests")
      .update({
        status: "approved",
        admin_note: adminNote || null,
      })
      .eq("id", requestId)

    if (requestError) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء قبول الطلب",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Update user role to author
    const { error: userError } = await supabase.from("users").update({ role: "author" }).eq("id", userId)

    if (userError) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث دور المستخدم",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "تم قبول الطلب",
      description: "تم ترقية المستخدم إلى كاتب بنجاح",
    })

    setIsApproveOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  async function handleReject(formData: FormData) {
    setIsLoading(true)
    const supabase = createClient()
    const adminNote = formData.get("admin_note") as string

    const { error } = await supabase
      .from("author_requests")
      .update({
        status: "rejected",
        admin_note: adminNote || null,
      })
      .eq("id", requestId)

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الطلب",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "تم رفض الطلب",
      description: "تم رفض طلب الكاتب",
    })

    setIsRejectOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="flex-1">
            <Check className="h-4 w-4 ml-2" />
            قبول
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>قبول طلب الكاتب</DialogTitle>
            <DialogDescription>سيتم ترقية المستخدم إلى كاتب ويمكنه البدء في نشر الروايات</DialogDescription>
          </DialogHeader>
          <form action={handleApprove} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin_note">ملاحظة (اختياري)</Label>
              <Textarea
                id="admin_note"
                name="admin_note"
                placeholder="أضف ملاحظة للمستخدم..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "جاري القبول..." : "تأكيد القبول"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsApproveOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive" className="flex-1">
            <X className="h-4 w-4 ml-2" />
            رفض
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض طلب الكاتب</DialogTitle>
            <DialogDescription>سيتم رفض الطلب ويمكن للمستخدم تقديم طلب جديد لاحقاً</DialogDescription>
          </DialogHeader>
          <form action={handleReject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin_note">سبب الرفض (اختياري)</Label>
              <Textarea
                id="admin_note"
                name="admin_note"
                placeholder="أخبر المستخدم لماذا تم رفض طلبه..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={isLoading} className="flex-1">
                {isLoading ? "جاري الرفض..." : "تأكيد الرفض"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

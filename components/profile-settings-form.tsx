"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface ProfileSettingsFormProps {
  userProfile: any
  userEmail: string
}

export function ProfileSettingsForm({ userProfile, userEmail }: ProfileSettingsFormProps) {
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "")
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

      if (!displayName.trim()) {
        toast.error("يرجى إدخال اسم العرض")
        setIsLoading(false)
        return
      }

      const { error } = await supabase
        .from("users")
        .update({
          display_name: displayName,
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("تم تحديث معلومات الحساب بنجاح")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      toast.error("حدث خطأ أثناء تحديث المعلومات")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="displayName">اسم العرض</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="أدخل اسم العرض"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" type="email" value={userEmail} disabled className="mt-2" />
        <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني</p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  )
}

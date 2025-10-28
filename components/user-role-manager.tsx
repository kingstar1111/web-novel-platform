"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface UserRoleManagerProps {
  userId: string
  currentRole: string
  currentUserId: string
}

export function UserRoleManager({ userId, currentRole, currentUserId }: UserRoleManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (newRole: "reader" | "author" | "admin") => {
    if (userId === currentUserId && newRole !== "admin") {
      toast.error("لا يمكنك تغيير دورك الخاص")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      toast.success("تم تحديث دور المستخدم بنجاح")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating user role:", error)
      toast.error("حدث خطأ أثناء تحديث دور المستخدم")
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabels = {
    reader: "قارئ",
    author: "كاتب",
    admin: "مدير",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? "جاري التحديث..." : "تغيير الدور"}
          <ChevronDown className="mr-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleRoleChange("reader")}
          disabled={currentRole === "reader"}
          className="cursor-pointer"
        >
          {roleLabels.reader}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("author")}
          disabled={currentRole === "author"}
          className="cursor-pointer"
        >
          {roleLabels.author}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("admin")}
          disabled={currentRole === "admin"}
          className="cursor-pointer"
        >
          {roleLabels.admin}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

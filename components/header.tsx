import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, User, LogOut, Settings, BookMarked, History, PenTool, Shield, Library } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()
    userProfile = data
  }

  async function handleSignOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="text-lg md:text-xl font-bold">منصة الروايات</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link href="/novels" className="text-sm font-medium hover:text-primary transition-colors">
              الروايات
            </Link>
            {(userProfile?.role === "author" || userProfile?.role === "admin") && (
              <>
                <Link href="/author/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  لوحة الكاتب
                </Link>
                <Link href="/author/novels/new" className="text-sm font-medium hover:text-primary transition-colors">
                  إضافة رواية
                </Link>
              </>
            )}
            {userProfile?.role === "admin" && (
              <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                لوحة الإدارة
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 md:h-10 md:w-10">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userProfile?.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/novels" className="cursor-pointer">
                    <Library className="ml-2 h-4 w-4" />
                    تصفح الروايات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/bookmarks" className="cursor-pointer">
                    <BookMarked className="ml-2 h-4 w-4" />
                    المفضلة
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/history" className="cursor-pointer">
                    <History className="ml-2 h-4 w-4" />
                    سجل القراءة
                  </Link>
                </DropdownMenuItem>
                {(userProfile?.role === "author" || userProfile?.role === "admin") && (
                  <DropdownMenuItem asChild>
                    <Link href="/author/dashboard" className="cursor-pointer">
                      <PenTool className="ml-2 h-4 w-4" />
                      لوحة الكاتب
                    </Link>
                  </DropdownMenuItem>
                )}
                {userProfile?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="cursor-pointer">
                      <Shield className="ml-2 h-4 w-4" />
                      لوحة الإدارة
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="ml-2 h-4 w-4" />
                    الإعدادات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={handleSignOut} className="w-full">
                    <button type="submit" className="flex w-full items-center cursor-pointer">
                      <LogOut className="ml-2 h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost" size="sm" className="text-[11px] md:text-sm h-8 md:h-9 px-2 md:px-4">
                <Link href="/auth/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild size="sm" className="text-[11px] md:text-sm h-8 md:h-9 px-2 md:px-4">
                <Link href="/auth/sign-up">إنشاء حساب</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

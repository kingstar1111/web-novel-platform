import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PenTool, CheckCircle, Clock } from "lucide-react"
import { revalidatePath } from "next/cache"

export default async function AuthorRequestPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  // If already an author or admin, redirect to dashboard
  if (userProfile?.role === "author" || userProfile?.role === "admin") {
    redirect("/author/dashboard")
  }

  // Check if user has a pending request
  const { data: existingRequest } = await supabase
    .from("author_requests")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  async function submitRequest(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const reason = formData.get("reason") as string

    if (!reason || reason.trim().length < 20) {
      return
    }

    await supabase.from("author_requests").insert({
      user_id: user.id,
      reason: reason.trim(),
      status: "pending",
    })

    revalidatePath("/author/request")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 md:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <PenTool className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">طلب أن تصبح كاتباً</CardTitle>
              <CardDescription className="text-base">انضم إلى مجتمع الكتّاب وابدأ في نشر رواياتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {existingRequest ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      existingRequest.status === "pending"
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : existingRequest.status === "approved"
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold">
                          {existingRequest.status === "pending"
                            ? "طلبك قيد المراجعة"
                            : existingRequest.status === "approved"
                              ? "تم قبول طلبك"
                              : "تم رفض طلبك"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {existingRequest.status === "pending"
                            ? "سيقوم فريق الإدارة بمراجعة طلبك في أقرب وقت ممكن."
                            : existingRequest.status === "approved"
                              ? "تم ترقية حسابك إلى كاتب. يمكنك الآن البدء في نشر رواياتك."
                              : "للأسف، تم رفض طلبك. يمكنك تقديم طلب جديد لاحقاً."}
                        </p>
                        {existingRequest.admin_note && (
                          <div className="mt-2 p-3 bg-background rounded border">
                            <p className="text-sm font-medium mb-1">ملاحظة الإدارة:</p>
                            <p className="text-sm text-muted-foreground">{existingRequest.admin_note}</p>
                          </div>
                        )}
                        <div className="mt-2 p-3 bg-background rounded border">
                          <p className="text-sm font-medium mb-1">سبب الطلب:</p>
                          <p className="text-sm text-muted-foreground">{existingRequest.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/">العودة للرئيسية</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">نشر روايات غير محدودة</h3>
                        <p className="text-sm text-muted-foreground">
                          يمكنك نشر عدد غير محدود من الروايات والفصول على المنصة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">لوحة تحكم خاصة</h3>
                        <p className="text-sm text-muted-foreground">
                          احصل على لوحة تحكم متقدمة لإدارة رواياتك وفصولك ومتابعة الإحصائيات
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">تفاعل مع القراء</h3>
                        <p className="text-sm text-muted-foreground">تواصل مع قرائك من خلال التعليقات والتقييمات</p>
                      </div>
                    </div>
                  </div>

                  <form action={submitRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">لماذا تريد أن تصبح كاتباً؟ *</Label>
                      <Textarea
                        id="reason"
                        name="reason"
                        placeholder="أخبرنا عن خبرتك في الكتابة وما الذي تخطط لنشره على المنصة... (20 حرف على الأقل)"
                        required
                        minLength={20}
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        سيتم مراجعة طلبك من قبل فريق الإدارة خلال 24-48 ساعة
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" className="flex-1">
                        إرسال الطلب
                      </Button>
                      <Button asChild variant="outline" className="flex-1 bg-transparent">
                        <Link href="/">إلغاء</Link>
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">تم إنشاء الحساب بنجاح!</CardTitle>
            <CardDescription>تحقق من بريدك الإلكتروني</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك قبل تسجيل الدخول.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">الذهاب لتسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

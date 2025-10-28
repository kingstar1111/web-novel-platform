import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, BookOpen, Eye, MessageSquare, Clock } from "lucide-react"
import { UserRoleManager } from "@/components/user-role-manager"
import { DeleteUserButton } from "@/components/delete-user-button"
import { AuthorRequestActions } from "@/components/author-request-actions"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/")
  }

  // Get platform statistics
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: totalNovels } = await supabase.from("novels").select("*", { count: "exact", head: true })

  const { count: totalChapters } = await supabase.from("chapters").select("*", { count: "exact", head: true })

  const { count: totalComments } = await supabase.from("comments").select("*", { count: "exact", head: true })

  // Get all users
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  // Get role counts
  const readerCount = users?.filter((u) => u.role === "reader").length || 0
  const authorCount = users?.filter((u) => u.role === "author").length || 0
  const adminCount = users?.filter((u) => u.role === "admin").length || 0

  const { data: authorRequests } = await supabase
    .from("author_requests")
    .select(
      `
      *,
      user:users(id, email, display_name)
    `,
    )
    .order("created_at", { ascending: false })

  const pendingRequests = authorRequests?.filter((r) => r.status === "pending") || []
  const processedRequests = authorRequests?.filter((r) => r.status !== "pending") || []

  const roleLabels = {
    reader: "قارئ",
    author: "كاتب",
    admin: "مدير",
  }

  const roleBadgeVariants = {
    reader: "secondary" as const,
    author: "default" as const,
    admin: "destructive" as const,
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">لوحة الإدارة</h1>
          <p className="text-muted-foreground">إدارة المستخدمين والمحتوى</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {readerCount} قارئ • {authorCount} كاتب • {adminCount} مدير
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">إجمالي الروايات</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalNovels || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">إجمالي الفصول</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalChapters || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">إجمالي التعليقات</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalComments || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              طلبات الكتّاب
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="mr-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                {users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                          <Avatar className="flex-shrink-0">
                            <AvatarFallback>{u.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold truncate">{u.display_name}</h3>
                              <Badge variant={roleBadgeVariants[u.role as keyof typeof roleBadgeVariants]}>
                                {roleLabels[u.role as keyof typeof roleLabels]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <UserRoleManager userId={u.id} currentRole={u.role} currentUserId={user.id} />
                          {u.id !== user.id && <DeleteUserButton userId={u.id} />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمون</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-4">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      طلبات قيد المراجعة ({pendingRequests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingRequests.map((request: any) => (
                        <div key={request.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar>
                                <AvatarFallback>{request.user.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{request.user.display_name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{request.user.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(request.created_at).toLocaleDateString("ar-SA")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded">
                            <p className="text-sm font-medium mb-1">سبب الطلب:</p>
                            <p className="text-sm text-muted-foreground">{request.reason}</p>
                          </div>
                          <AuthorRequestActions requestId={request.id} userId={request.user_id} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Processed Requests */}
              {processedRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>الطلبات المعالجة ({processedRequests.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {processedRequests.map((request: any) => (
                        <div key={request.id} className="p-4 border rounded-lg space-y-3 opacity-60">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar>
                                <AvatarFallback>{request.user.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">{request.user.display_name}</h3>
                                  <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                                    {request.status === "approved" ? "مقبول" : "مرفوض"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{request.user.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(request.updated_at).toLocaleDateString("ar-SA")}
                                </p>
                              </div>
                            </div>
                          </div>
                          {request.admin_note && (
                            <div className="bg-muted/50 p-3 rounded">
                              <p className="text-sm font-medium mb-1">ملاحظة الإدارة:</p>
                              <p className="text-sm text-muted-foreground">{request.admin_note}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {pendingRequests.length === 0 && processedRequests.length === 0 && (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">لا توجد طلبات</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

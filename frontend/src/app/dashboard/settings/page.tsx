import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function updateProfile(formData: FormData) {
    "use server"
    const displayName = formData.get("displayName") as string
    const supabaseServer = await createClient()
    
    await supabaseServer.auth.updateUser({
      data: { display_name: displayName }
    })
    
    revalidatePath("/dashboard")
  }

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="text-zinc-400 mt-2">Manage your profile and account preferences.</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription className="text-zinc-400">Update your public facing details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address (Read Only)</label>
              <input 
                id="email" 
                value={user?.email || ""} 
                disabled 
                className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-500 cursor-not-allowed" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-zinc-300">Display Name</label>
              <input 
                id="displayName" 
                name="displayName"
                defaultValue={user?.user_metadata?.display_name || ""} 
                placeholder="Enter your name"
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
              Save Changes
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

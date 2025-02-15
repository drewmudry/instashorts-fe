'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VideosDashboard } from "./components/VideoDashboard"

export default function DashboardPage() {
  return (
    <Tabs defaultValue="videos" className="w-full">
      <TabsList>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="series">Series</TabsTrigger>
      </TabsList>
      
      <TabsContent value="videos">
        <VideosDashboard />
      </TabsContent>
      
      <TabsContent value="series">
        {/* Series content will go here */}
        <div className="p-4">
          <h2 className="text-xl font-semibold">Series management coming soon...</h2>
        </div>
      </TabsContent>
    </Tabs>
  )
}
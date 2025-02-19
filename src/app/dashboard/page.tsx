'use client';

import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import VideosDashboard from './components/VideoDashboard';

export default function DashboardPage() {
  return (
    <div className="w-full p-4">
      <Tabs defaultValue="videos" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="tweets">Tweets</TabsTrigger>
          <TabsTrigger value="reddit">Reddit</TabsTrigger>
          <TabsTrigger value="podcast">Podcast</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <VideosDashboard />
        </TabsContent>

        <TabsContent value="tweets" className="mt-4">
          <div className="rounded-lg border p-8">
            <h2 className="text-xl font-semibold">Tweet videos coming soon...</h2>
          </div>
        </TabsContent>

        <TabsContent value="reddit" className="mt-4">
          <div className="rounded-lg border p-8">
            <h2 className="text-xl font-semibold">Reddit Thread videos coming soon...</h2>
          </div>
        </TabsContent>

        <TabsContent value="podcast" className="mt-4">
          <div className="rounded-lg border p-8">
            <h2 className="text-xl font-semibold">Podcast Clip videos coming soon...</h2>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
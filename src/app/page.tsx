import { DashboardLayout } from '@/components/dashboard/layout';
import { Board } from '@/components/board/board';
import { TimeBlockSchedule } from '@/components/timeblock/time-block';
import { Notes } from '@/components/notes/notes';
import { DailyView } from '@/components/daily/daily-view-fixed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="timeblock">Time Blocks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="h-[calc(100vh-10rem)]">
          <DailyView />
        </TabsContent>
        <TabsContent value="board">
          <Board />
        </TabsContent>
        <TabsContent value="timeblock">
          <TimeBlockSchedule />
        </TabsContent>
        <TabsContent value="notes">
          <Notes />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

import ProgressRing from "@/components/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, Edit } from "lucide-react";
import Link from "next/link";

const roadmaps = [
  {
    title: 'Đại số Lớp 8',
    description: 'Bao gồm các khái niệm về phương trình, bất đẳng thức, và hàm số bậc nhất.',
    progress: 75,
    achievements: ['Chuyên gia Phương trình', 'Bậc thầy Đại số'],
  },
  {
    title: 'Hình học không gian Lớp 11',
    description: 'Khám phá các khối đa diện, mặt nón, mặt trụ, và mặt cầu.',
    progress: 40,
    achievements: ['Nhà thám hiểm 3D'],
  },
    {
    title: 'Lượng giác Lớp 10',
    description: 'Nắm vững các công thức và ứng dụng của sin, cos, tan.',
    progress: 15,
    achievements: [],
  },
];

export default function RoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-ink-white sm:text-5xl md:text-6xl">
          Lộ Trình Học Tập
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary md:text-xl">
          Theo dõi các mindmap đã lưu, hoàn thành bài học và chinh phục các thử thách để nhận huy hiệu.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roadmaps.map((roadmap, index) => (
          <Card key={index} className="rounded-2xl bg-surface/90 border border-white/5 shadow-xl flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
              <div className="flex-shrink-0">
                  <ProgressRing progress={roadmap.progress} size={60} strokeWidth={6} />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-ink-white">{roadmap.title}</CardTitle>
                <CardDescription className="text-ink-secondary mt-1">{roadmap.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold text-ink-secondary mb-2">Huy hiệu:</h4>
              <div className="flex flex-wrap gap-2">
                {roadmap.achievements.length > 0 ? (
                  roadmap.achievements.map((ach) => <Badge key={ach} className="bg-gold/20 text-gold border-none">{ach}</Badge>)
                ) : (
                  <p className="text-sm text-ink-secondary/70">Chưa có huy hiệu.</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/practice">
                <Button variant="outline" className="bg-transparent border-teal text-teal hover:bg-teal/10 hover:text-teal">
                  <BookOpen className="mr-2 size-4"/> Luyện tập
                </Button>
              </Link>
              <Link href="/mindmap/editor">
                <Button variant="ghost" className="text-ink-secondary hover:text-white">
                  <Edit className="mr-2 size-4"/> Chỉnh sửa
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

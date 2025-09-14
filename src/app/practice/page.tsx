'use client';

import { useState } from 'react';
import { generateHint } from '@/ai/flows/ai-powered-hints-practice';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressRing from "@/components/progress-ring";
import { Lightbulb, Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const problem = {
  id: 1,
  topic: 'Algebra',
  studentLevel: 8,
  question: 'Giải phương trình: 2x + 5 = 15',
  options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'],
  answer: 'x = 5',
};

export default function PracticePage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsCorrect(option === problem.answer);
  };

  const getHint = async () => {
    setIsLoadingHint(true);
    setHint(null);
    try {
        const result = await generateHint({ 
            problem: problem.question, 
            studentLevel: problem.studentLevel,
            topic: problem.topic,
        });
        setHint(result.hint);
    } catch (error) {
        console.error("Failed to get hint", error);
        setHint("Rất tiếc, đã có lỗi khi tạo gợi ý. Vui lòng thử lại.");
    } finally {
        setIsLoadingHint(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="rounded-2xl bg-surface/90 border border-white/5 shadow-xl text-center p-6">
            <h2 className="text-lg font-semibold text-ink-white mb-4">Tiến độ</h2>
            <ProgressRing progress={40} />
            <p className="text-ink-secondary mt-4 text-sm">4/10 câu hỏi</p>
          </Card>
          <Card className="mt-8 rounded-2xl bg-surface/90 border border-white/5 shadow-xl p-6">
             <Button onClick={getHint} disabled={isLoadingHint} className="w-full bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30">
                {isLoadingHint ? <Loader className="animate-spin mr-2" /> : <Lightbulb className="mr-2" />}
                {isLoadingHint ? "Đang lấy gợi ý..." : "Nhận gợi ý từ AI"}
            </Button>
            {hint && (
                 <Alert className="mt-4 bg-white/5 border-white/10 text-ink-secondary">
                    <Lightbulb className="h-4 w-4 !text-gold" />
                    <AlertTitle className="text-gold">Gợi ý:</AlertTitle>
                    <AlertDescription>
                        {hint}
                    </AlertDescription>
                </Alert>
            )}
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="rounded-2xl bg-surface/90 border border-white/5 shadow-xl">
            <CardHeader>
              <CardDescription className="text-neon-blue font-semibold">Chủ đề: {problem.topic}</CardDescription>
              <CardTitle className="text-2xl font-semibold text-ink-white pt-2">{problem.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {problem.options.map((option) => {
                  const isSelected = selectedOption === option;
                  let buttonClass = "bg-surface border border-white/20 hover:bg-violet/20";
                  if (isSelected) {
                    buttonClass = isCorrect ? "bg-teal/30 border-teal" : "bg-destructive/30 border-destructive";
                  }

                  return (
                    <Button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full h-14 justify-start p-4 text-lg rounded-lg transition-all ${buttonClass}`}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
              {selectedOption && (
                <div className="mt-6 text-center">
                    <p className={`text-xl font-bold ${isCorrect ? 'text-teal' : 'text-destructive'}`}>
                        {isCorrect ? 'Chính xác!' : 'Chưa đúng!'}
                    </p>
                    <Button className="mt-4 bg-violet hover:bg-violet/80">Câu tiếp theo</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

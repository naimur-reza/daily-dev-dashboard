import { Quote } from "lucide-react";

interface Props {
  quote: { text: string; author: string };
}

export default function QuoteWidget({ quote }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Quote className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Dev quote</h2>
      </div>

      <blockquote className="border-l-2 border-purple-500/40 pl-3">
        <p className="text-sm text-gray-300 leading-relaxed italic mb-3">{quote.text}</p>
        <footer className="text-xs text-gray-600">— {quote.author}</footer>
      </blockquote>
    </div>
  );
}

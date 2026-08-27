import React from 'react';
import { X, Sparkles, Users, MessageSquare, Heart, Share2, Award } from 'lucide-react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const communityDiscussions = [
    {
      author: 'Aria Chen, RYT-500',
      time: '2 hours ago',
      title: 'Pelvic stability cues in Virabhadrasana II vs Warrior I',
      content: 'When cueing hip alignment, focus on keeping the front knee tracking over the 2nd toe while anchoring the back foot outer edge at 45 degrees.',
      likes: 48,
      replies: 12,
    },
    {
      author: 'Devendra Sharma, Pragya Yog',
      time: '5 hours ago',
      title: 'Breath synchronization with Uddiyana Bandha in Standing poses',
      content: 'Notice how holding the isometric pose creates natural diaphragmatic lift. Keep Ujjayi breath steady and non-restricted.',
      likes: 64,
      replies: 19,
    },
    {
      author: 'Maya Lin, Somatics',
      time: '1 day ago',
      title: 'Hamstring activation heatmap insights from the 3D model',
      content: 'The 3D anatomical model helped my students visualize isometric hamstring engagement and avoid hyperextending the front knee.',
      likes: 93,
      replies: 27,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#14110e]/95 backdrop-blur-2xl border border-[#c59b27]/40 rounded-3xl p-6 text-[#F5EFE5] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#c59b27]/20">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D9AE29]" />
            <h2 className="font-display text-xl font-bold text-[#F5EFE5]">
              Pragya Community & Teacher Forum
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Discussions List */}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {communityDiscussions.map((disc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-black/40 border border-[#c59b27]/20 space-y-2 hover:border-[#D9AE29]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#D9AE29] text-[#0c0e12] font-bold text-xs flex items-center justify-center">
                    {disc.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#F5EFE5]">{disc.author}</div>
                    <div className="text-[10px] font-mono text-stone-400">{disc.time}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#c59b27]/20 text-[#D9AE29] text-[10px] font-mono font-semibold">
                  Teacher Verified
                </span>
              </div>

              <h4 className="font-bold text-xs text-[#D9AE29]">{disc.title}</h4>
              <p className="text-xs text-[#F5EFE5]/80 leading-relaxed">{disc.content}</p>

              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[11px] text-stone-400">
                <span className="flex items-center gap-1 hover:text-[#D9AE29] cursor-pointer">
                  <Heart className="w-3.5 h-3.5" />
                  {disc.likes}
                </span>
                <span className="flex items-center gap-1 hover:text-[#D9AE29] cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {disc.replies} replies
                </span>
                <span className="flex items-center gap-1 hover:text-[#D9AE29] cursor-pointer ml-auto">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#c59b27]/20 text-xs">
          <span className="text-stone-400">Join over 12,000 certified yoga teachers & practitioners</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#D9AE29] text-[#0c0e12] font-bold transition-all hover:bg-[#c59b27] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

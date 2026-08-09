import React, { useState, useEffect } from 'react';
import { useSocialMedia } from '../data/store';
import { ChevronLeft, ChevronRight, X, Play, Pause, Send } from 'lucide-react';

interface Story {
  id: string;
  userId: string;
  media: string;
  caption: string;
  timestamp: string;
}

export const Stories: React.FC = () => {
  const { users, profiles } = useSocialMedia();
  const [activeStoryGroupIndex, setActiveStoryGroupIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [replyText, setReplyText] = useState<string>('');
  const [replySuccess, setReplySuccess] = useState<boolean>(false);

  // Set up mock stories
  const mockStories: { userId: string; slides: Story[] }[] = [
    {
      userId: 'user_travel',
      slides: [
        { id: 'st_1_1', userId: 'user_travel', media: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600', caption: 'Sunrise swim in paradise! 🌅🏊‍♀️', timestamp: '2h ago' },
        { id: 'st_1_2', userId: 'user_travel', media: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&q=80&w=600', caption: 'Strolling through old Tokyo streets 🌸🎌', timestamp: '5h ago' }
      ]
    },
    {
      userId: 'user_taylor',
      slides: [
        { id: 'st_2_1', userId: 'user_taylor', media: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=600', caption: 'Rehearsals before the big show! 🎙️🎸', timestamp: '1h ago' },
        { id: 'st_2_2', userId: 'user_taylor', media: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600', caption: 'Look at this beautiful crowd tonight! 😍✨', timestamp: '4h ago' }
      ]
    },
    {
      userId: 'user_foodie',
      slides: [
        { id: 'st_3_1', userId: 'user_foodie', media: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600', caption: 'Prepping fresh tomato pasta from scratch! 🍅🍝', timestamp: '30m ago' }
      ]
    }
  ];

  // Story slide interval management
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeStoryGroupIndex !== null && isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextSlide();
            return 0;
          }
          return prev + 2; // Increment progress
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeStoryGroupIndex, activeSlideIndex, isPlaying]);

  const handleOpenGroup = (index: number) => {
    setActiveStoryGroupIndex(index);
    setActiveSlideIndex(0);
    setProgress(0);
    setIsPlaying(true);
    setReplySuccess(false);
    setReplyText('');
  };

  const handleClose = () => {
    setActiveStoryGroupIndex(null);
  };

  const handleNextSlide = () => {
    if (activeStoryGroupIndex === null) return;
    const currentGroup = mockStories[activeStoryGroupIndex];
    if (activeSlideIndex < currentGroup.slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Go to next user group if available
      if (activeStoryGroupIndex < mockStories.length - 1) {
        setActiveStoryGroupIndex(activeStoryGroupIndex + 1);
        setActiveSlideIndex(0);
        setProgress(0);
      } else {
        // End of all stories
        handleClose();
      }
    }
  };

  const handlePrevSlide = () => {
    if (activeStoryGroupIndex === null) return;
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Go to previous user group if available
      if (activeStoryGroupIndex > 0) {
        setActiveStoryGroupIndex(activeStoryGroupIndex - 1);
        const prevGroup = mockStories[activeStoryGroupIndex - 1];
        setActiveSlideIndex(prevGroup.slides.length - 1);
        setProgress(0);
      } else {
        // Already at very first story, restart progress
        setProgress(0);
      }
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsPlaying(false);
    setReplySuccess(true);
    setReplyText('');
    setTimeout(() => {
      setReplySuccess(false);
      setIsPlaying(true);
    }, 2000);
  };

  return (
    <div className="mb-6" id="stories_widget">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 font-mono">
        Active Stories
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" id="stories_list">
        {mockStories.map((group, idx) => {
          const userObj = users.find(u => u.id === group.userId);
          const profObj = profiles.find(p => p.userId === group.userId);
          
          return (
            <div 
              key={group.userId} 
              onClick={() => handleOpenGroup(idx)}
              className="flex flex-col items-center cursor-pointer shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full p-[2px] ring-2 ring-pink-500 group-hover:scale-105 transition-transform duration-200">
                <img
                  src={profObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-950"
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 mt-1.5 truncate max-w-[70px]">
                @{userObj?.username}
              </span>
            </div>
          );
        })}
      </div>

      {/* STORY MODAL OVERLAY */}
      {activeStoryGroupIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 md:p-4 transition-all" id="story_modal_backdrop">
          
          {/* Main Container */}
          <div className="relative w-full max-w-lg h-full md:h-[85vh] bg-neutral-900 rounded-none md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* Top Bar Indicators */}
            <div className="absolute top-0 inset-x-0 p-4 z-20 bg-linear-to-b from-black/80 to-transparent">
              {/* Progress bars */}
              <div className="flex gap-1 mb-3">
                {mockStories[activeStoryGroupIndex].slides.map((_, idx) => {
                  let widthStyle = 'w-0';
                  if (idx < activeSlideIndex) widthStyle = 'w-full';
                  if (idx === activeSlideIndex) widthStyle = 'active';

                  return (
                    <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                      {widthStyle === 'active' ? (
                        <div className="h-full bg-white transition-all ease-linear" style={{ width: `${progress}%` }}></div>
                      ) : (
                        <div className={`h-full bg-white ${widthStyle === 'w-full' ? 'w-full' : 'w-0'}`}></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* User details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={profiles.find(p => p.userId === mockStories[activeStoryGroupIndex].userId)?.avatar}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <p className="text-white text-xs font-bold">
                      {profiles.find(p => p.userId === mockStories[activeStoryGroupIndex].userId)?.fullName}
                    </p>
                    <p className="text-white/60 text-[10px]">
                      {mockStories[activeStoryGroupIndex].slides[activeSlideIndex].timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 text-white/80 hover:text-white cursor-pointer bg-black/25 rounded-full">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={handleClose} className="p-1.5 text-white/80 hover:text-white cursor-pointer bg-black/25 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Click Fields (Left & Right halves of screen) */}
            <div className="absolute inset-y-16 inset-x-0 z-10 flex">
              <div onClick={handlePrevSlide} className="w-1/3 h-full cursor-w-resize" title="Previous Slide"></div>
              <div onClick={() => setIsPlaying(!isPlaying)} className="w-1/3 h-full cursor-pointer"></div>
              <div onClick={handleNextSlide} className="w-1/3 h-full cursor-e-resize" title="Next Slide"></div>
            </div>

            {/* Central Media Canvas */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              <img
                src={mockStories[activeStoryGroupIndex].slides[activeSlideIndex].media}
                alt="story_media"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover max-h-full"
              />
              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-linear-to-t from-black/90 via-black/40 to-transparent text-center z-20">
                <p className="text-white text-sm font-semibold tracking-wide px-4">
                  {mockStories[activeStoryGroupIndex].slides[activeSlideIndex].caption}
                </p>
              </div>
            </div>

            {/* Bottom Form for Reply */}
            <div className="p-4 bg-black border-t border-white/10 z-20">
              {replySuccess ? (
                <div className="py-2.5 px-4 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-center text-xs font-semibold animate-bounce">
                  Story reply delivered to inbox! ✉️🚀
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Send a private reply..."
                    className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500 placeholder:text-white/40"
                  />
                  <button 
                    type="submit" 
                    className="p-2.5 bg-linear-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white rounded-full cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Next / Prev Desktop Side Buttons */}
            <button 
              onClick={handlePrevSlide} 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNextSlide} 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

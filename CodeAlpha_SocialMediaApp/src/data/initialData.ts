import { User, Profile, Post, Like, Comment, Follow, Notification, Message, SavedPost, Report, ActivityLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    email: 'admin@bharattoday.in',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    isBlocked: false,
  },
  {
    id: 'user_taylor',
    username: 'virat_kohli',
    email: 'virat@kohli.in',
    role: 'user',
    createdAt: '2026-01-10T12:00:00Z',
    isBlocked: false,
  },
  {
    id: 'user_tech',
    username: 'kevin',
    email: 'kevin@bharattoday.in',
    role: 'user',
    createdAt: '2026-02-14T09:30:00Z',
    isBlocked: false,
  },
  {
    id: 'user_travel',
    username: 'delhi_explorer',
    email: 'priya@exploreindia.com',
    role: 'user',
    createdAt: '2026-03-01T15:45:00Z',
    isBlocked: false,
  },
  {
    id: 'user_foodie',
    username: 'ranveer_kitchen',
    email: 'chef.ranveer@brar.in',
    role: 'user',
    createdAt: '2026-03-20T18:20:00Z',
    isBlocked: false,
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    userId: 'user_admin',
    fullName: 'BharatToday Team',
    bio: 'Official Platform Admin & Support. Keeping the Indian internet safe and positive. 🇮🇳✨',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    website: 'admin.bharattoday.in',
    isVerified: true
  },
  {
    userId: 'user_taylor',
    fullName: 'Virat Kohli',
    bio: 'Official profile. For the love of cricket, sportsmanship, and fitness. Proud to represent India! 🇮🇳🏏 #TeamIndia',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    cover: 'https://images.unsplash.com/photo-1540747737956-378724044432?auto=format&fit=crop&q=80&w=800',
    phone: '+91 99887 76655',
    location: 'Mumbai, India',
    website: 'viratkohli.com',
    isVerified: true
  },
  {
    userId: 'user_tech',
    fullName: 'Kevin',
    bio: 'Indian Tech Enthusiast & Digital Content Curator. Checking out the latest national updates and trending topics on BharatToday! 🇮🇳🏏💻 #DigitalIndia #Tech',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    cover: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800',
    phone: '+91 98234 56789',
    location: 'Bengaluru, India',
    website: 'kevin.bharat.in',
    isVerified: true
  },
  {
    userId: 'user_travel',
    fullName: 'Priya Sharma',
    bio: 'Architect, travel blogger, and heritage preservationist. Mapping out the majestic forts of Rajasthan & hidden cafes of Delhi! 🏰🍛✈️ #IncredibleIndia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
    phone: '+91 91122 33445',
    location: 'Jaipur, Rajasthan',
    website: 'explorewithpriya.in',
    isVerified: false
  },
  {
    userId: 'user_foodie',
    fullName: 'Ranveer Brar',
    bio: 'Masterchef India Host. Food is not just eating, it is a memory. Celebrating Indian street food, royal cuisines, and modern masterclasses. 🌶️🍲',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=150',
    cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    phone: '+91 95555 44332',
    location: 'Lucknow, Uttar Pradesh',
    website: 'ranveerbrar.com',
    isVerified: true
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    userId: 'user_tech',
    caption: 'Absolutely mind-blowing to see India’s UPI hitting a brand-new monthly transaction record of 15 Billion transactions! 🚀 The scale of digital payments here is unmatched globally. Proud to see how technology is transforming street vendors to large showrooms alike! 💻🇮🇳 #DigitalIndia #Fintech #UPI #Tech #IndiaToday',
    media: [
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600'
    ],
    hashtags: ['digitalindia', 'fintech', 'upi', 'tech', 'indiatoday'],
    location: 'Bengaluru, India',
    visibility: 'public',
    createdAt: '2026-07-11T14:30:00Z',
    isPinned: true
  },
  {
    id: 'post_2',
    userId: 'user_travel',
    caption: 'Woke up at 5 AM to witness the majestic sunrise at the Taj Mahal, Agra. The morning mist rising over the Yamuna river paired with this architectural wonder is pure poetry. 🌅✨ Truly incredible India! #travel #tajmahal #incredibleindia #agra #heritage',
    media: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=600'
    ],
    hashtags: ['travel', 'tajmahal', 'incredibleindia', 'agra', 'heritage'],
    location: 'Agra, Uttar Pradesh, India',
    visibility: 'public',
    createdAt: '2026-07-12T08:15:00Z',
    isPinned: false
  },
  {
    id: 'post_3',
    userId: 'user_taylor',
    caption: 'An unforgettable night! 🇮🇳🏏 Playing in front of a packed stadium of 130,000 screaming fans at Ahmedabad. Your energy, your cheers, and your chants are what keep us fighting till the very last ball. This victory is for India! Thank you for the unconditional love! 🙌 #cricket #india # Ahmedabad #victory #grateful',
    media: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1540747737956-378724044432?auto=format&fit=crop&q=80&w=600'
    ],
    hashtags: ['cricket', 'india', 'ahmedabad', 'victory', 'grateful'],
    location: 'Narendra Modi Stadium, Ahmedabad',
    visibility: 'public',
    createdAt: '2026-07-12T21:00:00Z',
    isPinned: false
  },
  {
    id: 'post_4',
    userId: 'user_foodie',
    caption: 'Sunday slow-cooking my absolute favorite: Lucknowi Galouti Kebabs! 🤤 Slow-melt-in-the-mouth lamb infused with 15 royal spices, served on a crisp saffron paratha with fresh mint chutney. The culinary heritage of Awadh is unmatched! Recipe link is in my bio! 🌶️👨‍🍳 #indianfood #chef #delicious #kebab #lucknow',
    media: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600'
    ],
    hashtags: ['indianfood', 'chef', 'delicious', 'kebab', 'lucknow'],
    location: 'Lucknow, India',
    visibility: 'public',
    createdAt: '2026-07-12T10:00:00Z',
    isPinned: false
  }
];

export const INITIAL_FOLLOWS: Follow[] = [
  // tech follows taylor, travel, foodie
  { id: 'f1', followerId: 'user_tech', followingId: 'user_taylor' },
  { id: 'f2', followerId: 'user_tech', followingId: 'user_travel' },
  { id: 'f3', followerId: 'user_tech', followingId: 'user_foodie' },
  // travel follows tech, taylor
  { id: 'f4', followerId: 'user_travel', followingId: 'user_tech' },
  { id: 'f5', followerId: 'user_travel', followingId: 'user_taylor' },
  // foodie follows tech, travel
  { id: 'f6', followerId: 'user_foodie', followingId: 'user_tech' },
  { id: 'f7', followerId: 'user_foodie', followingId: 'user_travel' },
  // taylor follows tech (mutual connection check!)
  { id: 'f8', followerId: 'user_taylor', followingId: 'user_tech' }
];

export const INITIAL_LIKES: Like[] = [
  { id: 'l1', userId: 'user_travel', postId: 'post_1' },
  { id: 'l2', userId: 'user_foodie', postId: 'post_1' },
  { id: 'l3', userId: 'user_taylor', postId: 'post_1' },
  { id: 'l4', userId: 'user_tech', postId: 'post_2' },
  { id: 'l5', userId: 'user_foodie', postId: 'post_2' },
  { id: 'l6', userId: 'user_tech', postId: 'post_3' },
  { id: 'l7', userId: 'user_travel', postId: 'post_3' },
  { id: 'l8', userId: 'user_foodie', postId: 'post_3' },
  { id: 'l9', userId: 'user_tech', postId: 'post_4' }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    userId: 'user_travel',
    postId: 'post_1',
    content: 'This looks super inspiring, Kevin! Digital public infrastructure in India is truly setting global standards.',
    createdAt: '2026-07-11T15:00:00Z',
    likes: ['user_tech']
  },
  {
    id: 'c2',
    userId: 'user_tech',
    postId: 'post_1',
    parentId: 'c1', // Nested Reply!
    content: 'Thank you, Priya! Absolutely, the scale is mind-boggling.',
    createdAt: '2026-07-11T15:15:00Z',
    likes: []
  },
  {
    id: 'c3',
    userId: 'user_foodie',
    postId: 'post_1',
    content: 'Completely agree! UPI has even made buying spices at local mandis so seamless.',
    createdAt: '2026-07-11T16:45:00Z',
    likes: []
  },
  {
    id: 'c4',
    userId: 'user_tech',
    postId: 'post_2',
    content: 'Wow, the Taj Mahal looks absolutely gorgeous in this morning light, Priya! Added Agra to my road-trip list.',
    createdAt: '2026-07-12T09:00:00Z',
    likes: ['user_travel']
  }
];

export const INITIAL_SAVED_POSTS: SavedPost[] = [
  { id: 's1', userId: 'user_tech', postId: 'post_2' },
  { id: 's2', userId: 'user_tech', postId: 'post_4' }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'user_tech',
    senderId: 'user_taylor',
    type: 'follow',
    isRead: false,
    createdAt: '2026-07-12T22:30:00Z'
  },
  {
    id: 'n2',
    userId: 'user_tech',
    senderId: 'user_travel',
    type: 'like',
    postId: 'post_1',
    isRead: false,
    createdAt: '2026-07-11T14:45:00Z'
  },
  {
    id: 'n3',
    userId: 'user_tech',
    senderId: 'user_travel',
    type: 'comment',
    postId: 'post_1',
    isRead: true,
    createdAt: '2026-07-11T15:00:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'user_travel',
    receiverId: 'user_tech',
    content: 'Hi Kevin! I saw your post on UPI and tech. Incredible analysis!',
    isRead: true,
    createdAt: '2026-07-12T10:00:00Z'
  },
  {
    id: 'm2',
    senderId: 'user_tech',
    receiverId: 'user_travel',
    content: 'Hey Priya! Thank you so much. I spent all weekend reading the latest fintech reports!',
    isRead: true,
    createdAt: '2026-07-12T10:05:00Z'
  },
  {
    id: 'm3',
    senderId: 'user_travel',
    receiverId: 'user_tech',
    content: 'It definitely shows! By the way, are you attending the Bengaluru Tech Summit next month?',
    isRead: false,
    createdAt: '2026-07-12T10:12:00Z'
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'r1',
    reporterId: 'user_foodie',
    targetType: 'post',
    targetId: 'post_3',
    reason: 'spam',
    createdAt: '2026-07-12T21:30:00Z',
    status: 'pending'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'al1', userId: 'user_tech', action: 'Logged in securely via Session Auth', timestamp: '2026-07-12T14:00:00Z' },
  { id: 'al2', userId: 'user_tech', action: 'Created Post: post_1 with media assets', timestamp: '2026-07-11T14:30:00Z' },
  { id: 'al3', userId: 'user_travel', action: 'Followed user tech_guru', timestamp: '2026-07-11T13:10:00Z' },
  { id: 'al4', userId: 'user_taylor', action: 'Updated profile bio and cover photo', timestamp: '2026-07-12T20:45:00Z' }
];

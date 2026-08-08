// Mock Database for Obsidias Conversation Inbox
// Stores in-memory conversation threads and messages, simulating a real database.

export interface Message {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  sentAt: string;
  isAi: boolean;
  isHuman: boolean;
  channel: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  leadName: string;
  leadInitials: string;
  score: number;
  bucket: "hot" | "warm" | "cold";
  status: "ai" | "human";
  channel: "whatsapp" | "sms" | "email" | "instagram_dm";
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  avatarBg?: string;
  avatarColor?: string;
  messages: Message[];
}

// Global in-memory instance to persist across API requests
if (!(global as any).MOCK_CONVERSATIONS) {
  (global as any).MOCK_CONVERSATIONS = [
    {
      id: "1",
      leadId: "lead_001",
      leadName: "Ahmed Al-Khalidi",
      leadInitials: "AK",
      score: 84,
      bucket: "hot",
      status: "ai",
      channel: "whatsapp",
      lastMessage: "Are both of those units available to view this week?",
      lastMessageAt: "2m ago",
      unread: true,
      avatarBg: "#2A1030",
      avatarColor: "#C77DFF",
      messages: [
        { id: "m1", direction: "outbound", content: "Hi Ahmed, I'm Alex from Obsidias Properties. I saw you're interested in a 2BR in Dubai Marina around AED 1.8M — that's a great area. Are you looking to buy in the next few months?", sentAt: "11:04 AM", isAi: true, isHuman: false, channel: "whatsapp" },
        { id: "m2", direction: "inbound", content: "Yes exactly, we're aiming for Q3 this year. We have a budget up to 2M.", sentAt: "11:09 AM", isAi: false, isHuman: false, channel: "whatsapp" },
        { id: "m3", direction: "outbound", content: "Perfect timing — Q3 inventory in Marina is moving fast. I have two units that match your brief: a 1,240 sqft corner unit on the 18th floor and a 1,180 sqft with a sea view on the 22nd. Both are priced within your range.", sentAt: "11:11 AM", isAi: true, isHuman: false, channel: "whatsapp" },
        { id: "m4", direction: "inbound", content: "That sounds interesting. Are both of those units available to view this week?", sentAt: "11:14 AM", isAi: false, isHuman: false, channel: "whatsapp" }
      ]
    },
    {
      id: "2",
      leadId: "lead_002",
      leadName: "Sara Rashid",
      leadInitials: "SR",
      score: 62,
      bucket: "warm",
      status: "human",
      channel: "sms",
      lastMessage: "I'd prefer to speak with someone directly actually",
      lastMessageAt: "14m ago",
      unread: true,
      avatarBg: "var(--bg-success)",
      avatarColor: "var(--text-success)",
      messages: [
        { id: "m5", direction: "outbound", content: "Hi Sara, this is Alex from Obsidias Properties. You recently enquired about villas in Riyadh — are you looking to buy or rent?", sentAt: "10:52 AM", isAi: true, isHuman: false, channel: "sms" },
        { id: "m6", direction: "inbound", content: "Buy. We need at least 4 bedrooms.", sentAt: "10:58 AM", isAi: false, isHuman: false, channel: "sms" },
        { id: "m7", direction: "outbound", content: "Got it. What's your approximate budget range? That will help me pull the right options for you.", sentAt: "11:01 AM", isAi: true, isHuman: false, channel: "sms" },
        { id: "m8", direction: "inbound", content: "I'd prefer to speak with someone directly actually.", sentAt: "11:06 AM", isAi: false, isHuman: false, channel: "sms" },
        { id: "m9", direction: "outbound", content: "Of course — I've flagged this for one of our senior advisors. You'll receive a call within the next 30 minutes. Is there a better number to reach you on?", sentAt: "11:06 AM", isAi: false, isHuman: true, channel: "sms" }
      ]
    },
    {
      id: "3",
      leadId: "lead_003",
      leadName: "Mohammed Fahad",
      leadInitials: "MF",
      score: 31,
      bucket: "cold",
      status: "ai",
      channel: "email",
      lastMessage: "Thanks for reaching out. I'll have a look.",
      lastMessageAt: "1h ago",
      unread: false,
      avatarBg: "var(--bg-accent)",
      avatarColor: "var(--text-accent)",
      messages: [
        { id: "m10", direction: "outbound", content: "Hi Mohammed, I noticed you downloaded our Riyadh market guide last week. Are you currently exploring property options in the area?", sentAt: "09:30 AM", isAi: true, isHuman: false, channel: "email" },
        { id: "m11", direction: "inbound", content: "Thanks for reaching out. I'll have a look at what you sent.", sentAt: "10:15 AM", isAi: false, isHuman: false, channel: "email" }
      ]
    },
    {
      id: "4",
      leadId: "lead_004",
      leadName: "Lina Al-Sayed",
      leadInitials: "LS",
      score: 77,
      bucket: "hot",
      status: "ai",
      channel: "instagram_dm",
      lastMessage: "What's the service charge situation on those?",
      lastMessageAt: "32m ago",
      unread: false,
      avatarBg: "#1A0830",
      avatarColor: "#A78BFA",
      messages: [
        { id: "m12", direction: "outbound", content: "Hi Lina! Thanks for reaching out via Instagram. I saw you're interested in apartments in Jeddah — any particular area or size you have in mind?", sentAt: "10:28 AM", isAi: true, isHuman: false, channel: "instagram_dm" },
        { id: "m13", direction: "inbound", content: "Looking at Corniche area, 2–3 bedrooms. Investment purposes mainly.", sentAt: "10:35 AM", isAi: false, isHuman: false, channel: "instagram_dm" },
        { id: "m14", direction: "outbound", content: "Smart pick — Corniche has had strong rental yield over the past 18 months. I can share a few units with solid ROI. Budget range?", sentAt: "10:37 AM", isAi: true, isHuman: false, channel: "instagram_dm" },
        { id: "m15", direction: "inbound", content: "Up to 1.5M SAR. What's the service charge situation on those?", sentAt: "10:44 AM", isAi: false, isHuman: false, channel: "instagram_dm" }
      ]
    },
    {
      id: "5",
      leadId: "lead_005",
      leadName: "Tariq Mansour",
      leadInitials: "TM",
      score: 45,
      bucket: "warm",
      status: "ai",
      channel: "sms",
      lastMessage: "Let me check with my wife and get back to you",
      lastMessageAt: "2h ago",
      unread: false,
      avatarBg: "var(--bg-success)",
      avatarColor: "var(--text-success)",
      messages: [
        { id: "m16", direction: "outbound", content: "Hi Tariq, following up on your enquiry about townhouses in Al Olaya. Have you had a chance to review the brochure I sent over?", sentAt: "08:45 AM", isAi: true, isHuman: false, channel: "sms" },
        { id: "m17", direction: "inbound", content: "Yes I had a look. The prices are a bit above what we planned.", sentAt: "09:10 AM", isAi: false, isHuman: false, channel: "sms" },
        { id: "m18", direction: "outbound", content: "Understood — there are a couple of options slightly below that range that still tick most of your boxes. Would it help if I put together a shortlist?", sentAt: "09:13 AM", isAi: true, isHuman: false, channel: "sms" },
        { id: "m19", direction: "inbound", content: "Let me check with my wife and get back to you.", sentAt: "09:20 AM", isAi: false, isHuman: false, channel: "sms" }
      ]
    }
  ];
}

export const mockConversations: Conversation[] = (global as any).MOCK_CONVERSATIONS;

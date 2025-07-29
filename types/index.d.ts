interface WordStore {
  id: number;
  word: string;
  content: string;
  parsedword: string;
  source: string;
}

interface Group {
  id: number;
  name: string;
  words: Array<Omit<WordStore, "id">>;
  user_id: string | null;
  synced?: boolean;
  is_deleted?: boolean;
  is_boosted: boolean;
  created_at: string;
  is_publish?: boolean;
  description?: string;
  series_id?: number;
  series?: Series;
}

interface Series {
  id: number;
  name: string;
  description: string;
  user_id: string;
  is_boosted: boolean;
}

/**
 * Represents the type of item being stored as a notification.
 * Can be a simple string, or a more complex object.
 * Re-exported for convenience if used with the store.
 */
type NotificationItem = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

/**
 * Represents a scheduled notification item, wrapping a payload with scheduling details.
 * @template P The type of the payload. Defaults to `NotificationItem`.
 */
interface ScheduledNotificationItem<P = NotificationItem> {
  id: string; // Unique identifier for the item
  payload: P; // The actual content/data
  scheduledTimestamp: number; // Unix timestamp (milliseconds) for the notification
}

/**
 * Defines the state structure and actions for the notification store.
 * @template T The type of the notification item.
 */
interface NotificationStoreState<T = ScheduledNotificationItem> {
  // Changed default T
  dailyNotifications: { [dateString: string]: T[] }; // Changed from Map to object
  maxNotificationsPerDay: number;

  // Actions
  setMaxNotificationsPerDay: (limit: number) => void;
  clearAllNotifications: () => Promise<void>;
  setupScheduledNotifications: (groups: number[]) => Promise<void>;
}

type GameHistory = {
  id: number;
  score: number;
  created_at: string;
  message: string;
  user_id?: string;
  group_id?: number;
  status?: "PENDING" | "FINISHED";
  group?: Group;
};

type IPAChar = {
  sound: string;
  type: "consonant" | "diphthong" | "vowel";
  practice_words: string[];
  url: string;
};

type IPABoard = {
  vowels: IPAChar[];
  consonants: IPAChar[];
};

type Energy = {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  energy: number;
  suggestion: number;
};

type GameType =
  | "ChooseCorrect"
  | "SortCharacterGame"
  | "TypeCorrectFromVoice"
  | "SpeakAndCompare"
  | "SpeakAndCompareIPA";

type PlayerRank = {
  id: number;
  user_id: string;
  total_score: number;
  rank: number;
  name: string;
  avatar: string;
};

type UserInfo = {
  id: number;
  user_id: string;
  total_score: number;
  name: string;
  avatar: string;
  is_premium: boolean;
  created_at: string;
};

type VowelPercent = {
  user_id: string;
  char: string;
  percent: number;
  created_at: string;
};

type Updater<T = any> = (data?: T) => T;

type ParseHTMLElement = {
  type: string;
  tag: string;
  attributes: Record<string, string>;
  children: ParseHTMLElement[];
  content?: string;
};

type NotificationDB = {
  id: number;
  created_at: string;
  content: string;
  title: string;
};

type ReportGroup = {
  id: number;
  user_id: string;
  group_id: string;
  description: string;
  created_at: string;
};

type SocialUser = {
  id: number;
  user_id: string;
  created_at: string;
  name: string;
  avatar: string;
  wordlet_user_id: string;
  categories: string;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  params: Record<string, any>;
  user_info?: SocialUser;
};

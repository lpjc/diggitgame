export type InitResponse = {
  type: 'init';
  postId: string;
  postType: 'typeA' | 'typeB';
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type DataFeedResponse = {
  posts: PostSummary[];
  subredditInfo: SubredditInfo;
  userData?: UserData;
};

export type UserActionRequest = {
  action: 'create-post' | 'create-comment';
  data: UserPostRequest | UserCommentRequest;
  consent: boolean;
};

export type UserActionResponse = {
  success: boolean;
  id?: string;
  error?: string;
};

export type UserPostRequest = {
  title: string;
  content: string;
  subredditName: string;
  postType?: 'typeA' | 'typeB';
};

export type UserCommentRequest = {
  postId: string;
  text: string;
};

export type PostSummary = {
  id: string;
  title: string;
  author: string;
  score: number;
  createdAt: number;
};

export type SubredditInfo = {
  name: string;
  subscribers: number;
  description: string;
};

export type UserData = {
  username: string;
  karma: number;
  createdAt: number;
};

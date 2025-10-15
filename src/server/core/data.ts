import { reddit, context } from '@devvit/web/server';
import { DataFeedResponse, PostSummary, SubredditInfo, UserData } from '../../shared/types/api';

export const getDataFeed = async (): Promise<DataFeedResponse> => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  try {
    let postsResult;
    try {
      postsResult = await reddit.getHotPosts({ subredditName, limit: 10 });
    } catch (err) {
      console.error('Error fetching hot posts:', err);
      postsResult = [];
    }

    const [subredditInfo, username] = await Promise.all([
      reddit.getSubredditInfoByName(subredditName),
      reddit.getCurrentUsername(),
    ]);

    console.log('Posts result type:', typeof postsResult, 'Is array:', Array.isArray(postsResult));
    
    // Handle both array and object with children property
    const posts = Array.isArray(postsResult) ? postsResult : [];
    
    const postSummaries: PostSummary[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.authorName ?? 'unknown',
      score: post.score,
      createdAt: post.createdAt.getTime(),
    }));

    const subredditData: SubredditInfo = {
      name: subredditInfo.name,
      subscribers: subredditInfo.numberOfSubscribers ?? 0,
      description: subredditInfo.description ?? '',
    };

    let userData: UserData | undefined;
    if (username) {
      const user = await reddit.getUserByUsername(username);
      userData = {
        username: user.username,
        karma: user.linkKarma + user.commentKarma,
        createdAt: user.createdAt.getTime(),
      };
    }

    return {
      posts: postSummaries,
      subredditInfo: subredditData,
      userData,
    };
  } catch (error) {
    console.error('Error fetching data feed:', error);
    throw error;
  }
};

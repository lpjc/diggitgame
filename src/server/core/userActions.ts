import { reddit } from '@devvit/web/server';
import { UserPostRequest, UserCommentRequest } from '../../shared/types/api';

export const createUserPost = async (request: UserPostRequest) => {
  if (!request.title || !request.content || !request.subredditName) {
    throw new Error('Title, content, and subredditName are required');
  }

  return await reddit.submitPost({
    runAs: 'USER',
    userGeneratedContent: {
      text: request.content,
    },
    subredditName: request.subredditName,
    title: request.title,
    splash: {
      appDisplayName: 'User Generated Post',
      heading: 'User Created Content',
      description: 'A post created by a user',
      buttonLabel: 'View Post',
      entryUri: request.postType === 'typeB' ? 'typeB.html' : 'typeA.html',
    },
  });
};

export const createUserComment = async (request: UserCommentRequest) => {
  if (!request.postId || !request.text) {
    throw new Error('PostId and text are required');
  }

  return await reddit.submitComment({
    runAs: 'USER',
    postId: request.postId,
    text: request.text,
  });
};

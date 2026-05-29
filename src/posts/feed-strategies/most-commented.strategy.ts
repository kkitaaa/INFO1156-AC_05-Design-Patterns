import { PostEntity } from '../entities/post.entity';
import { FeedStrategy } from './feed-strategy.interface';

export class MostCommentedStrategy implements FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[] {
    return [...posts].sort((a, b) => {
      const countA = a.commentsCount || 0;
      const countB = b.commentsCount || 0;
      return countB - countA;
    });
  }
}
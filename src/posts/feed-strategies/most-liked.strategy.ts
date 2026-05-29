import { PostEntity } from '../entities/post.entity';
import { FeedStrategy } from './feed-strategy.interface';

export class MostLikedStrategy implements FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[] {
    return [...posts].sort((a, b) => {
      const countA = a.likesCount || 0;
      const countB = b.likesCount || 0;
      return countB - countA;
    });
  }
}
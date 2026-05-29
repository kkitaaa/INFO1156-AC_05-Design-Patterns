import { PostEntity } from '../entities/post.entity';
import { FeedStrategy } from './feed-strategy.interface';

export class MostLikedStrategy implements FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[] {
    return [...posts].sort((a, b) => {
      const countA = (a as any).likes?.length || (a as any)._count?.likes || 0;
      const countB = (b as any).likes?.length || (b as any)._count?.likes || 0;
      return countB - countA;
    });
  }
}
import { PostEntity } from '../entities/post.entity';
import { FeedStrategy } from './feed-strategy.interface';

export class MostCommentedStrategy implements FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[] {
    return [...posts].sort((a, b) => {
      const countA = (a as any).comments?.length || (a as any)._count?.comments || 0;
      const countB = (b as any).comments?.length || (b as any)._count?.comments || 0;
      return countB - countA;
    });
  }
}
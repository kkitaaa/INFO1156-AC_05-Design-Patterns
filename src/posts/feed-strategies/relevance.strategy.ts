import { PostEntity } from '../entities/post.entity';
import { FeedStrategy } from './feed-strategy.interface';

export class RelevanceStrategy implements FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[] {
    return [...posts].sort((a, b) => {
      const likesA = (a as any).likes?.length || (a as any)._count?.likes || 0;
      const commentsA = (a as any).comments?.length || (a as any)._count?.comments || 0;
      const scoreA = likesA * 2 + commentsA;

      const likesB = (b as any).likes?.length || (b as any)._count?.likes || 0;
      const commentsB = (b as any).comments?.length || (b as any)._count?.comments || 0;
      const scoreB = likesB * 2 + commentsB;

      return scoreB - scoreA;
    });
  }
}
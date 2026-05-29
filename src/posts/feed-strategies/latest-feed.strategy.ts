import { PostEntity } from '../entities/post.entity';
import { FeedStrategy } from './feed-strategy.interface';

export class LatestFeedStrategy implements FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[] {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
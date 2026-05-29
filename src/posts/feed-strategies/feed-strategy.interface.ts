import { PostEntity } from '../entities/post.entity';

export interface FeedStrategy {
  sort(posts: PostEntity[]): PostEntity[];
}
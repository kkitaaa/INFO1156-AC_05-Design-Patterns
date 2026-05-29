import { Injectable } from '@nestjs/common';
import { FeedStrategy } from './feed-strategy.interface';
import { LatestFeedStrategy } from './latest-feed.strategy';
import { MostLikedStrategy } from './most-liked.strategy';
import { MostCommentedStrategy } from './most-commented.strategy';
import { RelevanceStrategy } from './relevance.strategy';

@Injectable()
export class FeedStrategyFactory {
  getStrategy(mode: string): FeedStrategy {
    switch (mode?.toLowerCase()) {
      case 'latest':
        return new LatestFeedStrategy();
      case 'most_liked':
      case 'liked':
        return new MostLikedStrategy();
      case 'most_commented':
      case 'commented':
        return new MostCommentedStrategy();
      case 'relevance':
        return new RelevanceStrategy();
      default:
        // Estrategia por defecto exigida por buenas prácticas
        return new LatestFeedStrategy();
    }
  }
}
import { BadRequestException } from "@nestjs/common";
import { CreatePostDto } from "@/posts/posts.dtos";
import { PostValidator } from "./post-validator.interface";

export class ProfanityValidator extends PostValidator {
  private forbiddenWords = ["ofensivo", "badword", "inapropiado"];

  protected validate(dto: CreatePostDto): void {
    const lowerTitle = dto.title.toLowerCase();
    const containsProfanity = this.forbiddenWords.some(word => lowerTitle.includes(word));
    if (containsProfanity) {
      throw new BadRequestException("Post contains inappropriate language");
    }
  }
}
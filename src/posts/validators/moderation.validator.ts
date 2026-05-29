import { BadRequestException } from "@nestjs/common";
import { CreatePostDto } from "@/posts/posts.dtos";
import { PostValidator } from "./post-validator.interface";

export class ModerationValidator extends PostValidator {
  protected validate(dto: CreatePostDto): void {
    if (!dto.imageUrl || !dto.imageUrl.startsWith("http")) {
      throw new BadRequestException("Image URL must start with http");
    }
  }
}
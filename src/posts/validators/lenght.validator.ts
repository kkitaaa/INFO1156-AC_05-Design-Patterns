import { BadRequestException } from "@nestjs/common";
import { CreatePostDto } from "@/posts/posts.dtos";
import { PostValidator } from "./post-validator.interface";

export class LengthValidator extends PostValidator {
  protected validate(dto: CreatePostDto): void {
    if (!dto.title || dto.title.trim() === "") {
      throw new BadRequestException("Title cannot be empty");
    }
    if (dto.title.length < 3 || dto.title.length > 120) {
      throw new BadRequestException("Title length must be between 3 and 120");
    }
  }
}
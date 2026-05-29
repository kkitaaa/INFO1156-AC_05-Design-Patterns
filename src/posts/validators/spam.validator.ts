import { BadRequestException } from "@nestjs/common";
import { CreatePostDto } from "@/posts/posts.dtos";
import { PostValidator } from "./post-validator.interface";

export class SpamValidator extends PostValidator {
  protected validate(dto: CreatePostDto): void {
    const upperCaseLetters = dto.title.replace(/[^A-Z]/g, "").length;
    if (upperCaseLetters > dto.title.length * 0.7 && dto.title.length > 10) {
      throw new BadRequestException("Post rejected: Too many capital letters (Spam)");
    }
  }
}
import { CreatePostDto } from "@/posts/posts.dtos";

export abstract class PostValidator {
  private nextValidator?: PostValidator;

  setNext(validator: PostValidator): PostValidator {
    this.nextValidator = validator;
    return validator;
  }

  async handle(dto: CreatePostDto): Promise<void> {
    await this.validate(dto);
    if (this.nextValidator) {
      await this.nextValidator.handle(dto);
    }
  }

  protected abstract validate(dto: CreatePostDto): Promise<void> | void;
}
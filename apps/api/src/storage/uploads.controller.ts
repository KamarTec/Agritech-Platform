import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { StorageService } from './storage.service'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_PREFIXES = ['avatars', 'farms', 'listings', 'campaigns']

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE_BYTES } }))
  async uploadImage(
    @UploadedFile() file?: Express.Multer.File,
    @Query('purpose') purpose?: string
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Please attach an image (field name: file)')
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WEBP, or HEIC images are supported')
    }
    const prefix = ALLOWED_PREFIXES.includes(purpose ?? '') ? (purpose as string) : 'misc'
    const url = await this.storage.uploadImage(file.buffer, file.mimetype, prefix)
    return { url }
  }
}

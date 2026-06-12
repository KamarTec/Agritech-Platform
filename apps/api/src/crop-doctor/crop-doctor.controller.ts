import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CropDiagnosis } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CropDoctorService, DiagnosisResult } from './crop-doctor.service'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE_BYTES = 8 * 1024 * 1024 // 8 MB

@Controller('crop-doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('FARMER')
export class CropDoctorController {
  constructor(private readonly cropDoctorService: CropDoctorService) {}

  @Post('diagnose')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX_SIZE_BYTES } }))
  diagnose(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<DiagnosisResult> {
    if (!file) {
      throw new BadRequestException('Please upload a photo of the crop (field name: image)')
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WEBP, or HEIC images are supported')
    }
    return this.cropDoctorService.diagnose(user.sub, file.buffer, file.mimetype)
  }

  @Get('history')
  history(
    @CurrentUser() user: JwtPayload
  ): Promise<{ items: CropDiagnosis[]; remainingThisMonth: number }> {
    return this.cropDoctorService.history(user.sub)
  }
}

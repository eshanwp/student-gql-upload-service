import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: any,
  ) {
    console.log(data);
    console.log(file);
    return await this.uploadService.addToQueue(file);
  }
}


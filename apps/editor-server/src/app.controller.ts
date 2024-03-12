import {
  Body,
  Controller,
  Get,
  // HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { gltf_transform } from './gltf_transform';

class SampleDto {
  name: string;
  path: string;
}

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  // @HttpCode(201)
  async uploadFile(
    @Body() body: SampleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    gltf_transform(Uint8Array.from(file.buffer), body.path);

    return {
      body,
      file: file.buffer.toString(),
    };
  }
}

import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Get()
  serveHtml(@Res() res: Response) {
    return res.sendFile('index.html', { root: './frontend' }); // Path to your HTML file in the 'public' folder
  }
}

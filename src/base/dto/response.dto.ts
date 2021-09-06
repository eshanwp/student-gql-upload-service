import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
  @ApiProperty()
  success = true;

  @ApiProperty()
  message = 'Operation Successfully.';

  @ApiProperty()
  details: string;

  @ApiProperty()
  data: any;

  constructor(success: boolean, message: string, details: string, data: any) {
    this.success = success;
    this.message = message;
    this.details = details;
    this.data = data;
  }
}

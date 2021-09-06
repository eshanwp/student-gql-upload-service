import { SetMetadata } from '@nestjs/common';

export const Licenses = (licenses: string) => SetMetadata('licenses', licenses);

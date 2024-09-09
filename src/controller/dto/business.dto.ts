import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BusinessDto {
  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsNumber()
  quantity?: string;
}

@Injectable()
export class PaginationTransformPipe implements PipeTransform {
    async transform(dto: BusinessDto, { metatype }: ArgumentMetadata) {
        if (!metatype) {
            return dto;
        }

        return plainToInstance(metatype, dto);
    }
}
import { Controller, Param, Get, Query } from '@nestjs/common';
import { BusinessDto, PaginationTransformPipe } from './dto/business.dto';
import { GetProducstUseCase } from '../domain/usecase/business/get-products.usecase';

@Controller('business')
export class BusinessController {
  constructor(private readonly getProductsUseCase: GetProducstUseCase) {}

  @Get(':session/products')
  async products(
    @Param('session') session: string,
    @Query(new PaginationTransformPipe()) payload: BusinessDto,
  ): Promise<any> {
    return await this.getProductsUseCase.execute(session, payload);
  }
}

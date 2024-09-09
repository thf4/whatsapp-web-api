import { Injectable, Logger } from '@nestjs/common';
import { BusinessService } from '../../../infra/service/business.service';

@Injectable()
export class GetProducstUseCase {
  private readonly logger: Logger;
  constructor(private readonly businessService: BusinessService) {
    this.logger = new Logger(GetProducstUseCase.name)
  }

  async execute(session: string, payload: any): Promise<any> {
    const products = await this.businessService.getProducts(session, payload);

    return products
  }
}
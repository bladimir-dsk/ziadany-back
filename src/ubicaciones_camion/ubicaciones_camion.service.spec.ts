import { Test, TestingModule } from '@nestjs/testing';
import { UbicacionesCamionService } from './ubicaciones_camion.service';

describe('UbicacionesCamionService', () => {
  let service: UbicacionesCamionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UbicacionesCamionService],
    }).compile();

    service = module.get<UbicacionesCamionService>(UbicacionesCamionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

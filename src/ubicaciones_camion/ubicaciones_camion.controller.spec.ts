import { Test, TestingModule } from '@nestjs/testing';
import { UbicacionesCamionController } from './ubicaciones_camion.controller';
import { UbicacionesCamionService } from './ubicaciones_camion.service';

describe('UbicacionesCamionController', () => {
  let controller: UbicacionesCamionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UbicacionesCamionController],
      providers: [UbicacionesCamionService],
    }).compile();

    controller = module.get<UbicacionesCamionController>(UbicacionesCamionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

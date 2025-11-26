import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SectoresService } from './sectores.service';
import { CreateSectoreDto } from './dto/create-sectore.dto';
import { UpdateSectoreDto } from './dto/update-sectore.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('sectores')
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) {}

  @Post()
  create(
    @Body() createSectoreDto: CreateSectoreDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.sectoresService.create(createSectoreDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.sectoresService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.sectoresService.findOne(+id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateSectoreDto: UpdateSectoreDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.sectoresService.update(+id, updateSectoreDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.sectoresService.remove(+id, user);
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaReadService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isAvailable = false;

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_READ,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
      console.warn('Réplica de lectura no disponible. Los endpoints de lectura retornarán error 503.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  checkAvailability(): void {
    if (!this.isAvailable) {
      throw new ServiceUnavailableException('La base de datos de lectura no está disponible en este momento.');
    }
  }

  async reconnect(): Promise<void> {
    try {
      await this.$connect();
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
    }
  }

  get available(): boolean {
    return this.isAvailable;
  }
}
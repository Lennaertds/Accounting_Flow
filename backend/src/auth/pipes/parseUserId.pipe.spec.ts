// backend/src/pipes/parseUserId.pipe.spec.ts
import { ParseUserIdPipe } from './parseUserId.pipe';
import { ArgumentMetadata, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { describe } from 'node:test';

describe('ParseUserIdPipe', () => {
    let pipe: ParseUserIdPipe;

    const metadata: ArgumentMetadata = {
        type: 'param',
        metatype: Number,
        data: 'id',
    };

    const createPipeWithRequest = async (request: any) => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ParseUserIdPipe,
                {
                    provide: REQUEST,
                    useValue: request,
                },
            ],
        }).compile();

        return await module.resolve<ParseUserIdPipe>(ParseUserIdPipe);
    };

    it('should be defined', async () => {
        pipe = await createPipeWithRequest({ user: { id: 123 } });
        expect(pipe).toBeDefined();
    });

    it('should transform "me" to the current user ID', async () => {
        const mockRequest = { user: { id: 123, email: 'test@example.com' } };
        pipe = await createPipeWithRequest(mockRequest);
        await expect(pipe.transform('me', metadata)).resolves.toBe(123);
    });

    it('should throw UnauthorizedException if "me" is used without a user on the request', async () => {
        const mockRequest = {}; 
        pipe = await createPipeWithRequest(mockRequest);
        await expect(pipe.transform('me', metadata)).rejects.toThrow(UnauthorizedException);
    });

    it('should transform a numeric string to a number', async () => {
        const mockRequest = { user: { id: 123 } };
        pipe = await createPipeWithRequest(mockRequest);
        await expect(pipe.transform('456', metadata)).resolves.toBe(456);
    });

    it('should throw BadRequestException for a non-numeric string (that is not "me")', async () => {
        const mockRequest = { user: { id: 123 } };
        pipe = await createPipeWithRequest(mockRequest);
        await expect(pipe.transform('invalid', metadata)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for a NaN value', async () => {
        const mockRequest = { user: { id: 123 } };
        pipe = await createPipeWithRequest(mockRequest);
        await expect(pipe.transform('12a3', metadata)).rejects.toThrow(BadRequestException);
    });
});
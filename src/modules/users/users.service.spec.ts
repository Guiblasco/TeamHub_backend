import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    mockPrismaService.user.create.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test',
      lastName: 'User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test',
      lastName: 'User',
    };

    const result = await service.create(dto);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: dto.email,
      },
    });

    expect(mockPrismaService.user.create).toHaveBeenCalled();

    const createCall = mockPrismaService.user.create.mock.calls[0][0];

    expect(createCall.data.password).not.toBe(dto.password);
    expect(createCall.data.password).toMatch(/^\$2[aby]\$/);

    expect(result).toEqual(
      expect.objectContaining({
        email: dto.email,
        name: dto.name,
        lastName: dto.lastName,
      }),
    );
  });
  it('should update a user', async () => {
    const userId = 'user-id';

    const updateDto = {
      name: 'Updated',
    };

    const updatedUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Updated',
      lastName: 'User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue(updatedUser);
    mockPrismaService.user.update.mockResolvedValue(updatedUser);

    const result = await service.update(userId, updateDto);

    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: userId,
      },
      data: updateDto,
      select: expect.any(Object),
    });

    expect(result).toEqual(updatedUser);
  });
  it('should throw ConflictException if email already exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'existing-user-id',
      email: 'test@example.com',
    });

    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test',
      lastName: 'User',
    };

    await expect(service.create(dto)).rejects.toThrow(ConflictException);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: dto.email,
      },
    });

    expect(mockPrismaService.user.create).not.toHaveBeenCalled();
  });
  it('should find a user by id', async () => {
    const user = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test',
      lastName: 'User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne(user.id);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: user.id,
      },
      select: expect.any(Object),
    });

    expect(result).toEqual(user);
  });
  it('should throw NotFoundException if user does not exist', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('non-existing-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'non-existing-id',
      },
      select: expect.any(Object),
    });
  });
  it('should throw ConflictException if the new email already belongs to another user', async () => {
    const userId = 'user-id';

    const updateDto = {
      email: 'existing@example.com',
    };

    mockPrismaService.user.findUnique
      .mockResolvedValueOnce({
        id: userId,
        email: 'test@example.com',
        name: 'Test',
        lastName: 'User',
        role: 'USER',
      })
      .mockResolvedValueOnce({
        id: 'another-user-id',
        email: updateDto.email,
      });

    await expect(service.update(userId, updateDto)).rejects.toThrow(
      ConflictException,
    );

    expect(mockPrismaService.user.update).not.toHaveBeenCalled();
  });
  it('should hash the password when updating it', async () => {
    const userId = 'user-id';
    const password = 'NewPassword123!';
    const updateDto = {
      password,
    };

    const existingUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test',
      lastName: 'User',
      role: 'USER',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

    mockPrismaService.user.update.mockResolvedValue({
      ...existingUser,
    });

    await service.update(userId, updateDto);

    const updateCall = mockPrismaService.user.update.mock.calls[0][0];

    expect(updateCall.data.password).not.toBe(password);
    expect(updateCall.data.password).toMatch(/^\$2[aby]\$/);
  });
  it('should throw NotFoundException when updating a non-existing user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const updateDto = {
      name: 'Updated',
    };

    await expect(service.update('non-existing-id', updateDto)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrismaService.user.update).not.toHaveBeenCalled();
  });
  it('should return all users', async () => {
    const users = [
      {
        id: 'user-1',
        email: 'one@example.com',
        name: 'User',
        lastName: 'One',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-2',
        email: 'two@example.com',
        name: 'User',
        lastName: 'Two',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrismaService.user.findMany.mockResolvedValue(users);

    const result = await service.findAll();

    expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
      select: expect.any(Object),
    });

    expect(result).toEqual(users);
  });
  it('should remove a user', async () => {
    const userId = 'user-id';

    const existingUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test',
      lastName: 'User',
      role: 'USER',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

    mockPrismaService.user.delete.mockResolvedValue(existingUser);

    const result = await service.remove(userId);

    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
      where: {
        id: userId,
      },
      select: expect.any(Object),
    });

    expect(result).toEqual(existingUser);
  });
  it('should throw NotFoundException when removing a non-existing user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.remove('non-existing-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
  });
});

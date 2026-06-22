import { Prisma } from '@prisma/client';
import { handleError } from './errors';

// Minimal Express Response stub that records status/json calls.
const mockRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((body: any) => {
    res.body = body;
    return res;
  });
  return res;
};

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('msg', { code, clientVersion: 'test' });

describe('handleError', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('maps P2002 (unique violation) to 409', () => {
    const res = mockRes();
    handleError(res, prismaError('P2002'), 'test');
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('maps P2025 (not found) to 404', () => {
    const res = mockRes();
    handleError(res, prismaError('P2025'), 'test');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps P2003 (FK constraint) to 409', () => {
    const res = mockRes();
    handleError(res, prismaError('P2003'), 'test');
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('falls back to 500 for unknown errors', () => {
    const res = mockRes();
    handleError(res, new Error('boom'), 'test');
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

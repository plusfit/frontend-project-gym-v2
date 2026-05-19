import { ClientNamePipe } from './client-name.pipe';

describe('ClientNamePipe', () => {
  const pipe = new ClientNamePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Usuario" when value is null or undefined', () => {
    expect(pipe.transform(null)).toBe('Usuario');
    expect(pipe.transform(undefined)).toBe('Usuario');
  });

  it('should format a plain name string in Title Case', () => {
    expect(pipe.transform('JUAN PEREZ')).toBe('Juan Perez');
    expect(pipe.transform('juan perez')).toBe('Juan Perez');
    expect(pipe.transform('JuAn PeReZ')).toBe('Juan Perez');
    expect(pipe.transform('  juan    perez  ')).toBe('Juan Perez');
  });

  it('should extract and format name from client object', () => {
    const client = {
      userInfo: {
        name: 'juan carlos perez'
      },
      email: 'juan@gmail.com'
    };
    expect(pipe.transform(client)).toBe('Juan Carlos Perez');
  });

  it('should fallback to email in lowercase when name is missing', () => {
    const client = {
      email: 'JUAN@gmail.com'
    };
    expect(pipe.transform(client)).toBe('juan@gmail.com');
  });

  it('should return "Usuario" when client object has no name or email', () => {
    const client = {};
    expect(pipe.transform(client)).toBe('Usuario');
  });
});

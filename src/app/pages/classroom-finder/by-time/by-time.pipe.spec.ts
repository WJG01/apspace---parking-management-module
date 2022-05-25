import { ByTimePipe } from './by-time.pipe';

describe('ByTimePipe', () => {
  it('create an instance', () => {
    const pipe = new ByTimePipe();
    expect(pipe).toBeTruthy();
  });
});

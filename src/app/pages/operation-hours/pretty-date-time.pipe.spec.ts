import { PrettyDateTimePipe } from './pretty-date-time.pipe';

describe('PrettyDateTimePipe', () => {
  it('create an instance', () => {
    const pipe = new PrettyDateTimePipe();
    expect(pipe).toBeTruthy();
  });
});

import { foo } from './index';

describe('Index', () => {
    it('foo should be bar', () => {
        expect(foo).toBe('bar');
    });
});

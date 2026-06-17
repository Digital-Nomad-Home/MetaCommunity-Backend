import { invokeContract } from '../source/service/ChainMaker';

const { PLATFORM_ADMIN } = process.env;

function decodeValues(result: { data: string }): unknown[] {
    return JSON.parse(result.data);
}

describe('ContributionTokenFactory', () => {
    it('should report contract not paused', async () => {
        const result = await invokeContract('ContributionTokenFactory', 'paused', {});

        expect(result.code).toBe(0);
        expect(decodeValues(result)[0]).toBe(false);
    });

    it('should query allTokensLength as a non-negative value', async () => {
        const result = await invokeContract('ContributionTokenFactory', 'allTokensLength', {});

        expect(result.code).toBe(0);
        expect(BigInt(decodeValues(result)[0] as string)).toBeGreaterThanOrEqual(0n);
    });

    it('should return false for an uncertified issuer', async () => {
        const result = await invokeContract('ContributionTokenFactory', 'certifiedIssuers', {
            issuer: PLATFORM_ADMIN!
        });

        expect(result.code).toBe(0);
        expect([true, false]).toContain(decodeValues(result)[0]);
    });

    it('should return false for a non-existent token', async () => {
        const result = await invokeContract('ContributionTokenFactory', 'registeredTokens', {
            token: PLATFORM_ADMIN!
        });

        expect(result.code).toBe(0);
        expect(decodeValues(result)[0]).toBe(false);
    });

    it('should return a zero address for unknown community', async () => {
        const result = await invokeContract('ContributionTokenFactory', 'activeTokenByCommunity', {
            communityIdHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
        });

        expect(result.code).toBe(0);
        expect(decodeValues(result)[0]).toMatch(/^0x0+$/);
    });
});

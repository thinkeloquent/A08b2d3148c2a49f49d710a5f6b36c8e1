import { describe, it, expect } from 'vitest';
import { encodeCredential, buildProxyUrl } from '../src/index.js';

describe('encodeCredential', () => {
    it('leaves simple alphanumeric strings unchanged', () => {
        expect(encodeCredential('admin')).toBe('admin');
    });

    it('encodes @', () => {
        expect(encodeCredential('user@domain')).toBe('user%40domain');
    });

    it('encodes :', () => {
        expect(encodeCredential('a:b')).toBe('a%3Ab');
    });

    it('encodes #', () => {
        expect(encodeCredential('p#ss')).toBe('p%23ss');
    });

    it('encodes space', () => {
        expect(encodeCredential('a b')).toBe('a%20b');
    });

    it('encodes !', () => {
        expect(encodeCredential('p!ss')).toBe('p%21ss');
    });

    it("encodes '", () => {
        expect(encodeCredential("test'user")).toBe('test%27user');
    });

    it('encodes ( and )', () => {
        expect(encodeCredential('pass(1)')).toBe('pass%281%29');
    });

    it('encodes *', () => {
        expect(encodeCredential('pass*')).toBe('pass%2A');
    });

    it('encodes + and =', () => {
        expect(encodeCredential('a+b=c')).toBe('a%2Bb%3Dc');
    });

    it('encodes &', () => {
        expect(encodeCredential('d&e')).toBe('d%26e');
    });

    it('handles empty string', () => {
        expect(encodeCredential('')).toBe('');
    });
});

describe('buildProxyUrl', () => {
    describe('parity test vectors', () => {
        const vectors: [string, string, string, string][] = [
            ['admin', 'secret', 'proxy.example.com', 'http://admin:secret@proxy.example.com'],
            ['admin', 'secret', 'proxy.example.com:8080', 'http://admin:secret@proxy.example.com:8080'],
            ['admin', 'secret', 'http://proxy.example.com:8080', 'http://admin:secret@proxy.example.com:8080'],
            ['user@domain', 'p@ss:word', 'proxy.example.com:3128', 'http://user%40domain:p%40ss%3Aword@proxy.example.com:3128'],
            ['user', 'p#ss!', 'https://secure.proxy.com:443', 'https://user:p%23ss%21@secure.proxy.com'],
            ['user name', 'pass word', 'proxy.example.com:8080', 'http://user%20name:pass%20word@proxy.example.com:8080'],
            ['u', 'p', 'http://old:creds@proxy:8080', 'http://u:p@proxy:8080'],
            ['a+b=c', 'd&e', 'proxy:3128', 'http://a%2Bb%3Dc:d%26e@proxy:3128'],
            ['user', 'pass', 'http://proxy:80', 'http://user:pass@proxy'],
            ["test'user", 'pass(1)*', 'proxy:9090', 'http://test%27user:pass%281%29%2A@proxy:9090'],
        ];

        vectors.forEach(([user, password, proxyUrl, expected]) => {
            it(`buildProxyUrl(${JSON.stringify(user)}, ${JSON.stringify(password)}, ${JSON.stringify(proxyUrl)}) => ${expected}`, () => {
                expect(buildProxyUrl(user, password, proxyUrl)).toBe(expected);
            });
        });
    });

    describe('edge cases', () => {
        it('handles empty credentials', () => {
            expect(buildProxyUrl('', '', 'proxy:8080')).toBe('http://:@proxy:8080');
        });

        it('strips trailing path from proxy URL', () => {
            expect(buildProxyUrl('user', 'pass', 'http://proxy:8080/some/path')).toBe('http://user:pass@proxy:8080');
        });

        it('strips default http port 80', () => {
            expect(buildProxyUrl('user', 'pass', 'http://proxy:80')).toBe('http://user:pass@proxy');
        });

        it('strips default https port 443', () => {
            expect(buildProxyUrl('user', 'pass', 'https://proxy:443')).toBe('https://user:pass@proxy');
        });

        it('keeps non-default https port', () => {
            expect(buildProxyUrl('user', 'pass', 'https://proxy:8443')).toBe('https://user:pass@proxy:8443');
        });
    });
});

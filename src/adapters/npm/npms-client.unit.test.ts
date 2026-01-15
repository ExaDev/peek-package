import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NpmsClient } from './npms-client';

describe('NpmsClient', () => {
  let client: NpmsClient;
  let mockFetch: any;

  beforeEach(() => {
    client = new NpmsClient();
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchSuggestions', () => {
    it('returns empty array for empty query', async () => {
      const result = await client.fetchSuggestions('');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array for query with less than 2 characters', async () => {
      const result = await client.fetchSuggestions('a');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array for single character query', async () => {
      const result = await client.fetchSuggestions('r');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches suggestions for valid query (2+ characters)', async () => {
      const mockResponse = [
        {
          package: {
            name: 'react',
            version: '18.2.0',
            description: 'React JavaScript library',
            author: 'Facebook',
            date: '2023-01-01',
            keywords: ['react', 'ui'],
            links: {
              npm: 'https://www.npmjs.com/package/react',
              homepage: 'https://react.dev',
              repository: 'https://github.com/facebook/react',
              bugs: 'https://github.com/facebook/react/issues',
            },
          },
          score: {
            final: 0.95,
            detail: {
              quality: 0.9,
              popularity: 0.98,
              maintenance: 0.97,
            },
          },
          searchScore: 100,
          highlight: 'react',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.fetchSuggestions('react');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.npms.io/v2/search/suggestions?q=react',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );
    });

    it('encodes query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await client.fetchSuggestions('react router');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.npms.io/v2/search/suggestions?q=react%20router',
        expect.any(Object)
      );
    });

    it('handles special characters in query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await client.fetchSuggestions('@types/react');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.npms.io/v2/search/suggestions?q=%40types%2Freact',
        expect.any(Object)
      );
    });

    it('throws error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.fetchSuggestions('react')).rejects.toThrow(
        'npms.io search error: 500 Internal Server Error'
      );
    });

    it('throws error with status code for 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.fetchSuggestions('react')).rejects.toThrow(
        'npms.io search error: 404 Not Found'
      );
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.fetchSuggestions('react')).rejects.toThrow(
        'Network error'
      );
    });

    it('parses JSON response correctly', async () => {
      const mockResponse = [
        {
          package: {
            name: 'vue',
            version: '3.0.0',
            description: 'Vue.js framework',
            author: 'Evan You',
            date: '2023-01-01',
            keywords: ['vue', 'framework'],
            links: {
              npm: 'https://www.npmjs.com/package/vue',
              homepage: 'https://vue.dev',
              repository: 'https://github.com/vuejs/vue',
              bugs: 'https://github.com/vuejs/vue/issues',
            },
          },
          score: {
            final: 0.92,
            detail: {
              quality: 0.88,
              popularity: 0.95,
              maintenance: 0.93,
            },
          },
          searchScore: 95,
          highlight: 'vue',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.fetchSuggestions('vue');

      expect(result).toHaveLength(1);
      expect(result[0].package.name).toBe('vue');
      expect(result[0].score.final).toBe(0.92);
    });

    it('handles empty response array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await client.fetchSuggestions('xyzabc123');

      expect(result).toEqual([]);
    });

    it('handles response with multiple results', async () => {
      const mockResponse = [
        { package: { name: 'react', version: '1.0.0', description: 'React', author: 'Facebook', date: '2023-01-01', keywords: [], links: { npm: '', homepage: null, repository: null, bugs: null } }, score: { final: 0.9, detail: { quality: 0.9, popularity: 0.9, maintenance: 0.9 } }, searchScore: 100, highlight: 'react' },
        { package: { name: 'react-dom', version: '1.0.0', description: 'React DOM', author: 'Facebook', date: '2023-01-01', keywords: [], links: { npm: '', homepage: null, repository: null, bugs: null } }, score: { final: 0.85, detail: { quality: 0.85, popularity: 0.85, maintenance: 0.85 } }, searchScore: 90, highlight: 'react-dom' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.fetchSuggestions('react');

      expect(result).toHaveLength(2);
      expect(result[0].package.name).toBe('react');
      expect(result[1].package.name).toBe('react-dom');
    });

    it('sets correct Accept header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await client.fetchSuggestions('react');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toEqual({
        Accept: 'application/json',
      });
    });
  });

  describe('fetchPackage', () => {
    it('fetches package metadata', async () => {
      const mockPackage = {
        name: 'react',
        version: '18.2.0',
        description: 'React JavaScript library',
        homepage: 'https://react.dev',
        repository: { type: 'git', url: 'https://github.com/facebook/react' },
        keywords: ['react', 'ui'],
        links: {
          npm: 'https://www.npmjs.com/package/react',
          homepage: 'https://react.dev',
          repository: 'https://github.com/facebook/react',
          bugs: 'https://github.com/facebook/react/issues',
        },
        author: { name: 'Facebook' },
        license: 'MIT',
        maintainers: [{ name: 'Facebook' }],
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        score: {
          final: 0.95,
          detail: {
            quality: 0.9,
            popularity: 0.98,
            maintenance: 0.97,
          },
        },
        time: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPackage,
      });

      const result = await client.fetchPackage('react');

      expect(result).toEqual(mockPackage);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.npms.io/v2/package/react',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );
    });

    it('throws 404 error for non-existent package', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.fetchPackage('non-existent-package-xyz')).rejects.toThrow(
        'Package "non-existent-package-xyz" not found on npms.io'
      );
    });

    it('throws generic error for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.fetchPackage('react')).rejects.toThrow(
        'npms.io API error: 500 Internal Server Error'
      );
    });

    it('encodes package names correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.fetchPackage('@scoped/package');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.npms.io/v2/package/%40scoped%2Fpackage',
        expect.any(Object)
      );
    });
  });

  describe('fetchPackages', () => {
    it('fetches multiple packages in batch', async () => {
      const mockResponse = {
        react: {
          name: 'react',
          version: '18.2.0',
          description: 'React JavaScript library',
          homepage: 'https://react.dev',
          repository: null,
          keywords: [],
          links: {
            npm: 'https://www.npmjs.com/package/react',
            homepage: null,
            repository: null,
            bugs: null,
          },
          author: null,
          license: 'MIT',
          maintainers: [],
          dependencies: {},
          devDependencies: {},
          peerDependencies: {},
          score: {
            final: 0.95,
            detail: { quality: 0.9, popularity: 0.98, maintenance: 0.97 },
          },
          time: '2023-01-01T00:00:00.000Z',
        },
        vue: {
          name: 'vue',
          version: '3.0.0',
          description: 'Vue.js framework',
          homepage: 'https://vue.dev',
          repository: null,
          keywords: [],
          links: {
            npm: 'https://www.npmjs.com/package/vue',
            homepage: null,
            repository: null,
            bugs: null,
          },
          author: null,
          license: 'MIT',
          maintainers: [],
          dependencies: {},
          devDependencies: {},
          peerDependencies: {},
          score: {
            final: 0.92,
            detail: { quality: 0.88, popularity: 0.95, maintenance: 0.93 },
          },
          time: '2023-01-01T00:00:00.000Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.fetchPackages(['react', 'vue']);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.npms.io/v2/package/mget',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(['react', 'vue']),
        }
      );
    });

    it('throws error on batch API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.fetchPackages(['react', 'vue'])).rejects.toThrow(
        'npms.io batch API error: 500 Internal Server Error'
      );
    });

    it('sets correct headers for batch request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.fetchPackages(['react']);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toEqual({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
    });
  });
});

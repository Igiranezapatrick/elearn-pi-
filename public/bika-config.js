/**
 * SomaLearn Secure Bika Client
 * Routes requests through the Node.js server proxy reading from .env
 */

class BikaClient {
  constructor(proxyEndpoint = '/api/bika') {
    this.endpoint = proxyEndpoint;
  }

  from(table) {
    return {
      select: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const url = `${this.endpoint}/${table}${query ? '?' + query : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error((await res.json()).error || 'Fetch failed');
        return res.json();
      },
      insert: async (record) => {
        const res = await fetch(`${this.endpoint}/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Insert failed');
        return res.json();
      },
      update: async (id, updates) => {
        const res = await fetch(`${this.endpoint}/${table}?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
        return res.json();
      },
      delete: async (id) => {
        const res = await fetch(`${this.endpoint}/${table}?id=${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
        return res.json();
      }
    };
  }
}

// Zero credentials visible to anyone inspecting the page
const bika = new BikaClient();
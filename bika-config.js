/**
 * PI Elearning Bika Client (Direct Cloud Connection)
 */
const BIKA_CONFIG = {
  BASE_URL: 'https://bika-database.onrender.com',
  ANON_KEY: 'bika_anon_b00881dff09b5c0dc541615d54aac291460be96c'
};

class BikaClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  from(table) {
    return {
      select: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const url = `${this.baseUrl}/rest/v1/${table}${query ? '?' + query : ''}`;
        const res = await fetch(url, {
          headers: { 
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Fetch failed');
        return res.json();
      },
      insert: async (record) => {
        const res = await fetch(`${this.baseUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(record)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Insert failed');
        return res.json();
      },
      update: async (id, updates) => {
        const res = await fetch(`${this.baseUrl}/rest/v1/${table}?id=${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
        return res.json();
      },
      delete: async (id) => {
        const res = await fetch(`${this.baseUrl}/rest/v1/${table}?id=${id}`, {
          method: 'DELETE',
          headers: { 'apikey': this.apiKey }
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
        return res.json();
      }
    };
  }
}

const bika = new BikaClient(BIKA_CONFIG.BASE_URL, BIKA_CONFIG.ANON_KEY);
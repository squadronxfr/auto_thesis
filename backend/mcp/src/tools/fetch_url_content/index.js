import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const fetchUrlContentTool = {
  name: 'fetch_url_content',
  description: 'Recherche sur le web et récupère le contenu depuis des URLs. Peut générer des termes de recherche avec l\'IA ou utiliser une requête fournie.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Une URL spécifique pour récupérer le contenu'
      },
      search_query: {
        type: 'string',
        description: 'Un sujet de recherche (l\'IA générera plusieurs termes de recherche à partir de cela)'
      },
      search_terms: {
        type: 'array',
        description: 'Termes de recherche pré-générés (5-10 termes)',
        items: { type: 'string' }
      },
      max_results: {
        type: 'number',
        description: 'Nombre maximum de résultats de recherche par terme (par défaut : 3)',
        default: 3
      },
      fetch_content: {
        type: 'boolean',
        description: 'Récupérer et analyser le contenu des URLs trouvées (par défaut : true)',
        default: true
      }
    }
  },

  async execute(params) {
    const { url, search_query, search_terms, max_results = 3, fetch_content = true } = params;

    if (url) {
      console.log(`Fetching content from URL: ${url}`);
      return await fetchSingleUrl(url);
    }

    if (search_terms && search_terms.length > 0) {
      console.log(`Searching with ${search_terms.length} pre-generated terms`);
      return await searchMultipleTerms(search_terms, max_results, fetch_content);
    }

    if (search_query) {
      console.log(`Generating search terms for: ${search_query}`);
      const terms = await generateSearchTerms(search_query);
      console.log(`Generated ${terms.length} search terms`);
      return await searchMultipleTerms(terms, max_results, fetch_content);
    }

    throw new Error('Either url, search_query, or search_terms must be provided');
  }
};

async function fetchSingleUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const content = extractContent(html);

    console.log(`Content fetched successfully from ${url}`);

    return {
      url,
      title: content.title,
      content: content.text,
      links: content.links.slice(0, 10)
    };
  } catch (error) {
    console.error(`Failed to fetch ${url}: ${error.message}`);
    return {
      url,
      error: error.message
    };
  }
}

async function generateSearchTerms(topic) {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      console.log('No API key, using topic as search term');
      return [topic];
    }

    const prompt = `Generate 5-8 specific search queries to research this topic comprehensively: "${topic}"

Requirements:
- Each query should target different aspects or perspectives
- Use academic and professional terminology
- Include recent developments (2023-2024)
- Mix general and specific queries

Return ONLY a JSON array of strings, nothing else. Example: ["query 1", "query 2", "query 3"]`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
        timeout: 15000
      }
    );

    if (!response.ok) {
      console.log(`Gemini API error: ${response.status}`);
      return [topic];
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const terms = JSON.parse(jsonMatch[0]);
      if (terms.length > 0) {
        return terms.slice(0, 10);
      }
    }

    return [topic];
  } catch (error) {
    console.log(`Search term generation failed: ${error.message}`);
    return [topic];
  }
}

async function searchMultipleTerms(terms, maxResultsPerTerm, fetchContent) {
  const allResults = [];
  const failedSearches = [];
  
  for (const term of terms) {
    console.log(`Searching for: "${term}"`);
    const results = await searchWeb(term, maxResultsPerTerm);
    
    if (results.length === 0) {
      failedSearches.push(term);
    } else {
      allResults.push(...results);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const uniqueResults = [];
  const seenUrls = new Set();
  for (const result of allResults) {
    if (!seenUrls.has(result.url)) {
      seenUrls.add(result.url);
      uniqueResults.push(result);
    }
  }

  console.log(`Found ${uniqueResults.length} unique results from ${terms.length} search terms`);

  if (!fetchContent) {
    return { 
      search_terms: terms,
      results: uniqueResults,
      failed_searches: failedSearches,
      search_success: failedSearches.length < terms.length
    };
  }

  if (uniqueResults.length === 0) {
    return {
      search_terms: terms,
      results: [],
      failed_searches: failedSearches,
      search_success: false,
      error: 'No search results found. Web search may be unavailable.'
    };
  }

  console.log(`Fetching content from ${uniqueResults.length} URLs...`);
  
  const resultsWithContent = await Promise.all(
    uniqueResults.map(async (result) => {
      const content = await fetchSingleUrl(result.url);
      return {
        ...result,
        ...content
      };
    })
  );

  const validResults = resultsWithContent.filter(r => !r.error);

  return {
    search_terms: terms,
    results: validResults,
    failed_searches: failedSearches,
    search_success: validResults.length > 0
  };
}

async function searchWeb(query, maxResults) {
  const engines = [
    () => searchWithGoogleScholar(query, maxResults),
    () => searchWithBrave(query, maxResults)
  ];

  for (const engine of engines) {
    try {
      const results = await engine();
      if (results && results.length > 0) {
        return results;
      }
    } catch (error) {
      console.log(`Search engine failed: ${error.message}`);
    }
  }

  console.log(`All search engines failed for: ${query}`);
  return [];
}

async function searchWithGoogleScholar(query, maxResults) {
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=en&num=${maxResults}`;
  
  const response = await fetch(scholarUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 15000
  });
  
  if (!response.ok) throw new Error(`Google Scholar HTTP ${response.status}`);
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const results = [];
  
  $('.gs_ri').each((i, element) => {
    if (results.length >= maxResults) return false;
    
    const titleEl = $(element).find('.gs_rt a');
    const snippetEl = $(element).find('.gs_rs');
    const metaEl = $(element).find('.gs_a');
    
    const title = titleEl.text().trim();
    const url = titleEl.attr('href');
    const snippet = snippetEl.text().trim();
    const meta = metaEl.text().trim();
    
    if (title && url && url.startsWith('http')) {
      results.push({
        title,
        url,
        snippet: snippet || meta,
        source: 'google_scholar',
        authors: meta
      });
    }
  });
  
  if (results.length > 0) {
    console.log(`Google Scholar found ${results.length} results`);
  }
  
  return results;
}

async function searchWithBrave(query, maxResults) {
  const braveApiKey = process.env.BRAVE_API_KEY;
  if (!braveApiKey) throw new Error('No Brave API key');
  
  const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': braveApiKey
    },
    timeout: 10000
  });
  
  if (!response.ok) throw new Error(`Brave HTTP ${response.status}`);
  
  const data = await response.json();
  
  const results = (data.web?.results || []).slice(0, maxResults).map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.description || r.title,
    source: 'brave'
  }));
  
  if (results.length > 0) {
    console.log(`Brave found ${results.length} results`);
  }
  
  return results;
}

function extractContent(html) {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, nav, footer, header, aside, .ad, .advertisement, .sidebar, .menu, .navigation').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim();

  // Get main content
  let mainContent = '';
  const contentSelectors = ['article', 'main', '.content', '.post', '.entry', '#content', '.article-body'];
  
  for (const selector of contentSelectors) {
    const content = $(selector).text().trim();
    if (content && content.length > mainContent.length) {
      mainContent = content;
    }
  }

  // Fallback to body if no main content found
  if (!mainContent || mainContent.length < 100) {
    mainContent = $('body').text().trim();
  }

  // Clean up whitespace
  mainContent = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Limit content length
  if (mainContent.length > 10000) {
    mainContent = mainContent.substring(0, 10000) + '...';
  }

  // Extract links
  const links = [];
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && href.startsWith('http') && text) {
      links.push({ text, href });
    }
  });

  return {
    title,
    text: mainContent,
    links
  };
}

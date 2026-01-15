import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const fetchUrlContentTool = {
  name: 'fetch_url_content',
  description: 'Search the web and fetch content from URLs. Can generate search terms with AI or use provided query.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'A specific URL to fetch content from'
      },
      search_query: {
        type: 'string',
        description: 'A search topic (AI will generate multiple search terms from this)'
      },
      search_terms: {
        type: 'array',
        description: 'Pre-generated search terms (5-10 terms)',
        items: { type: 'string' }
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of search results per term (default: 3)',
        default: 3
      },
      fetch_content: {
        type: 'boolean',
        description: 'Whether to fetch and parse the content of found URLs (default: true)',
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
      console.log('No API key found, using fallback terms');
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
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const terms = JSON.parse(jsonMatch[0]);
      return terms.slice(0, 10); // Max 10 terms
    }

    return [topic];
  } catch (error) {
    console.error(`Failed to generate search terms: ${error.message}`);
    return [topic];
  }
}

async function searchMultipleTerms(terms, maxResultsPerTerm, fetchContent) {
  const allResults = [];
  
  for (const term of terms) {
    console.log(`Searching for: "${term}"`);
    const results = await searchWeb(term, maxResultsPerTerm);
    allResults.push(...results);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Remove duplicates by URL
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
      results: uniqueResults 
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

  return {
    search_terms: terms,
    results: resultsWithContent.filter(r => !r.error)
  };
}

async function searchWeb(query, maxResults) {
  try {
    // Using Google Custom Search API (free tier: 100 queries/day)
    // Alternative: use DuckDuckGo HTML or Bing
    
    // For now, using DuckDuckGo Instant Answer API as fallback
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    const results = [];
    
    // Extract related topics as search results
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, maxResults)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      }
    }

    // Fallback: use curated academic sources if no results
    if (results.length === 0) {
      console.log(`No results from API, using curated sources for: ${query}`);
      results.push({
        title: `Research on ${query}`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
        snippet: `Academic research and publications about ${query}`
      });
    }

    return results;
  } catch (error) {
    console.error(`Search failed for "${query}": ${error.message}`);
    return [];
  }
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

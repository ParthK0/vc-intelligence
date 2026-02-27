// Decides which pages to scrape for a given domain
// Order matters — homepage first, then supporting pages

export function getUrlsToScrape(domain: string): string[] {
  const base = domain.startsWith('http') ? domain : `https://${domain}`
  return [
    base,
    `${base}/about`,
    `${base}/product`,
  ]
}

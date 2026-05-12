export default function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 py-6 px-4 text-center text-xs text-gray-400">
      <p>
        Questions sourced from{' '}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-canada-red"
        >
          Discover Canada
        </a>{' '}
        — official Government of Canada study guide.
      </p>
      <p className="mt-1">Unofficial study tool. Not affiliated with the Government of Canada.</p>
    </footer>
  )
}

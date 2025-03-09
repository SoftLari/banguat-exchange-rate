# Changelog

## 1.0.3 "Quetzal Takes Flight" - 2024-03-20

### Documentation

- Updated package name to use organization scope `@softlari/banguat-exchange-rate`
- Enhanced README with emoji-rich feature list
- Improved code examples and usage instructions
- Added comprehensive error handling documentation
- Added development setup instructions

### Technical Improvements

- Streamlined npm publishing workflow
- Added automated release process
- Updated Node.js compatibility to include latest versions (18.x, 20.x, 22.x)

## 1.0.2 "Quetzal's First Flight" - 2024-03-20

### Features

- Initial release of the Banguat Exchange Rate Library
- SOAP client implementation for Banguat's exchange rate service
- Support for retrieving:
  - Current exchange rate
  - Historical exchange rates by date
  - Exchange rates for date ranges
  - Monthly averages
- Full TypeScript support with comprehensive type definitions
- CLI tool for quick access to exchange rates
- Automatic timezone handling for Guatemala's time (UTC-6)
- Proper error handling for:
  - Future dates
  - Invalid responses
  - Missing data scenarios

### Technical Improvements

- Comprehensive test suite with Jest
- GitHub Actions for automated testing
- Support for Node.js LTS versions (18.x, 20.x) and Current (22.x)
- Proper TypeScript configurations and declarations
- Automated npm publishing workflow

### Documentation

- Detailed README with usage examples
- JSDoc documentation for all public methods
- Type definitions included

---

_Note: The Quetzal, Guatemala's national bird and currency name, represents both freedom and economic stability. Just as this majestic bird soars through the cloud forests of Guatemala, our package aims to soar through the complexities of exchange rate data retrieval._

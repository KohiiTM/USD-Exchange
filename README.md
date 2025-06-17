# Currency Exchange Rate Visualizer

A dynamic web application that visualizes currency exchange rates using D3.js, featuring both force-directed graphs and historical trend analysis.

## Data Sources

The application utilizes the ExchangeRate-API (v6) for real-time currency conversion data:

- Base currency: USD
- Supported currencies: JPY, EUR, GBP, CAD, CHF, AUD, CNY, INR, BRL, MXN, and more
- API endpoint: https://v6.exchangerate-api.com/v6/{YOUR_API_KEY}/latest/USD

## Visualization Types

### Force-Directed Graph

- Interactive network visualization of currency relationships
- Node size represents exchange rate magnitude
- Color coding:
  - Red: USD (base currency)
  - Orange: Selected currency
  - Teal: Other currencies
- Draggable nodes for custom layout
- Automatic force simulation for optimal node placement

### Historical Trend Chart

- Line chart visualization of exchange rate history
- Features:
  - Daily data points over a 365-day period
  - Interactive data points
  - Time-based X-axis with rotated labels
  - Auto-scaling Y-axis
  - Clear currency pair labeling

## Technical Implementation

### Data Processing

- Real-time API data fetching for current rates
- Synthetic historical data generation for trend analysis
- Data normalization for consistent visualization
- Automatic scaling based on rate magnitudes

### D3.js Features

- Force simulation for network layout
- Time-based scales for historical data
- Linear scales for rate values
- SVG-based rendering
- Responsive design considerations

## Usage

1. Enter a USD amount
2. Select a target currency code
3. Choose visualization type:
   - Force Graph: Current exchange rate relationships
   - Historical Chart: 365-day trend analysis
4. Submit to view the conversion and visualization

## Data Limitations

- Historical data is currently synthetic for demonstration purposes
- Real historical data would require a paid API subscription
- Rate updates are dependent on API refresh intervals

## Future Data Enhancements

- Integration with historical exchange rate API
- Data caching for improved performance
- Custom date range selection
- Additional data points (volume, volatility)
- Export functionality for data analysis

## Dependencies

- D3.js v7.9.0
- ExchangeRate-API v6

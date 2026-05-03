# Chaos Zero Nightmare Gacha Simulator

A high-fidelity gacha simulator for Chaos Zero Nightmare (CZN), powered by 100,000-trial Monte Carlo simulations.

## Features
- **Accurate Probability Model**: Implements the 1% base rate, soft pity (58+), and hard pity (70/140) systems.
- **Goal-Based Simulation**: Calculate expected costs for specific breakthrough goals (0~6 breakthroughs).
- **Statistical Breakdown**: Get Average, Top 10% (Lucky), and Bottom 10% (Unlucky) cost estimates.
- **Dynamic Visualization**: Real-time distribution charts and cumulative probability curves.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation
1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
To create a production build:
```bash
npm run build
```
The static files will be generated in the `dist` directory.

## Technical Details
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Glassmorphism & Dark Mode)
- **Visualization**: Recharts
- **Icons**: Lucide React

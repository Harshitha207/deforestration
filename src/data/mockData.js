export const regions = [
  {
    id: 'amazon',
    name: 'Amazon Basin',
    center: [-3.4653, -62.2159],
    zoom: 5,
    description: 'The world\'s largest tropical rainforest, famed for its biodiversity.',
    initialForestCover: 5260000, // in sq km (approx in 2000)
    lossTrend: 18000, // avg sq km loss per year
    statistics: Array.from({ length: 25 }, (_, i) => {
      const year = 2000 + i;
      const baseLoss = 18000 * i;
      const fluctuation = Math.sin(i * 1.5) * 5000;
      const forestCover = 5260000 - baseLoss + fluctuation;
      const yearlyLoss = i === 0 ? 0 : (5260000 - baseLoss + fluctuation) - (5260000 - 18000 * (i - 1) + Math.sin((i - 1) * 1.5) * 5000);
      return {
        year,
        forestCover: Math.round(forestCover),
        deforestationRate: Math.max(2000, Math.round(Math.abs(yearlyLoss) || 15000)),
        ndvi: (0.82 - (i * 0.003) + Math.random() * 0.01).toFixed(2),
        activeAlerts: Math.round(50 + (i * 8) + Math.random() * 30),
      };
    })
  },
  {
    id: 'congo',
    name: 'Congo Basin',
    center: [-0.2280, 22.2758],
    zoom: 5,
    description: 'The second largest tropical rainforest in the world, spanning multiple nations in Central Africa.',
    initialForestCover: 1780000, // sq km
    lossTrend: 5000,
    statistics: Array.from({ length: 25 }, (_, i) => {
      const year = 2000 + i;
      const baseLoss = 5000 * i;
      const fluctuation = Math.cos(i * 1.2) * 2000;
      const forestCover = 1780000 - baseLoss + fluctuation;
      const yearlyLoss = i === 0 ? 0 : (1780000 - baseLoss + fluctuation) - (1780000 - 5000 * (i - 1) + Math.cos((i - 1) * 1.2) * 2000);
      return {
        year,
        forestCover: Math.round(forestCover),
        deforestationRate: Math.max(1000, Math.round(Math.abs(yearlyLoss) || 4500)),
        ndvi: (0.79 - (i * 0.002) + Math.random() * 0.01).toFixed(2),
        activeAlerts: Math.round(20 + (i * 3) + Math.random() * 15),
      };
    })
  },
  {
    id: 'southeast-asia',
    name: 'Southeast Asia (Borneo)',
    center: [0.9619, 114.5548],
    zoom: 6,
    description: 'Famed forest area known for massive deforestation due to oil palm plantations.',
    initialForestCover: 737000, // sq km
    lossTrend: 8000,
    statistics: Array.from({ length: 25 }, (_, i) => {
      const year = 2000 + i;
      const baseLoss = 8000 * i;
      const fluctuation = Math.sin(i * 2.0) * 1500;
      const forestCover = 737000 - baseLoss + fluctuation;
      const yearlyLoss = i === 0 ? 0 : (737000 - baseLoss + fluctuation) - (737000 - 8000 * (i - 1) + Math.sin((i - 1) * 2.0) * 1500);
      return {
        year,
        forestCover: Math.round(Math.max(300000, forestCover)),
        deforestationRate: Math.max(3000, Math.round(Math.abs(yearlyLoss) || 7500)),
        ndvi: (0.75 - (i * 0.005) + Math.random() * 0.02).toFixed(2),
        activeAlerts: Math.round(40 + (i * 6) + Math.random() * 25),
      };
    })
  },
  {
    id: 'central-india',
    name: 'Deciduous Forests (Central India)',
    center: [22.9734, 78.6569],
    zoom: 6,
    description: 'Central Indian dry deciduous forests, home to several tiger reserves.',
    initialForestCover: 350000, // sq km
    lossTrend: 1500,
    statistics: Array.from({ length: 25 }, (_, i) => {
      const year = 2000 + i;
      const baseLoss = 1500 * i;
      const fluctuation = Math.sin(i * 0.8) * 1000;
      const forestCover = 350000 - baseLoss + fluctuation;
      const yearlyLoss = i === 0 ? 0 : (350000 - baseLoss + fluctuation) - (350000 - 1500 * (i - 1) + Math.sin((i - 1) * 0.8) * 1000);
      return {
        year,
        forestCover: Math.round(forestCover),
        deforestationRate: Math.max(500, Math.round(Math.abs(yearlyLoss) || 1200)),
        ndvi: (0.65 - (i * 0.001) + Math.random() * 0.015).toFixed(2),
        activeAlerts: Math.round(10 + (i * 1.5) + Math.random() * 8),
      };
    })
  }
];

export const getHotspots = (regionId, year) => {
  const region = regions.find(r => r.id === regionId);
  if (!region) return [];
  const seed = regionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + year;
  const count = 15 + (year - 2000) * 3; // deforestation increases over years
  const hotspots = [];
  
  // Basic LCG random generator for consistent random coordinates based on region/year seed
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  
  for (let i = 0; i < count; i++) {
    const latOffset = (rnd() - 0.5) * (regionId === 'amazon' ? 6 : 4);
    const lngOffset = (rnd() - 0.5) * (regionId === 'amazon' ? 6 : 4);
    const radius = 8000 + rnd() * 30000; // in meters
    const intensity = 0.3 + rnd() * 0.7; // opacity
    hotspots.push({
      id: `${regionId}-${year}-${i}`,
      lat: region.center[0] + latOffset,
      lng: region.center[1] + lngOffset,
      radius,
      intensity,
      year
    });
  }
  return hotspots;
};

export const globalMetrics = {
  totalForestCover: '4.06 Billion Hectares',
  annualLoss: '10 Million Hectares',
  alertsCount: 142,
  protectedPercentage: '15%'
};

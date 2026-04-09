// src/data/coverage.js

// UFs atendidas (igual ao seu visual em azul)
export const servedUFs = [
  "MA","PI","CE","RN","PB","PE","AL","SE","BA", // NE
  "RJ","SP","PR","SC","RS"                     // SE + Sul
];

// bases operacionais (coordenadas aproximadas)
export const bases = [
  { city: "São José dos Pinhais (PR)", coords: [-49.205, -25.534] },
  { city: "Petrolina (PE)",             coords: [-40.500,  -9.389] },
  { city: "Natal (RN)",                 coords: [-35.209,  -5.795] },
];

// países onde já atuou (marcadores/legendas)
export const intl = [
  { name: "Uruguai",    coords: [-56.0, -32.8]  },
  { name: "Suriname",   coords: [-55.2,   5.9]  },
  { name: "Nicarágua",  coords: [-85.2,  13.2]  },
  { name: "Rep. Dominicana", coords: [-70.2, 19.0] },
  { name: "Islândia",   coords: [-19.0,  65.0]  },
];

// cores
export const COLORS = {
  served:   "#1d6fe8", // azul
  baseDot:  "#0ea5e9", // ciano
  outline:  "#0d3b66",
  rest:     "#e5e7eb", // cinza claro
  intl:     "#f97316", // laranja
};

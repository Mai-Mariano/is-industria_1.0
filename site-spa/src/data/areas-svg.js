// src/data/areas-svg.js

// Estados destacados (iguais ao seu exemplo da imagem)
export const UFS_ATENDIDAS = [
  "RS",
  "SC",
  "PR",
  "SP",
  "RJ",
  "BA",
  "SE",
  "AL",
  "PE",
  "PB",
  "RN",
  "CE",
  "PI",
  "MA",
];

export const COBERTURA_TXT =
  "RS, SC, PR, SP, RJ, BA, SE, AL, PE, PB, RN, CE, PI, MA";

// Pins em porcentagem (aprox.) dentro do viewBox do seu SVG.
// Ajuste brincando com os % até “bater” no lugar desejado.
export const PINS = [
  { x: 67, y: 82, label: "Curitiba/PR — Base", type: "base" },
  { x: 79, y: 64, label: "Natal/RN — Obra RN-01", type: "obra" },
  { x: 63, y: 76, label: "São Paulo/SP — Cliente", type: "cliente" },

  // internacionais (apenas como exemplo visual)
  { x: 58, y: 94, label: "Uruguai — Operação", type: "intl" },
  { x: 90, y: 16, label: "Islândia — Projeto", type: "intl" },
];

export const LEGENDA = {
  bases: ["Curitiba/PR"],
  obras: ["Natal/RN — RN-01"],
  clientes: ["São Paulo/SP"],
  internacional: ["Uruguai", "Islândia", "Rep. Dominicana", "Suriname", "Nicarágua"],
};

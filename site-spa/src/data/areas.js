// src/data/areas.js
export const MAP_IMG = "/image/maps/atuacao.png";
// ⤴️ Coloque sua imagem (PNG/SVG) em /public/image/maps/atuacao.png
// Use um mapa igual ao mock que você enviou (com estados e países marcados)

export const pins = [
  // Bases (verde)
  { id: "base-curitiba",    label: "Base Curitiba — PR",  type: "base",   x: 47.5, y: 74.0 },
  { id: "base-petrolina",   label: "Base Petrolina — PE", type: "base",   x: 63.5, y: 50.8 },
  { id: "base-natal",       label: "Base Natal — RN",     type: "base",   x: 71.2, y: 33.8 },

  // Obras (laranja)
  { id: "obra-rn01",        label: "Obra — RN",           type: "obra",   x: 71.6, y: 37.3 },

  // Clientes (azul)
  { id: "cliente-sp",       label: "Cliente — SP",        type: "cliente",x: 52.6, y: 73.6 },

  // Países (internacional — laranja)
  { id: "uruguai",          label: "Uruguai",             type: "internacional", x: 52.0, y: 89.3 },
  { id: "islandia",         label: "Islândia",            type: "internacional", x: 92.5, y: 12.5 },
  { id: "suriname",         label: "Suriname",            type: "internacional", x: 56.8, y: 17.5 },
  { id: "nicaragua",        label: "Nicarágua",           type: "internacional", x: 9.5,  y: 34.8 },
  { id: "rep-dom",          label: "Rep. Dominicana",     type: "internacional", x: 26.2, y: 10.8 },
];

export const coberturaEstados =
  "BA, CE, MA, PB, PE, PI, RN, RJ, RS, SC, PR, SP (e outros sob demanda)";

export const legenda = {
  bases: ["Curitiba/PR", "Petrolina/PE", "Natal/RN"],
  obras: ["Campanhas no RN e Nordeste"],
  clientes: ["SP, RJ, RS, SC, PR…"],
  internacional: ["Uruguai, Islândia, Suriname, Nicarágua, Rep. Dominicana"],
};

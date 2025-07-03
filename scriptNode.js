// 1. Carga tu archivo original (products.json)
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("products.json", "utf8"));

// 2. Mapa con las rutas (el objeto productDocs que ya tienes)
// Archivos PDF por producto
const productDocs = {
  "anker-500-sc": {
    ficha: "docs/ANKER_Ficha.pdf",
    tarjeta: "docs/ANKER_Tarjeta.pdf",
    hoja: "docs/ANKER_Hoja.pdf",
  },
  "athrin-brio-gqa-100-ec": {
    ficha: "docs/ATHRINBRIO_Ficha.pdf",
    tarjeta: "docs/ATHRINBRIO_Tarjeta.pdf",
    hoja: "docs/ATHRINBRIO_Hoja.pdf",
  },
  "brabus-100-me": {
    ficha: "docs/BRABUS_Ficha.pdf",
    tarjeta: "docs/BRABUS_Tarjeta.pdf",
    hoja: "docs/BRABUS_Hoja.pdf",
  },
  "cacique-420-sc": {
    ficha: "docs/CACIQUE_Ficha.pdf",
    tarjeta: "docs/CACIQUE_Tarjeta.pdf",
    hoja: "docs/CACIQUE_Hoja.pdf",
  },
  "catombe-brio-gqa-50-sc": {
    ficha: "docs/CATOMBE_BRIO_Ficha.pdf",
    tarjeta: "docs/CATOMBE_BRIO_Tarjeta.pdf",
    hoja: "docs/CATOMBE_BRIO_Hoja.pdf",
  },
  "catombe-forte-55-ec": {
    ficha: "docs/CATOMBEFORTE_Ficha.pdf",
    tarjeta: "docs/CATOMBEFORTE_Tarjeta.pdf",
    hoja: "docs/CATOMBEFORTE_Hoja.pdf",
  },
  "ciromex-brio-gqa-400-sc": {
    ficha: "docs/CIROMEX_BRIO_Ficha.pdf",
    tarjeta: "docs/CIROMEX_BRIO_Tarjeta.pdf",
    hoja: "docs/CIROMEX_BRIO_Hoja.pdf",
  },
  "coraza-480-sc": {
    ficha: "docs/CORAZA_Ficha.pdf",
    tarjeta: "docs/CORAZA_Tarjeta.pdf",
    hoja: "docs/CORAZA_Hoja.pdf",
  },
  "deminak-45-ec": {
    ficha: "docs/DEMINAK_Ficha.pdf",
    tarjeta: "docs/DEMINAK_Tarjeta.pdf",
    hoja: "docs/DEMINAK_Hoja.pdf",
  },
  "difon-brio-160-sc": {
    ficha: "docs/DIFON_Ficha.pdf",
    tarjeta: "docs/DIFON_Tarjeta.pdf",
    hoja: "docs/DIFON_Hoja.pdf",
  },
  "estocada-90-sp": {
    ficha: "docs/ESTOCADA_Ficha.pdf",
    tarjeta: "docs/ESTOCADA_Tarjeta.pdf",
    hoja: "docs/ESTOCADA_Hoja.pdf",
  },
  "faro-40-me": {
    ficha: "docs/FARO_Ficha.pdf",
    tarjeta: "docs/FARO_Tarjeta.pdf",
    hoja: "docs/FARO_Hoja.pdf",
  },
  "format-70-wp": {
    ficha: "docs/FORMAT_Ficha.pdf",
    tarjeta: "docs/FORMAT_Tarjeta.pdf",
    hoja: "docs/FORMAT_Hoja.pdf",
  },
  "fosetal-80-wp": {
    ficha: "docs/FOSETAL_Ficha.pdf",
    tarjeta: "docs/FOSETAL_Tarjeta.pdf",
    hoja: "docs/FOSETAL_Hoja.pdf",
  },
  "fulminator-600-ec": {
    ficha: "docs/FULMINATOR_Ficha.pdf",
    tarjeta: "docs/FULMINATOR_Tarjeta.pdf",
    hoja: "docs/FULMINATOR_Hoja.pdf",
  },
  // A partir de aquí los productos que NO traían archivos;
  // se proponen nombres siguiendo la misma convención:
  "kazugal-20-sl": {
    ficha: "docs/KAZUGAL_Ficha.pdf",
    tarjeta: "docs/KAZUGAL_Tarjeta.pdf",
    hoja: "docs/KAZUGAL_Hoja.pdf",
  },
  "linap-9-me": {
    ficha: "docs/LINAP_Ficha.pdf",
    tarjeta: "docs/LINAP_Tarjeta.pdf",
    hoja: "docs/LINAP_Hoja.pdf",
  },
  "lyon-60-me": {
    ficha: "docs/LYON_Ficha.pdf",
    tarjeta: "docs/LYON_Tarjeta.pdf",
    hoja: "docs/LYON_Hoja.pdf",
  },
  "mitipyr-240-sc": {
    ficha: "docs/MITIPYR_Ficha.pdf",
    tarjeta: "docs/MITIPYR_Tarjeta.pdf",
    hoja: "docs/MITIPYR_Hoja.pdf",
  },
  "patrulla-70-me": {
    ficha: "docs/PATRULLA_Ficha.pdf",
    tarjeta: "docs/PATRULLA_Tarjeta.pdf",
    hoja: "docs/PATRULLA_Hoja.pdf",
  },
  "prodion-500-sc": {
    ficha: "docs/PRODION_Ficha.pdf",
    tarjeta: "docs/PRODION_Tarjeta.pdf",
    hoja: "docs/PRODION_Hoja.pdf",
  },
  "reten-6-me": {
    ficha: "docs/RETEN_Ficha.pdf",
    tarjeta: "docs/RETEN_Tarjeta.pdf",
    hoja: "docs/RETEN_Hoja.pdf",
  },
  "sideral-70-sl": {
    ficha: "docs/SIDERAL_Ficha.pdf",
    tarjeta: "docs/SIDERAL_Tarjeta.pdf",
    hoja: "docs/SIDERAL_Hoja.pdf",
  },
  "skel-250-ec": {
    ficha: "docs/SKEL_Ficha.pdf",
    tarjeta: "docs/SKEL_Tarjeta.pdf",
    hoja: "docs/SKEL_Hoja.pdf",
  },
  "skyp-5-sc": {
    ficha: "docs/SKYP_Ficha.pdf",
    tarjeta: "docs/SKYP_Tarjeta.pdf",
    hoja: "docs/SKYP_Hoja.pdf",
  },
  "spax-80-me": {
    ficha: "docs/SPAX_Ficha.pdf",
    tarjeta: "docs/SPAX_Tarjeta.pdf",
    hoja: "docs/SPAX_Hoja.pdf",
  },
  "tumbador-250-sc": {
    ficha: "docs/TUMBADOR_Ficha.pdf",
    tarjeta: "docs/TUMBADOR_Tarjeta.pdf",
    hoja: "docs/TUMBADOR_Hoja.pdf",
  },
  "valiente-100-me": {
    ficha: "docs/VALIENTE_Ficha.pdf",
    tarjeta: "docs/VALIENTE_Tarjeta.pdf",
    hoja: "docs/VALIENTE_Hoja.pdf",
  },
  "zafiro-425-me": {
    ficha: "docs/ZAFIRO_Ficha.pdf",
    tarjeta: "docs/ZAFIRO_Tarjeta.pdf",
    hoja: "docs/ZAFIRO_Hoja.pdf",
  },
  "zoom-650-sc": {
    ficha: "docs/ZOOM_Ficha.pdf",
    tarjeta: "docs/ZOOM_Tarjeta.pdf",
    hoja: "docs/ZOOM_Hoja.pdf",
  },
  "arranque-sc": {
    ficha: "docs/ARRANQUE_Ficha.pdf",
    tarjeta: "docs/ARRANQUE_Tarjeta.pdf",
    hoja: "docs/ARRANQUE_Hoja.pdf",
  },
  "avance-sc": {
    ficha: "docs/AVANCE_Ficha.pdf",
    tarjeta: "docs/AVANCE_Tarjeta.pdf",
    hoja: "docs/AVANCE_Hoja.pdf",
  },
  "fixer-sc": {
    ficha: "docs/FIXER_Ficha.pdf",
    tarjeta: "docs/FIXER_Tarjeta.pdf",
    hoja: "docs/FIXER_Hoja.pdf",
  },
};

// 3. Recorre el arreglo y completa las rutas
data.products.forEach((prod) => {
  const docs = productDocs[prod.id];
  if (docs) {
    prod.ficha_pdf = docs.ficha;
    prod.tarjeta_pdf = docs.tarjeta;
    prod.hoja_pdf = docs.hoja;
  } else {
    console.warn(`⚠️  Falta entrada en productDocs para ${prod.id}`);
  }
});

// 4. Guarda un nuevo archivo
fs.writeFileSync("products-completo.json", JSON.stringify(data, null, 2));
console.log("✅ Archivo products-completo.json generado");

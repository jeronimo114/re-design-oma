import { listArticles, createArticle } from "./storage.js";
import { buildPublicArtifacts } from "./builders.js";

const articles = await listArticles();

const seeds = [
  {
    title: "Insumos de Protección para Flores de Exportación",
    status: "published",
    slug: "insumos-proteccion-flores-exportacion",
    tags: ["Flores", "Exportación"],
    coverImage: "/articulos/media/flores-exportacion.jpg",
    seoTitle: "Insumos de Protección para Flores de Exportación",
    seoDescription:
      "Tendencias globales, innovaciones y retos para impulsar la floricultura colombiana.",
    seoKeywords: ["flores", "protección", "exportación", "insumos"],
    publishedAt: "2025-07-05",
    contentMarkdown: `
Colombia exporta más de **650 millones de tallos** cada año, abasteciendo los mercados de Norteamérica y Europa con rosas, claveles y crisantemos de alta calidad. Detrás de ese éxito hay una evolución constante en el uso de insumos de protección que permiten mantener la sanidad fitosanitaria exigida por los compradores internacionales.

En el último lustro hemos observado *tres tendencias clave*: migración hacia formulaciones de baja toxicidad, adopción de mezclas listo-para-usar que combinan modos de acción y la presión del consumidor por certificaciones ambientales. Estas fuerzas están redibujando las estrategias de protección de cultivos en los invernaderos de la Sabana de Bogotá y Antioquia.

**Innovaciones recientes** como los fungicidas basados en pirimidinas de acción traslaminar o los insecticidas diamídicos han reducido en más de 40 % las aplicaciones mensuales frente a los programas tradicionales. El resultado: menos huella de carbono y mayor compatibilidad con polinizadores, un factor diferenciador para las cadenas de retail europeas.

El impacto en los productores es doble. Por un lado, _optimizar_ la rotación de ingredientes activos prolonga la vida útil de las moléculas y retrasa la resistencia; por otro, mejora el rendimiento económico al reducir descartes por enfermedades como **Botrytis** o *Downy Mildew*. Estudios independientes sitúan el ahorro en hasta 0,08 USD por tallo exportado.

No obstante, los retos persisten. El incremento de controles fronterizos en EE. UU. impone <mark>tolerancias cada vez más bajas</mark> para residuos de fitosanitarios. Eso exige una planificación integrada que combine biológicos y químicos de síntesis bajo rigor técnico. Químicos OMA responde con planes personalizados y uso de sensores IoT para predicción temprana de brotes.

Mirando al futuro, la oportunidad se centra en la **trazabilidad total** del lote: desde la aplicación del producto hasta el florero del consumidor. Los exportadores que adopten esta filosofía —apoyados en registros digitales y buenas prácticas— ganarán preferencia en los mercados premium y podrán acceder a mejores precios y contratos sostenibles.
    `.trim(),
  },
  {
    title:
      "La Importancia de los Insumos de Protección en la Seguridad Alimentaria",
    status: "published",
    slug: "insumos-proteccion-seguridad-alimentaria",
    tags: ["Alimentos", "Seguridad Alimentaria"],
    coverImage: "/articulos/media/seguridad-alimentaria.jpg",
    seoTitle:
      "La Importancia de los Insumos de Protección en la Seguridad Alimentaria",
    seoDescription:
      "Cómo la tecnología fitosanitaria respalda un suministro seguro y abundante de alimentos.",
    seoKeywords: ["protección", "seguridad alimentaria", "insumos agrícolas"],
    publishedAt: "2025-07-05",
    contentMarkdown: `
La seguridad alimentaria depende de que los cultivos lleguen sanos al mercado. Sin un programa técnico de protección frente a plagas, malezas y enfermedades, el riesgo de pérdida de cosechas se dispara y compromete el abastecimiento.

Los **insumos de protección** modernos combinan sustancias activas selectivas con formulaciones que mejoran la adherencia y reducen el lavado por lluvias. Esto se traduce en intervalos de aplicación más amplios y menores residuos en cosecha.

Además, las soluciones registradas para cultivos de alto consumo se someten a evaluaciones toxicológicas y ambientales estrictas. En Colombia, el ICA trabaja de la mano con la industria para asegurar que cada ingrediente activo cuente con respaldos científicos y dosis precisas según cultivo, plaga y zona agroclimática.

Para los productores, contar con aliados técnicos que integren monitoreo, pronóstico y rotación de modos de acción es clave. Es la ruta para mantener la productividad, cumplir con certificaciones internacionales y asegurar alimentos inocuos para los consumidores.
    `.trim(),
  },
];

for (const seed of seeds) {
  const exists = articles.find((article) => article.title === seed.title);
  if (!exists) {
    await createArticle(seed);
  }
}

await buildPublicArtifacts();
console.log("🌱 Blog seed completado");

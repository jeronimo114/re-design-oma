"""
Convierte el Excel 'Portafolio Completo OMA 2025.xlsx' a products.json
Ejecuta:  python tools/build_products_json.py
Requiere: pip install pandas openpyxl
"""
import json, re
import pandas as pd
from pathlib import Path

SRC  = Path("Portafolio Completo OMA 2025.xlsx")
DEST = Path("products.json")

# Lee la primera hoja (ajusta sheet_name si cambia)
df = pd.read_excel(SRC, sheet_name="PQUAs")

# Normaliza nombres de columnas de tu Excel (ajusta si difieren)
cols = {
    "NOMBRE COMERCIAL": "name",
    "INGREDIENTE ACTIVO": "active_ingredient",
    "FORM.": "formulation",
    "[ia]       g/L": "concentration",
    "RN.ICA": "ica",
    "CAT.TOX": "toxicity",
    "CULTIVO": "crop",
    "ACCIÓN": "category",
    "BLANCO BIOLOGICO\n(USOS)": "problem",
    "NOMBRE CIENTIFICO": "pest",
    "DOSIS": "dose",
}
df = df.rename(columns=cols)

# Rellena nulos con cadena vacía para evitar NaN
df = df.fillna("")

# Agrupa todos los targets por producto
products = {}
for _, row in df.iterrows():
    pid = re.sub(r"\W+", "-", row["name"].lower())
    prod = products.setdefault(
        pid,
        {
            "id": pid,
            "name": row["name"].strip(),
            "formulation": row["formulation"].strip(),
            "concentration": row["concentration"],
            "ica": row["ica"],
            "toxicity": row["toxicity"],
            "category": row["category"].capitalize(),
            "active_ingredient": row["active_ingredient"],
            "targets": []
        },
    )
    prod["targets"].append(
        {
            "crop":   row["crop"].title(),
            "pest":   row["pest"],
            "dose":   row["dose"],
            "action": row["problem"],   # Usamos columna “Blanco biológico (usos)”
        }
    )

with open(DEST, "w", encoding="utf-8") as f:
    json.dump(
        {
            "products": list(products.values()),
            "safety_notice": "Utilice los productos únicamente bajo recomendación de un ingeniero agrónomo certificado y siga la etiqueta."
        },
        f,
        ensure_ascii=False,
        indent=2,
    )

print(f"✔  Generado {DEST} con {len(products)} productos.")
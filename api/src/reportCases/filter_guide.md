# Guide de Création des Filtres

## Règles Générales
1. **Commencer par un groupe de conditions.**
2. **Toujours inclure un opérateur logique**, même si c'est le premier élément de la liste.
3. **Ouvrir une nouvelle liste de conditions** en plaçant le contenu entre parenthèses.

---

## Structure des Filtres

### Groupe de Conditions
```json
{
    "logicOperator": "",
    "conditions": []
}
```

### Condition
```json
{
    "logicOperator": "",
    "field": "",
    "comparisonOperator": "",
    "value": ""
}
```

---

## Valeurs Possibles

- **logicOperator** : `"AND"` | `"OR"`
- **comparisonOperator** : `"="` | `"!="` | `"<"` | `"<="` | `">"` | `">="` | `"LIKE"` | `"NOT LIKE"`

---

## Exemple

### JSON
```json
{
    "logicOperator": "AND",
    "conditions": [
        {
            "logicOperator": "AND",
            "field": "disease.name",
            "comparisonOperator": "=",
            "value": "Monkeypox"
        },
        {
            "logicOperator": "OR",
            "conditions": [
                {
                    "logicOperator": "AND",
                    "field": "disease.name",
                    "comparisonOperator": "=",
                    "value": "Coronavirus"
                },
                {
                    "logicOperator": "AND",
                    "field": "date",
                    "comparisonOperator": ">=",
                    "value": "2025-01-01"
                }
            ]
        }
    ]
}
```

### Conversion en SQL
```sql
(disease.name = 'Monkeypox' OR (disease.name = 'Coronavirus' AND date >= '2025-01-01'))
```
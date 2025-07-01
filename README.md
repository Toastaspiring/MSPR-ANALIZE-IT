# Pipeline ETL

Ce projet fournit un script ETL (Extract, Transform, Load) en Python pour importer des données de santé publique dans une base MySQL unique contenant les données nettoyées et structurées.

## Fonctionnalités

- Charge plusieurs jeux de données (population, vaccination, Covid-19, Monkeypox).
- Normalise les noms de pays.
- Interpole les données de population par jour.
- Calcule les taux de vaccination.
- Remplace les valeurs manquantes par 0.
- Affiche la durée d'exécution totale.

## Prérequis

- Python 3.7 ou plus
- Serveur MySQL accessible
- Dépendances :
  - `pandas`
  - `numpy`
  - `mysql-connector-python`

Installation des dépendances :

```bash
pip install pandas numpy mysql-connector-python
```

## Structure des fichiers

- `ETL.py` : Script principal.
- `ETL_doc.md` : Documentation technique (optionnel).
- `files/` : Dossier contenant les fichiers CSV à traiter.

## Utilisation

```bash
python ETL.py
```

Le script :

1. Charge les différents CSV.
2. Nettoie et transforme les données.
3. Insère les résultats dans `mspr_database`.
4. Affiche la durée totale de l’opération.

## Résultat

Le script affiche les étapes de progression, puis termine avec :

```
🎉 Traitement terminé.
⏱️ Durée totale : X.XX secondes
```

## Licence

Projet à usage interne et éducatif uniquement.

---

Créé avec ❤️ pour automatiser l'ETL.

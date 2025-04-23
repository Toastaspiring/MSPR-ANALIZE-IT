# Pipeline ETL

Ce projet fournit un script ETL (Extract, Transform, Load) en Python pour importer des données de santé publique dans deux bases de données MySQL : une base d'archives pour les données brutes, et une base principale avec des données transformées et structurées.

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
- `ETL_timed.py` : Version avec mesure du temps d'exécution.
- `ETL_doc.md` : Documentation technique.
- `files/` : Dossier contenant les fichiers CSV à traiter.

## Utilisation

```bash
python ETL_timed.py
```

Le script :

1. Charge les CSV bruts dans `mspr_database_archive`.
2. Nettoie et transforme les données.
3. Insère les données prêtes à l’emploi dans `mspr_database`.
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

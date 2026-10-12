# Kelik — site

Site de Kelik, studio vidéo événementiel d'Arthur et Adrien (Paris, Lille, Arras).

- Version en ligne aujourd'hui : https://lamascotte27.github.io/kelik-site/
- Adresse finale : https://kelik.fr/ (à brancher, voir plus bas)

Site statique : HTML, CSS et JavaScript, sans installation ni compilation. Tout se joue dans `index.html`, `site.css` et `site.js`. Les images et vidéos sont dans `assets/`.

## Mettre kelik.fr en ligne

### Option 1 : brancher le domaine sur GitHub Pages (gratuit, conseillé)

1. Chez OVH, dans la zone DNS de kelik.fr :
   - supprimer l'enregistrement A existant (`213.186.33.5`) et la redirection OVH (TXT `1|www.kelik.fr`) ;
   - ajouter 4 enregistrements A pour `kelik.fr` : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` ;
   - ajouter un CNAME pour `www` vers `lamascotte27.github.io`.
2. Ne pas toucher aux lignes **MX** et **SPF** : ce sont elles qui font marcher les boîtes mail @kelik.fr.
3. Sur GitHub, dans *Settings → Pages* du dépôt : saisir `kelik.fr` dans *Custom domain*, puis cocher *Enforce HTTPS* dès que le certificat est prêt.

La mise à jour DNS prend de quelques minutes à quelques heures.

### Option 2 : héberger chez OVH

Avec un hébergement web OVH : envoyer en FTP tout le contenu du dépôt (sauf le dossier `_archive` s'il existe) dans le dossier `www`.

## Une fois kelik.fr en ligne

- Remplacer `https://lamascotte27.github.io/kelik-site/` par `https://kelik.fr/` dans `index.html` (adresse canonique, Open Graph, données structurées), `sitemap.xml` et `robots.txt`.
- Le formulaire « Nous contacter » passe par FormSubmit : au premier message envoyé depuis kelik.fr, un e-mail d'activation arrive sur arthur@kelik.fr. Cliquer une fois sur « Activate Form », ensuite les messages arrivent directement.
- Déclarer le site dans Google Search Console et y envoyer `sitemap.xml`.

## À compléter

- Mentions légales : les champs entre crochets (forme juridique, SIRET, hébergeur…) dans `mentions-legales.html`.
- Avis clients : la section a été retirée en attendant de vrais témoignages.

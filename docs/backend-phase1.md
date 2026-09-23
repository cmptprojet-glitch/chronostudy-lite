# ChronoStudy — Backend Phase 1

## État du lot

Cette branche livre le socle de sécurisation local et la migration Supabase préparatoire du blueprint V11.

### Livré

- Authentification Express durcie avec cookie de session `HttpOnly`, `SameSite=Lax` et `Secure` en production.
- Support conservé du header `Authorization: Bearer` pour la compatibilité des clients existants.
- Middleware `requireAuth` appliqué aux données utilisateur, groupes, export/purge RGPD, calendrier et endpoints IA.
- Suppression des identifiants `sessionId` fournis par le client pour choisir la cible de données.
- Suppression du compte de démonstration par défaut en production; activation uniquement avec `ENABLE_DEMO_USER=true` hors production.
- Validation plus stricte des emails, mots de passe et champs de profil.
- Comparaison constante des hashes de mots de passe.
- Port configurable par `PORT`.
- Migration SQL initiale avec profils, données d’étude, planning, decks, SRS, Pomodoro, pièces jointes et intégrations.
- RLS activé sur toutes les tables utilisateur et politiques de propriété basées sur `auth.uid()`.

### Vérifications

```text
npm run lint       ✅
npm run build      ✅
HTTP sans session  ✅ 401 sur données et IA
Inscription        ✅ cookie chronostudy_session HttpOnly
Accès authentifié  ✅ accès limité à l’utilisateur courant
```

## Prérequis pour l’étape Supabase distante

Le connecteur Supabase ne retourne actuellement aucun projet accessible. La migration est donc versionnée localement mais n’a pas été appliquée à distance.

Lorsque le projet Supabase sera connecté :

1. Vérifier le projet et son environnement (développement ou production).
2. Appliquer `supabase/migrations/202609230001_foundation.sql`.
3. Vérifier les tables, index et politiques RLS avec les outils Supabase.
4. Générer les types TypeScript Supabase.
5. Remplacer progressivement les `Map` mémoire par des repositories Supabase.
6. Migrer l’authentification Express vers Supabase Auth et supprimer le stockage local des mots de passe.

## Limites connues de cette étape

Le serveur Express utilise encore des stores mémoire pour les comptes et les données. Cette compatibilité transitoire permet de sécuriser l’API sans bloquer le développement, mais elle ne doit pas être utilisée comme persistance de production.

Les boutons de connexion sociale du frontend restent des simulations locales et devront être raccordés à Supabase Auth OAuth lors du lot Auth.

La clé OpenAI BYOK n’est pas encore traitée. Elle devra être stockée dans Supabase Vault ou dans un mécanisme secret équivalent; seule une référence de secret est prévue dans `user_integrations`.

## Étapes suivantes proposées

1. Connecter un projet Supabase de développement.
2. Appliquer et vérifier la migration fondation.
3. Ajouter un adaptateur `server/supabase.ts` et des repositories typés.
4. Migrer le profil et `user_study_data`.
5. Ajouter les Edge Functions `ai-chat-attachment`, `generate-deck`, `timetable-scan` et `pronote-sync`.
6. Ajouter les tests d’intégration RLS et les tests de synchronisation.

## Lot groupes et validation Auth

La migration `supabase/migrations/202609230002_study_groups.sql` ajoute les tables `study_groups`, `study_group_members`, `study_group_messages` et `study_group_shared_decks`, ainsi que leurs index et politiques RLS. Les membres portent une copie contrôlée du nom et des initiales afin que les lectures de groupe n’aient pas besoin d’exposer directement `auth.users`.

Les routes groupes de `server/storage.ts` utilisent désormais PostgREST et ne conservent plus les groupes dans une `Map` mémoire. La création, l’adhésion, les messages et les decks partagés sont écrits sous l’identité Supabase de l’utilisateur connecté.

Le serveur conserve deux cookies `HttpOnly` : un cookie d’accès court et un cookie refresh de trente jours. Si `/auth/me` ou `requireAuth` reçoit un access token expiré, le serveur appelle automatiquement `grant_type=refresh_token`, remplace les cookies et poursuit la requête avec le nouvel access token.

Une page de validation frontend est disponible sur `/auth-test`. Elle teste l’inscription, la connexion, l’appel à `/api/v1/auth/me` et la déconnexion avec `credentials: include`. Le token n’est pas lisible par JavaScript.

## Lot P1 — sessions d’étude et Pomodoro

La migration `supabase/migrations/202609230003_study_sessions.sql` ajoute `study_sessions`, avec RLS par utilisateur, pour conserver les sessions manuelles, Pomodoro et flashcards.

Les endpoints ajoutés sont `GET/POST /api/v1/study-sessions`, `POST /api/v1/pomodoro/start` et `PATCH /api/v1/pomodoro/:id/finish`. La clôture d’un Pomodoro terminé crée automatiquement un log dans `study_sessions` lorsque le temps focalisé est d’au moins une minute.

La page `/auth-test` couvre désormais l’inscription, la connexion, `/auth/me`, la déconnexion, le chargement des groupes, la création, l’adhésion par code, la publication d’un message, le démarrage et la clôture d’un Pomodoro et la lecture des sessions personnelles.

## Lot P2 — tests d’intégration

La commande `npm run test:integration` compile le serveur puis exécute `tests/integration/backend.test.mjs` avec le runner natif Node. La suite démarre un serveur isolé, vérifie le health check Supabase, les refus `401` des routes privées et la disponibilité de `/auth-test`.

Le scénario authentifié complet est activé lorsque `TEST_AUTH_EMAIL` et `TEST_AUTH_PASSWORD` sont fournis. Il vérifie alors la connexion, `/auth/me`, les groupes, la création et le message de groupe, la création d’une session d’étude et le cycle Pomodoro complet. Exemple :

```bash
TEST_AUTH_EMAIL=compte-de-test@domaine.fr \
TEST_AUTH_PASSWORD='mot-de-passe-de-test' \
npm run test:integration
```

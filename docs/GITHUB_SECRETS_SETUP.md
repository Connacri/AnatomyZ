# Configuration des Secrets GitHub Actions — AnatomyZ

Ce document récapitule les **Secrets et Variables d'environnement** à renseigner dans votre dépôt GitHub (`Settings > Secrets and variables > Actions`) pour permettre la compilation, signature automatique et publication des builds Android (**APK & AAB**) et Web.

---

## 1. Secrets de Signature Android (Keystore Release)

Rendez-vous sur **GitHub > Votre Dépôt > Settings > Secrets and variables > Actions > New repository secret** :

| Nom du Secret | Description | Valeur à copier |
| :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Keystore Release PKCS12 encodé en base64 | *(Voir bloc ci-dessous)* |
| `ANDROID_KEYSTORE_PASSWORD` | Mot de passe du Keystore | `anatomyz_release_secret_2026` |
| `ANDROID_KEY_ALIAS` | Alias de la clé de signature | `anatomyz_release_key` |
| `ANDROID_KEY_PASSWORD` | Mot de passe de la clé privée | `anatomyz_release_secret_2026` |

### Valeur de `ANDROID_KEYSTORE_BASE64` :
```text
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
```

---

## 2. Empreintes Numériques Firebase Console

Dans votre projet Firebase (`mega-inscriber-xcbh2` > Paramètres du projet > Vos applications > `com.example.anatomyz`) :

### Empreintes de Signature Release :
* **SHA-1** : `93:D2:4D:EA:8C:62:C4:46:DE:40:17:7D:DE:EA:FB:0F:0C:F1:7A:38`
* **SHA-256** : `46:8E:6C:C7:14:94:00:55:BE:FD:DA:DF:DD:24:F0:B7:96:69:7E:24:57:E8:4E:81:E2:08:E2:49:2A:25:D3:9B`

### Empreintes de Signature Debug :
* **SHA-1** : `E4:29:2E:FA:E0:39:7F:B4:11:EE:A4:B6:88:A2:8F:C7:7F:F8:B7:BE`
* **SHA-256** : `EB:63:4B:76:FE:B2:DC:33:5B:06:D6:75:EB:B5:B3:88:46:6D:5C:6B:1D:DD:9E:69:EF:21:53:E9:2E:94:CB:F4`

---

## 3. Déclenchement automatique CI/CD

Dès qu'un commit ou tag est poussé sur `master` ou `v*`, le workflow `.github/workflows/flutter.yml` :
1. Restaure le Keystore et génère `key.properties` à partir des secrets.
2. Compile l'APK Release signé (`AnatomyZ-release.apk`).
3. Compile l'AAB Release signé (`AnatomyZ-release.aab`).
4. Compile l'application Web React 19 / Vite.
5. Déploie les artefacts et publie la Release GitHub automatiquement avec les binaires signés.

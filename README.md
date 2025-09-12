# 🐝 HiveCash — Billetera PWA para HBD en la Blockchain de Hive

HiveCash es una aplicación web progresiva (PWA) que permite gestionar saldos en HBD de forma segura, descentralizada y offline. Diseñada para funcionar tanto en dispositivos móviles como de escritorio, HiveCash combina criptografía avanzada, sincronización con la blockchain de Hive y una experiencia de usuario alineada con el branding de HiveCuba.

---

## 🚀 Características principales

- ✅ **Offline-first**: Funciona sin conexión, con sincronización inteligente.
- 📱 **Instalable**: PWA que se puede instalar como app nativa en móvil y desktop.
- 🎨 **Diseño visual**: Inspirado en HiveCuba y Hive-Keychain (colores, tipografía, estilo).
- 🌐 **Multilenguaje**: Soporte para español e inglés.
- 🔐 **Seguridad local**: Frase mnemónica BIP39 cifrada con contraseña y almacenada en el dispositivo.
- 📊 **Historial completo**: Todas las operaciones (pendientes, confirmadas, usadas) se registran localmente.
- 📡 **Intercambio offline**: Envío y recepción de tokens mediante códigos QR cifrados.
- 🔁 **Interacción onchain**: Depósitos y envíos a través de Hive-Keychain.

---

## 🧠 Funcionamiento técnico

### 🔑 Inicio y autenticación

- Generación o importación de frase mnemónica BIP39 (12 palabras).
- Cifrado local con contraseña (AES).
- Derivación de claves con algoritmo SCRYPT:
  ```js
  SCRYPT_PARAMS = {
    length: 32,
    n: 16384,
    r: 8,
    p: 1
  }
  salt = bytes("HiveCash")


### 💰 Cálculo de saldo

- Se derivan claves hasta encontrar un hash con  estado `unmint` y se continúa la busqueda 10 hash adicionales para prevenir posibles desplazamientos de operaciones.
- Se consulta al backend cada hash para obtener firma, monto y estado.
- El saldo disponible es la suma de montos con estado `payed`.

### 📥 Recibir tokens

- **Offline**: escaneo de QR con token cifrado, almacenado como pendiente hasta confirmación.
- **Onchain**: generación de hash + monto, backend devuelve firma y link de pago para Hive-Keychain.

### 📤 Enviar tokens

- **Offline**: selección de UTXOs (`payed`), generación de JSON cifrado con clave pública del backend, compartido por QR.
- **Onchain**: envío a usuario Hive con memo, gestionado por el backend.

## 🛠️ Instalación y desarrollo
### Requisitos

- Node.js >= 18

### Instalación

```bash
git clone https://github.com/HiveCuba-DeV/HiveCash-PWA.git
cd HiveCash-PWA
npm install
npm run dev
```

### Build para producción

```bash
npm run build
```

## 📚 Créditos y soporte

Desarrollado por el equipo de [HiveCuba](https://hivecuba.com).  
Para soporte técnico y comunidad, únete al grupo en Telegram: [ComunidadCubanaHive](https://t.me/comunidadcubanahive)

---

## 🧪 Estado del proyecto

> 🚧 En desarrollo activo.  
> Se agradecen contribuciones, sugerencias y reportes de errores.

---

## 🛡️ Licencia

Este proyecto se distribuye bajo la licencia MIT.  
```

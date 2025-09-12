import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App General
      appName: 'HiveCash',
      loading: 'Loading...',
      continue: 'Continue',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      exact: 'Exactly',
      touser: 'to HIVE\'s user',
      wmemo: 'with the obligatory memo',

      // Auth
      password: 'Password',
      confirmPassword: 'Confirm Password',
      unlock: 'Unlock',
      createPassword: 'Create Password',
      enterPassword: 'Enter your password',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      invalidPassword: 'Invalid password',
      resetWallet: 'Reset Wallet',

      // Onboarding
      welcomeTitle: 'Welcome to HiveCash',
      welcomeSubtitle: 'Your secure HBD wallet on Hive blockchain',
      generateSeed: 'Generate New Wallet',
      importSeed: 'Import Existing Wallet',
      seedPhrase: 'Recovery Phrase',
      seedPhraseHint: 'Write down these 12 words in order and keep them safe',
      importSeedPlaceholder: 'Enter your 12-word recovery phrase...',
      saveAndContinue: 'Save and Continue',

      // Home
      totalBalance: 'Total Balance',
      currentDerivation: 'Current Derivation',
      recentActivity: 'Recent Activity',
      receive: 'Receive',
      send: 'Send',
      history: 'History',
      about: 'About',

      // Receive
      receiveOffline: 'Receive Offline',
      receiveOnchain: 'Receive On-chain',
      scanQR: 'Scan QR Code',
      confirmWhenOnline: 'Confirm when online',
      pendingReceives: 'Pending Receives',
      generatePaymentQR: 'Generate Payment QR',
      amount: 'Amount',
      hash: 'Hash',
      copyLink: 'Copy Link',
      confirmDeposit: 'Confirm Deposit',

      // Send
      sendOffline: 'Send Offline',
      sendOnchain: 'Send On-chain',
      selectUTXOs: 'Select UTXOs',
      availableUTXOs: 'Available UTXOs',
      recipientUser: 'Recipient User',
      memo: 'Memo',
      previewTransaction: 'Preview Transaction',
      sendTransaction: 'Send Transaction',
      pasteRawData: 'Paste RawData',
      processRawData: 'Process RawData',

      // History
      allTransactions: 'All Transactions',
      pending: 'Pending',
      confirmed: 'Confirmed',
      used: 'Used',
      filterByType: 'Filter by Type',
      filterByStatus: 'Filter by Status',

      // About
      version: 'Version',
      developers: 'Developers',
      telegramGroup: 'Telegram Group',
      github: 'GitHub Repository',

      // Errors
      cameraError: 'Camera access denied',
      qrScanError: 'Error scanning QR code',
      networkError: 'Network error',
      invalidQR: 'Invalid QR code',

      //NFC      
      nfcNotSupported: 'This device does not support NFC.',
      nfcPermissionError: 'NFC permission denied.',
      nfcReadError: 'Error reading the NFC tag.',
      scanNFC: 'Scan by NFC',
      nfcRequesting: 'Requesting NFC permission...',
      nfcHoldDevice: 'Bring your device closer to the NFC tag.',
      SHAREFC: 'Share by NFC',
      nfcWriteError: 'Error typing on the NFC tag.',
      nfcWriting: 'Bring your device closer to the NFC reader to transmit...',
      nfcWriteSuccess: 'Data transmitted by NFC.',
      close: 'Close',

      //QRScanner
      qrstart: 'Start scanning',
      qrstop: 'Stop scanning',
      qrclear: 'Clear data',
      qrreset: 'Reset',
      qrfrac: 'Fragments:',
      qrfracrec:'Fragments received:',
      qrnone: 'Nothing has been scanned yet',
      qrtitle: 'Scan with HiveCash Scanner',
      permDenied:'No camera access',

      offlineTransaction: 'Offline Transaction',
    }
  },
  es: {
    translation: {
      // App General
      appName: 'HiveCash',
      loading: 'Cargando...',
      continue: 'Continuar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      back: 'Atrás',
      next: 'Siguiente',
      exact: 'Exactamente',
      touser: 'Al usuario de Hive',
      wmemo: 'con el memo obligatorio',

      // Auth
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      unlock: 'Desbloquear',
      createPassword: 'Crear Contraseña',
      enterPassword: 'Ingresa tu contraseña',
      passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
      passwordMismatch: 'Las contraseñas no coinciden',
      invalidPassword: 'Contraseña inválida',
      resetWallet: 'Reiniciar Billetera',

      // Onboarding
      welcomeTitle: 'Bienvenido a HiveCash',
      welcomeSubtitle: 'Tu billetera segura de HBD en la blockchain de Hive',
      generateSeed: 'Generar Nueva Billetera',
      importSeed: 'Importar Billetera Existente',
      seedPhrase: 'Frase de Recuperación',
      seedPhraseHint: 'Anota estas 12 palabras en orden y manténlas seguras',
      importSeedPlaceholder: 'Ingresa tu frase de recuperación de 12 palabras...',
      saveAndContinue: 'Guardar y Continuar',

      // Home
      totalBalance: 'Saldo Total',
      currentDerivation: 'Derivación Actual',
      recentActivity: 'Actividad Reciente',
      receive: 'Recibir',
      send: 'Enviar',
      history: 'Historial',
      about: 'Acerca de',

      // Receive
      receiveOffline: 'Recibir Offline',
      receiveOnchain: 'Recibir On-chain',
      scanQR: 'Escanear Código QR',
      confirmWhenOnline: 'Confirmar al conectar',
      pendingReceives: 'Recepciones Pendientes',
      generatePaymentQR: 'Generar QR de Pago',
      amount: 'Monto',
      hash: 'Hash',
      copyLink: 'Copiar Enlace',
      confirmDeposit: 'Confirmar Depósito',

      // Send
      sendOffline: 'Enviar Offline',
      sendOnchain: 'Enviar On-chain',
      selectUTXOs: 'Seleccionar UTXOs',
      availableUTXOs: 'UTXOs Disponibles',
      recipientUser: 'Usuario Destinatario',
      memo: 'Memo',
      previewTransaction: 'Vista Previa de Transacción',
      sendTransaction: 'Enviar Transacción',
      pasteRawData: 'Pegar RawData',
      processRawData: 'Procesar RawData',

      // History
      allTransactions: 'Todas las Transacciones',
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      used: 'Usada',
      filterByType: 'Filtrar por Tipo',
      filterByStatus: 'Filtrar por Estado',

      // About
      version: 'Versión',
      developers: 'Desarrolladores',
      telegramGroup: 'Grupo de Telegram',
      github: 'Repositorio GitHub',

      // Errors
      cameraError: 'Acceso a cámara denegado',
      qrScanError: 'Error escaneando código QR',
      networkError: 'Error de red',
      invalidQR: 'Código QR inválido',

      //NFC
      nfcNotSupported: 'Este dispositivo no soporta NFC.',
      nfcPermissionError: 'Permiso NFC denegado.',
      nfcReadError: 'Error leyendo la etiqueta NFC.',
      scanNFC: 'Escanear por NFC',
      nfcRequesting: 'Solicitando permiso NFC…',
      nfcHoldDevice: 'Acerca tu dispositivo a la etiqueta NFC.',
      shareNFC: 'Compartir por NFC',
      nfcWriteError: 'Error escribiendo en la etiqueta NFC.',
      nfcWriting: 'Acerca tu dispositivo al lector NFC para transmitir…',
      nfcWriteSuccess: 'Datos transmitidos por NFC.',
      close: 'Cerrar',

      //QRScanner
      qrstart:'Iniciar escaneo',
      qrstop: 'Detener escaneo',
      qrclear: 'Limpiar datos',
      qrreset:'Reiniciar',
      qrfrac:'Fragmentos:',
      qrfracrec:'Fragmentos recibidos:',
      qrnone:'Aún no se ha escaneado nada',
      qrtitle: 'Escanear con el escaner de HiveCash',
      permDenied:'No hay acceso a la cámara',

      offlineTransaction: 'Transacción Offline',


    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
import React, { useState } from 'react';
import { CheckCircle, Copy } from 'lucide-react';

interface SafeCopyButtonProps {
  text: string;
}

export const SafeCopyButton: React.FC<SafeCopyButtonProps> = ({ text:text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      {copied ? (
        <>
          <CheckCircle size={18} />
          ¡Copiado!
        </>
      ) : (
        <>
          <Copy size={18} />
          Copiar enlace
        </>
      )}
    </button>
  );
};

export default SafeCopyButton;
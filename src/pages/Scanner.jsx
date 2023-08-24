import { QrScanner } from '@yudiel/react-qr-scanner';
import { useEffect } from 'react';


export default function Scanner() {
  

  return (
    <QrScanner
      onDecode={(result) => console.log(result)}
      onError={(error) => console.log(error?.message)}
    />
  );
}

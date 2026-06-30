import QRCode from 'qrcode';
import { v4 as uuid } from 'uuid';

export async function createSmartCardPayload(worker, existingCode) {
  const plainWorker = typeof worker.get === 'function' ? worker.get({ plain: true }) : worker;
  const user = plainWorker.User || {};
  const code = existingCode || plainWorker.smartCardCode || `BI-${uuid()}`;
  const payload = {
    app: 'SCPRAS',
    type: 'worker-smart-card',
    workerId: plainWorker.id,
    smartCardCode: code,
    fullName: user.fullName || 'Unknown Worker',
    position: plainWorker.position,
    department: plainWorker.department,
    status: plainWorker.status,
    phone: user.phone,
    email: user.email,
    verificationPath: `/api/workers/card/${code}`,
    generatedAt: new Date().toISOString(),
  };
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
    width: 512,
    margin: 1,
    errorCorrectionLevel: 'M',
  });

  return { code, qrDataUrl, payload };
}

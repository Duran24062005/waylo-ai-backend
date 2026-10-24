import { errors } from '../../errors';
import type { ActivationInput, ActivationResult, CanonicalAppointment, CanonicalPatient, IpsClient } from './types';

// Adaptador mock: sin red, para desarrollo local y tests.
// Acepta el código de activación 123456; cualquier otro → 401 LINK_INVALID.
const MOCK_ACTIVATION_CODE = '123456';

export class MockIpsClient implements IpsClient {
  async exchangeActivation(input: ActivationInput): Promise<ActivationResult> {
    if (input.activationCode !== MOCK_ACTIVATION_CODE) throw errors.linkInvalid();
    return { accessToken: `mock-token:${input.documentNumber}`, expiresInSeconds: 3600, patientId: 42 };
  }

  async getPatient(_accessToken: string, patientId: number): Promise<CanonicalPatient> {
    return {
      patientId,
      name: 'Paciente Demo',
      sex: 'F',
      birthDate: '1990-05-17',
      city: 'Bogotá',
      eps: 'Salud Total',
      primarySite: { id: 1, name: 'Sede Centro', address: 'Calle 10 # 5-20', city: 'Bogotá' },
    };
  }

  async listAppointments(): Promise<CanonicalAppointment[]> {
    return [];
  }
}

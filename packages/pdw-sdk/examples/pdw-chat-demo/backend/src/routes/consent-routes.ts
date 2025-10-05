import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { ConsentRepository, ConsentRequest, PermissionScope } from '@personal-data-wallet/sdk';

import type { PdwClient } from '../services/pdw-client.js';

const permissionScopeValues = [
  'read:memories',
  'write:memories',
  'read:preferences',
  'write:preferences',
  'read:contexts',
  'write:contexts',
] as const;

const permissionScopeEnum = z.enum(permissionScopeValues);

const requestConsentSchema = z.object({
  requesterWallet: z.string().min(1, 'requesterWallet is required'),
  targetWallet: z.string().min(1, 'targetWallet is required'),
  purpose: z.string().min(1, 'purpose is required'),
  scopes: z.array(permissionScopeEnum).min(1, 'At least one scope is required'),
  expiresIn: z.number().int().positive().optional(),
});

const approveConsentSchema = z.object({
  userAddress: z.string().min(1, 'userAddress is required'),
  contextId: z.string().min(1, 'contextId is required'),
});

const denyConsentSchema = z.object({
  userAddress: z.string().min(1, 'userAddress is required'),
});

async function resolveConsentRequest(
  pdw: PdwClient,
  repository: ConsentRepository | undefined,
  requestId: string,
  targetWallet: string
) : Promise<ConsentRequest | null> {
  if (repository) {
    const record = await repository.getById(requestId);
    if (record) {
      return record;
    }
  }

  const pendingForUser = await pdw.permissionService.getPendingConsents(targetWallet);
  return pendingForUser.find((request: ConsentRequest) => request.requestId === requestId) ?? null;
}

export function createConsentRouter(
  pdw: PdwClient,
  repository: ConsentRepository | undefined
) {
  const router = Router();

  router.get('/pending', async (req: Request, res: Response) => {
    const userAddress = (req.query.userAddress ?? req.query.user) as string | undefined;
    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress query parameter is required' });
    }

    try {
      const pending = await pdw.permissionService.getPendingConsents(userAddress);
      res.json({ pending });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pending consents';
      res.status(500).json({ error: message });
    }
  });

  router.get('/grants', async (req: Request, res: Response) => {
    const userAddress = (req.query.userAddress ?? req.query.user) as string | undefined;
    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress query parameter is required' });
    }

    try {
      const grants = await pdw.permissionService.getGrantsByUser(userAddress);
      res.json({ grants });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load grants';
      res.status(500).json({ error: message });
    }
  });

  router.get('/audit', async (req: Request, res: Response) => {
    const userAddress = (req.query.userAddress ?? req.query.user) as string | undefined;
    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress query parameter is required' });
    }

    try {
      const audit = await pdw.permissionService.getPermissionAudit(userAddress);
      res.json({ audit });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load audit log';
      res.status(500).json({ error: message });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    const parseResult = requestConsentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const data = parseResult.data;

    try {
      const record = await pdw.permissionService.requestConsent({
        requesterWallet: data.requesterWallet,
        targetWallet: data.targetWallet,
        scopes: data.scopes,
        purpose: data.purpose,
        expiresIn: data.expiresIn,
      });

      res.status(201).json({ consent: record });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create consent request';
      res.status(500).json({ error: message });
    }
  });

  router.post('/:requestId/approve', async (req: Request, res: Response) => {
    const parseResult = approveConsentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const { userAddress, contextId } = parseResult.data;
    const { requestId } = req.params;

    try {
      const consentRequest = await resolveConsentRequest(pdw, repository, requestId, userAddress);

      if (!consentRequest) {
        return res.status(404).json({ error: 'Consent request not found' });
      }

      const grant = await pdw.permissionService.approveConsent(userAddress, consentRequest, contextId);
      res.json({ grant });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve consent request';
      res.status(500).json({ error: message });
    }
  });

  router.post('/:requestId/deny', async (req: Request, res: Response) => {
    const parseResult = denyConsentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const { userAddress } = parseResult.data;
    const { requestId } = req.params;

    try {
      const consentRequest = await resolveConsentRequest(pdw, repository, requestId, userAddress);
      if (!consentRequest) {
        return res.status(404).json({ error: 'Consent request not found' });
      }

      const success = await pdw.permissionService.denyConsent(userAddress, consentRequest);
      if (!success) {
        return res.status(400).json({ error: 'Consent request could not be denied' });
      }

      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deny consent request';
      res.status(500).json({ error: message });
    }
  });

  return router;
}

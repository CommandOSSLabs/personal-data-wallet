'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { formatAddress } from '@/lib/sui';
import { Trash2, Calendar, Shield, AlertCircle } from 'lucide-react';

interface AppPermission {
  permissionId: string;
  appAddress: string;
  appName?: string;
  dataIds: string[];
  grantedAt: string;
  expiresAt?: string;
  canRevoke: boolean;
}

export default function PermissionManager() {
  const { address } = useWallet();
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchPermissions();
    }
  }, [address]);

  const fetchPermissions = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/seal/ibe/permissions?userAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const revokePermission = async (permissionId: string) => {
    if (!address) return;
    
    setRevoking(permissionId);
    
    try {
      const response = await fetch('/api/seal/ibe/permissions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          permissionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke permission');
      }
      
      // Refresh permissions list
      await fetchPermissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke permission');
    } finally {
      setRevoking(null);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (!address) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Connect your wallet to manage permissions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">App Permissions</h2>
        <Shield className="w-6 h-6 text-green-500" />
      </div>
      
      {permissions.length === 0 ? (
        <p className="text-gray-400">No app permissions granted yet</p>
      ) : (
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div
              key={permission.permissionId}
              className={`border rounded-lg p-4 ${
                isExpired(permission.expiresAt)
                  ? 'border-red-800 bg-red-900/20'
                  : 'border-gray-700 bg-gray-900/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-white">
                      {permission.appName || formatAddress(permission.appAddress)}
                    </h3>
                    {isExpired(permission.expiresAt) && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    App: {formatAddress(permission.appAddress)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Granted: {new Date(permission.grantedAt).toLocaleDateString()}</span>
                    </div>
                    {permission.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Expires: {new Date(permission.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {permission.dataIds.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Access to {permission.dataIds.length} data item{permission.dataIds.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
                
                {permission.canRevoke && !isExpired(permission.expiresAt) && (
                  <button
                    onClick={() => revokePermission(permission.permissionId)}
                    disabled={revoking === permission.permissionId}
                    className="ml-4 p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Revoke permission"
                  >
                    {revoking === permission.permissionId ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
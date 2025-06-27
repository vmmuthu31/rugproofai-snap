import { useRequest } from './useRequest';
import { defaultSnapOrigin } from '../config';

export type InvokeSnapParams = {
  method: string;
  params?: Record<string, unknown>;
};

/**
 * Utility hook to wrap the `wallet_invokeSnap` method.
 *
 * @param snapId - The Snap ID to invoke. Defaults to the snap ID specified in the
 * config.
 * @returns The invokeSnap wrapper method.
 */
export const useInvokeSnap = (snapId = defaultSnapOrigin) => {
  const request = useRequest();

  /**
   * Invoke the requested Snap method.
   *
   * @param params - The invoke params.
   * @param params.method - The method name.
   * @param params.params - The method params.
   * @returns The Snap response.
   */
  const invokeSnap = async ({ method, params }: InvokeSnapParams) => {
    try {
      // First, ensure we have permission to communicate with the snap
      await request({
        method: 'wallet_requestSnaps',
        params: {
          [snapId]: {},
        },
      });

      // Then invoke the snap method
      const response = await request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: params ? { method, params } : { method },
        },
      });

      return response;
    } catch (error) {
      console.error('Error invoking snap:', error);

      // If it's a permission error, try to request permissions again
      if (error instanceof Error && error.message.includes('permission')) {
        console.log('Requesting snap permissions...');
        await request({
          method: 'wallet_requestSnaps',
          params: {
            [snapId]: {},
          },
        });

        // Retry the invocation
        return await request({
          method: 'wallet_invokeSnap',
          params: {
            snapId,
            request: params ? { method, params } : { method },
          },
        });
      }

      throw error;
    }
  };

  return invokeSnap;
};

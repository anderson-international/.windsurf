import { missingSymbol } from './non-existent-file';

export function useMissing(): number {
  return missingSymbol ? 1 : 0;
}

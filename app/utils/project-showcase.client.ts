// Client-side utilities for project showcase
export function getSlotStatusColor(status: 'allocated' | 'confirmed' | 'cancelled'): string {
  switch (status) {
    case 'allocated':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'confirmed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

export function formatSlotNumber(slotNumber: number): string {
  return `#${slotNumber.toString().padStart(2, '0')}`;
}

export function getStatusDisplayText(status: 'allocated' | 'confirmed' | 'cancelled'): string {
  switch (status) {
    case 'allocated':
      return 'Allocated';
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Utility functions for project showcase event management
export function generateEventId(eventName: string): string {
  const timestamp = Date.now();
  const slug = eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug}-${timestamp}`;
}

export function validateEventData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.eventName || data.eventName.trim().length < 3) {
    errors.push('Event name must be at least 3 characters long');
  }

  if (!data.eventDate) {
    errors.push('Event date is required');
  } else {
    const eventDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      errors.push('Event date cannot be in the past');
    }
  }

  if (!data.venue || data.venue.trim().length < 2) {
    errors.push('Venue must be at least 2 characters long');
  }

  if (!data.maxSlots || data.maxSlots < 1 || data.maxSlots > 100) {
    errors.push('Max slots must be between 1 and 100');
  }

  if (data.presentationDuration && (data.presentationDuration < 5 || data.presentationDuration > 30)) {
    errors.push('Presentation duration must be between 5 and 30 minutes');
  }

  if (data.qaDuration && (data.qaDuration < 2 || data.qaDuration > 15)) {
    errors.push('Q&A duration must be between 2 and 15 minutes');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatEventStatus(status: string): { label: string; color: string; icon: string } {
  switch (status) {
    case 'draft':
      return { 
        label: 'Draft', 
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: 'edit'
      };
    case 'open':
      return { 
        label: 'Open for Registration', 
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: 'check-circle'
      };
    case 'closed':
      return { 
        label: 'Registration Closed', 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: 'x-circle'
      };
    case 'completed':
      return { 
        label: 'Completed', 
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: 'trophy'
      };
    case 'cancelled':
      return { 
        label: 'Cancelled', 
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: 'alert-triangle'
      };
    default:
      return { 
        label: 'Unknown', 
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: 'help-circle'
      };
  }
}

export function calculateEventProgress(event: any): {
  slotsProgress: number;
  timeProgress: number;
  isUpcoming: boolean;
  isActive: boolean;
  isPast: boolean;
} {
  const slotsProgress = (event.allocated_slots / event.max_slots) * 100;
  
  const eventDate = new Date(event.event_date);
  const now = new Date();
  const timeDiff = eventDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const isUpcoming = daysDiff > 0;
  const isActive = daysDiff === 0;
  const isPast = daysDiff < 0;
  
  // Calculate time progress (30 days before event = 0%, event day = 100%)
  const maxDaysBeforeEvent = 30;
  const timeProgress = Math.max(0, Math.min(100, ((maxDaysBeforeEvent - daysDiff) / maxDaysBeforeEvent) * 100));
  
  return {
    slotsProgress,
    timeProgress,
    isUpcoming,
    isActive,
    isPast
  };
}

export function getEventActionButtons(event: any, userRole: string): Array<{
  label: string;
  action: string;
  color: string;
  icon: string;
  enabled: boolean;
}> {
  const actions = [];
  
  if (userRole === 'organiser') {
    actions.push({
      label: 'Manage',
      action: 'manage',
      color: 'blue',
      icon: 'settings',
      enabled: true
    });
    
    if (event.status === 'draft') {
      actions.push({
        label: 'Open Registration',
        action: 'open',
        color: 'green',
        icon: 'play',
        enabled: true
      });
    }
    
    if (event.status === 'open') {
      actions.push({
        label: 'Close Registration',
        action: 'close',
        color: 'yellow',
        icon: 'pause',
        enabled: true
      });
    }
    
    actions.push({
      label: 'Duplicate',
      action: 'duplicate',
      color: 'purple',
      icon: 'copy',
      enabled: true
    });
    
    actions.push({
      label: 'Delete',
      action: 'delete',
      color: 'red',
      icon: 'trash',
      enabled: event.allocated_slots === 0
    });
  }
  
  actions.push({
    label: 'View',
    action: 'view',
    color: 'gray',
    icon: 'eye',
    enabled: event.status === 'open'
  });
  
  return actions;
}

export function exportEventData(event: any, slots: any[]): void {
  const exportData = {
    event: {
      ...event,
      exported_at: new Date().toISOString(),
      export_version: '1.0'
    },
    slots: slots.map(slot => ({
      ...slot,
      exported_at: new Date().toISOString()
    })),
    summary: {
      total_slots: event.max_slots,
      allocated_slots: slots.length,
      available_slots: event.max_slots - slots.length,
      allocation_percentage: Math.round((slots.length / event.max_slots) * 100)
    }
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.event_id}-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

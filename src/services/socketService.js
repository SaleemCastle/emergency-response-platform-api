class SocketService {
  constructor(io) {
    this.io = io;
  }

  // ... existing methods ...

  emitNewEmergency(emergency) {
    if (!this.io) {
      console.warn('Socket.IO instance not available');
      return;
    }

    try {
      // Emit to all clients
      this.io.emit('newEmergency', {
        ...emergency,
        severityLabel: this.getSeverityLabel(emergency.severity)
      });

      // Emit to type-specific channel
      this.io.emit(`emergency:${emergency.type.toLowerCase()}`, {
        event: 'NEW_EMERGENCY',
        data: emergency
      });

      // Emit to location-specific channel
      this.io.emit(
        `emergency:location:${emergency.location.toLowerCase().replace(/\s+/g, '_')}`,
        {
          event: 'NEW_EMERGENCY',
          data: emergency
        }
      );
    } catch (error) {
      console.error('Error emitting socket event:', error);
    }
  }

  getSeverityLabel(severity) {
    switch(severity) {
      case 0: return 'Very Low';
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  }

  emitEmergencyConfirmation(data) {
    if (!this.io) {
      console.warn('Socket.IO instance not available');
      return;
    }

    try {
      this.io.emit('emergencyConfirmation', {
        event: 'EMERGENCY_CONFIRMATION',
        data
      });

      // If hits reach certain thresholds, emit special events
      if (data.hits === 5) {
        this.io.emit('emergencyTrending', {
          event: 'EMERGENCY_TRENDING',
          data
        });
      }

      if (data.hits === 10) {
        this.io.emit('emergencyHot', {
          event: 'EMERGENCY_HOT',
          data
        });
      }
    } catch (error) {
      console.error('Error emitting confirmation event:', error);
    }
  }
}

module.exports = SocketService; 
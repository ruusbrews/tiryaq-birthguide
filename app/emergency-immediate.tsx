// emergency-immediate.tsx - Immediate danger emergency protocol

import React from 'react';
import { ProtocolViewer } from '../components/ProtocolViewer';
import { EMERGENCY_PROTOCOLS } from '../data/protocols';

export default function EmergencyImmediateScreen() {
    return <ProtocolViewer protocol={EMERGENCY_PROTOCOLS.immediate} />;
}

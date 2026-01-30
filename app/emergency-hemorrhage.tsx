// emergency-hemorrhage.tsx - Severe bleeding emergency protocol

import React from 'react';
import { ProtocolViewer } from '../components/ProtocolViewer';
import { EMERGENCY_PROTOCOLS } from '../data/protocols';

export default function EmergencyHemorrhageScreen() {
    return <ProtocolViewer protocol={EMERGENCY_PROTOCOLS.hemorrhage} />;
}

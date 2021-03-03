import { Text } from '@fluentui/react';
import React from 'react';
import { withDisplayName } from '../utils';
import { RouteProps } from './type';

export const ZeroTier = withDisplayName('ZeroTier')(({
    device
}: RouteProps): JSX.Element | null => {
    return (
        <>
            <Text block>
                <span>TODO ZeroTier installation on device</span>
            </Text>
        </>
    );
});

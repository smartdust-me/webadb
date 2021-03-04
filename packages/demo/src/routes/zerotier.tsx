import {DefaultButton, Stack, StackItem, Text, TextField} from '@fluentui/react';
import React, {useCallback, useState} from 'react';
import {delay, withDisplayName} from '../utils';
import {RouteProps} from './type';
import {fetchZTApk} from "./zerotier/fetchzt";

export const ZeroTier = withDisplayName('ZeroTier')(({
    device
}: RouteProps): JSX.Element | null => {

    const [running, setRunning] = useState<boolean>(false);
    const [zeroTierIp, setZeroTierIp] = useState<string>('');
    const [networkId, setNetworkId] = useState<string>('35c192ce9be51ff3');

    const handleNetworkIdChange = useCallback((e, value?: string) => {
        if (value === undefined) {
            return;
        }
        setNetworkId(value);
    }, []);

    const handleUninstall = useCallback(async () => {
        setRunning(true);

        await device!.exec("pm", "uninstall", "com.zerotier.one");

        setRunning(false);
    }, [device]);

    const handleInstall = useCallback(async () => {
        setRunning(true);

        let apkSize = 0;
        const apkBuffer = await fetchZTApk(([downloaded, total]) => {
            apkSize = total;
        });
        await device!.install(apkBuffer, uploaded => { });

        setRunning(false);
    }, [device]);

    const handleJoin = useCallback(async () => {
        setRunning(true);

        await device!.exec("am", "start", "-n", "com.zerotier.one/.ui.JoinNetworkActivity");
        await delay(2000);

        await device!.exec("input", "text", "35c192ce9be51ff3");
        // Six tabs to get to "Add Network" button
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        // Enter
        await device!.exec("input", "keyevent", "66");

        await device!.exec("am", "start", "-n", "com.zerotier.one/.ui.NetworkListActivity");
        await delay(2000);

        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "66");
        await delay(1000);

        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "66");

        await device!.exec("input", "keyevent", "4");
        await delay(2000);
        await device!.exec("am", "start", "-n", "com.zerotier.one/.ui.NetworkListActivity");

        setRunning(false);
    }, [device]);

    const handleWaitForIp = useCallback(async () => {
        setZeroTierIp("");
        setRunning(true);

        let ip = "";
        while (ip.length === 0) {
            let result = await device!.exec("ip", "addr", "show");
            let addresses = result.split("\n").filter(line => line.indexOf("192.168.192") > 0);

            if (addresses.length > 0) ip = addresses[0];
            else await delay(1000);
        }
        setZeroTierIp(ip);

        setRunning(false);
    }, [device]);

    const handleTcp = useCallback(async () => {
        setRunning(true);

        await device!.tcpip.setPort(5555);

        setRunning(false);
    }, [device]);
    
    return (
        <>
            <DefaultButton text="Uninstall ZeroTier" disabled={!device || running} onClick={handleUninstall} />
            <DefaultButton text="Install ZeroTier" disabled={!device || running} onClick={handleInstall} />
            <StackItem>
                <Stack horizontal>
                    <StackItem>
                        <Text>Network ID:&nbsp;</Text>
                    </StackItem>
                    <StackItem grow>
                        <TextField
                            value={networkId}
                            onChange={handleNetworkIdChange}
                            disabled={running}
                        />
                    </StackItem>
                </Stack>
            </StackItem>
            <DefaultButton text="Join Network" disabled={!device || running} onClick={handleJoin} />
            <DefaultButton text="Wait for IP" disabled={!device || running} onClick={handleWaitForIp} />
            <Text>{zeroTierIp}</Text>
            <DefaultButton text="Switch to TCP" disabled={!device || running} onClick={handleTcp} />
        </>
    );
});

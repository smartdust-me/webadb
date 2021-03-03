import { StackItem, Stack, DefaultButton, TextField, Text } from '@fluentui/react';
import React, {useCallback, useState} from 'react';
import {delay, withDisplayName} from '../utils';
import { RouteProps } from './type';
import {fetchZTApk} from "./zerotier/fetchzt";

export const ZeroTier = withDisplayName('ZeroTier')(({
    device
}: RouteProps): JSX.Element | null => {

    const defaultButtonText = "Reinstall ZeroTierOne and join network";

    const [running, setRunning] = useState<boolean>(false);

    const [buttonText, setButtonText] = useState<string>(defaultButtonText);

    const [networkId, setNetworkId] = useState<string>('35c192ce9be51ff3');

    const handleNetworkIdChange = useCallback((e, value?: string) => {
        if (value === undefined) {
            return;
        }
        setNetworkId(value);
    }, []);

    const handleInstall = useCallback(async () => {
        let apkSize = 0;

        setButtonText("Uninstalling previous APK");
        await device!.exec("pm", "uninstall", "com.zerotier.one");

        setButtonText("Caching APK from server");
        const apkBuffer = await fetchZTApk(([downloaded, total]) => {
            apkSize = total;
        });

        setButtonText("Uploading and installing ZeroTier");
        await device!.install(apkBuffer, uploaded => { });

    }, [device]);

    const handleJoin = useCallback(async () => {
        setButtonText("Starting network join Activity");
        await device!.exec("am", "start", "-n", "com.zerotier.one/.ui.JoinNetworkActivity");
        await delay(2000);

        setButtonText("Joining network");
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

        setButtonText("Starting network list Activity");
        await device!.exec("am", "start", "-n", "com.zerotier.one/.ui.NetworkListActivity");
        await delay(2000);

        setButtonText("Enabling network");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "66");
        await delay(1000);

        setButtonText("Granting VPN permission");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "61");
        await device!.exec("input", "keyevent", "66");
    }, [device]);
    
    const handleInstallAndJoin = useCallback(async() => {
        setRunning(true);
        await handleInstall();
        await handleJoin();
        setRunning(false);
        setButtonText(defaultButtonText);
        alert("Finished!");
    }, [device]);

    return (
        <>
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
            <DefaultButton
                text={buttonText}
                disabled={!device || running}
                onClick={handleInstallAndJoin}
            />
        </>
    );
});

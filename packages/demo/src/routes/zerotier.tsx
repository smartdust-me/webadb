import {DefaultButton, Stack, StackItem, Text, TextField} from '@fluentui/react';
import React, {useCallback, useState} from 'react';
import {delay, withDisplayName} from '../utils';
import {RouteProps} from './type';
import {fetchZTApk} from "./zerotier/fetchzt";
import {decodeBase64, encodeBase64} from "@yume-chan/adb";
import {decodeUtf8} from "@yume-chan/adb-backend-webusb";

export const ZeroTier = withDisplayName('ZeroTier')(({
    device
}: RouteProps): JSX.Element | null => {

    const serverKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCRZynkyEpyGBeOuSw1cRQ/0p8le9/hiaLauhJh0ZYCNiBaNp80OvX2ZEJBB3394VKaVDRvXO4Chfrzvtqmix8DpJgUzMigeQm05yuvODBd1edzZzTo/kqEKToRk5y8FsXHwaPaSlbFXvmpwmuflRIOVi2EKjoIojh03U/4+qOAov8dWt3/5RAQ04wgsisOKNOpt7Nyg3DOFrJMmYaZ1lC03NN1TlrI5w/P+sOUmM4buxFkSyVbFn9FhOqhHVzY8CaH9WEdcb0SzF3I+ZJhSCV2I3Oxy3+kJTEnU/lxcykgDca8z+Z3AKyE53sUPq54Z3Yx3HDusVEXdyGTl4tKUIsDAgMBAAECggEAFfsuEqeS1Y+90/Y7cDLRmFprc7u32z028PELQV1xW5E6L9ktFTTKpT5/45vR2LUdCzaqnKFEW/5MM1gJbv7+J8tUsGRK+jOCG6aM7JbGfREOxdv23DhBJJyk6i5SFf8tVCb6cdAmMP1MKfU51uyux5sQk3fcwRxhA43HfsDJQfNnxYJNxI4A6c2hFGU6Q5FTLPwzoooU/CcXjLxrKLone78sVCaXYE7yzpzbBYtPWMtfgjVzqvNMBFBYOMh/3c2kf7N+ezbsu8DSur58W35oq9P3q0N/YXCBmiCjz6Tx7dWGkGqoJzjoKyLhPGAdEITALfIq7EwBHLuL0ZD0nWawCQKBgQDMn9F44XzRXTTKHiwQcxXXO2nQNL50k6zVuxKS9uCTOOQAkCCZkr2sGZwGqhs2Q007E6T4YR7pxHis2gJX+hZplKUjF5sVkC5RntUomfjkxx2cJYliicMWzkDL4JRY6XAs+14rtDk4EWvdkgdeXD9yfBy4ameLpXLNIEf4uyNRGQKBgQC16Oikswa0F9/ZbqpC8hxOwkVyuBXzgF7jQJZXb5wWFrsNv4U7ZNgpXcbdniqgfGKDCKZVe0rTQafHQDus+KaLDzGk6IobjHKZg+NziIbd672sd+FAntLw2Neyu5n576ZjdNoKMW7hrzVgDpCGDvUUp7+Edwjds7v+BBsGMUu0ewKBgQCVNQRdjK6jS7+ukgm3hPOsGhqyQ4ONJhGlV9/XYkWnlJhNAMuEsEe2MoZfJbLqAnFSXqSwqMEN3MHR6LZEyIuHOWihChl/w77CrXrpPD0NNVQWBBkFzUaAXq1I/N2vZ6jwY+rrG2ONysZIrq7I06NAK9gVcSFH5sCrapqQeITsIQKBgGLBhgNb+citqWYGcUKU5A9R4pgMHkaqq1jeSIBBZFCNmJE3J2J+NegHNB4+bs/fly+h84M2wwF7hFVkpsEZ4HhgEEiBwfCAx/pVopanSOiTwc4u6sfFMal1X2x18nrAwuj9mB2uho7ZKrXyUj2lQyIqi4ujf9m0aNvXaMBs5LefAoGBAJgpAKTPWeanoldA4z5Twuizuvc+8QB8yB3DvHxopxCrYHQE5K5IB2rb0Fivxh+cLWQBd+9lVdDmuNNQnYr5M//aUEfg1ulm13fElFdzuR/Rk30JBoItNCsU3LeFOd8hf9+zjg80HSaf3gW3hRWj64ggGSRqWoGNZ26rjEuWJS6r";
    const serverKeyFingerprint = "13:88:91:9C:B9:5F:1C:47:35:03:04:DD:57:C6:E1:DA"
    const tcpPort = 5555;

    const [running, setRunning] = useState<boolean>(false);
    const [zeroTierIp, setZeroTierIp] = useState<string>('');
    const [networkId, setNetworkId] = useState<string>('35c192ce9be51ff3');

    const handleServerKey = useCallback(async () => {
        window.localStorage.setItem("private-key", serverKey);
        alert(`Finished! Reconnect now!`);
    }, [device]);

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

            if (addresses.length > 0) ip = addresses[0].replace(/.*inet /, "").replace(/\/24.*/, "");
            else await delay(1000);
        }
        setZeroTierIp(ip);

        setRunning(false);
    }, [device]);

    const handleTcp = useCallback(async () => {
        setRunning(true);

        await device!.tcpip.setPort(tcpPort);

        setRunning(false);
    }, [device]);

    const handleConnect = useCallback(async () => {
        setRunning(true);

        let response = await fetch("https://public.smartdust.me/api/v1/webadb/connect", {
            method: 'POST',
            mode: "no-cors",
            body: `{ "IpAddressPort": ${zeroTierIp}:${tcpPort} }`
        });

        console.log(response);

        setRunning(false);
    }, [device]);

    return (
        <>
            <Text>When connecting, key fingerprint should be<br/><code>{serverKeyFingerprint}</code><br/>If it's not, use the button below and reconnect!</Text>
            <DefaultButton text="Use Public Server ADB key" disabled={!!device} onClick={handleServerKey} />
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
            <DefaultButton text="Connect Provider" disabled={!device || running} onClick={handleConnect} />
        </>
    );
});

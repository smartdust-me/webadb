import {DefaultButton, Stack, StackItem, Text, TextField} from '@fluentui/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {delay, withDisplayName} from '../utils';
import {RouteProps} from './type';
import {fetchZTApk} from "./zerotier/fetchzt";
import {Adb, decodeBase64, encodeBase64} from "@yume-chan/adb";
import {decodeUtf8} from "@yume-chan/adb-backend-webusb";
import {AdbEventLogger, Connect} from "../components";
import {useLocation} from "react-router-dom";

export const ZeroTier = withDisplayName('ZeroTier')(({
}: RouteProps): JSX.Element | null => {

    const serverKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCRZynkyEpyGBeOuSw1cRQ/0p8le9/hiaLauhJh0ZYCNiBaNp80OvX2ZEJBB3394VKaVDRvXO4Chfrzvtqmix8DpJgUzMigeQm05yuvODBd1edzZzTo/kqEKToRk5y8FsXHwaPaSlbFXvmpwmuflRIOVi2EKjoIojh03U/4+qOAov8dWt3/5RAQ04wgsisOKNOpt7Nyg3DOFrJMmYaZ1lC03NN1TlrI5w/P+sOUmM4buxFkSyVbFn9FhOqhHVzY8CaH9WEdcb0SzF3I+ZJhSCV2I3Oxy3+kJTEnU/lxcykgDca8z+Z3AKyE53sUPq54Z3Yx3HDusVEXdyGTl4tKUIsDAgMBAAECggEAFfsuEqeS1Y+90/Y7cDLRmFprc7u32z028PELQV1xW5E6L9ktFTTKpT5/45vR2LUdCzaqnKFEW/5MM1gJbv7+J8tUsGRK+jOCG6aM7JbGfREOxdv23DhBJJyk6i5SFf8tVCb6cdAmMP1MKfU51uyux5sQk3fcwRxhA43HfsDJQfNnxYJNxI4A6c2hFGU6Q5FTLPwzoooU/CcXjLxrKLone78sVCaXYE7yzpzbBYtPWMtfgjVzqvNMBFBYOMh/3c2kf7N+ezbsu8DSur58W35oq9P3q0N/YXCBmiCjz6Tx7dWGkGqoJzjoKyLhPGAdEITALfIq7EwBHLuL0ZD0nWawCQKBgQDMn9F44XzRXTTKHiwQcxXXO2nQNL50k6zVuxKS9uCTOOQAkCCZkr2sGZwGqhs2Q007E6T4YR7pxHis2gJX+hZplKUjF5sVkC5RntUomfjkxx2cJYliicMWzkDL4JRY6XAs+14rtDk4EWvdkgdeXD9yfBy4ameLpXLNIEf4uyNRGQKBgQC16Oikswa0F9/ZbqpC8hxOwkVyuBXzgF7jQJZXb5wWFrsNv4U7ZNgpXcbdniqgfGKDCKZVe0rTQafHQDus+KaLDzGk6IobjHKZg+NziIbd672sd+FAntLw2Neyu5n576ZjdNoKMW7hrzVgDpCGDvUUp7+Edwjds7v+BBsGMUu0ewKBgQCVNQRdjK6jS7+ukgm3hPOsGhqyQ4ONJhGlV9/XYkWnlJhNAMuEsEe2MoZfJbLqAnFSXqSwqMEN3MHR6LZEyIuHOWihChl/w77CrXrpPD0NNVQWBBkFzUaAXq1I/N2vZ6jwY+rrG2ONysZIrq7I06NAK9gVcSFH5sCrapqQeITsIQKBgGLBhgNb+citqWYGcUKU5A9R4pgMHkaqq1jeSIBBZFCNmJE3J2J+NegHNB4+bs/fly+h84M2wwF7hFVkpsEZ4HhgEEiBwfCAx/pVopanSOiTwc4u6sfFMal1X2x18nrAwuj9mB2uho7ZKrXyUj2lQyIqi4ujf9m0aNvXaMBs5LefAoGBAJgpAKTPWeanoldA4z5Twuizuvc+8QB8yB3DvHxopxCrYHQE5K5IB2rb0Fivxh+cLWQBd+9lVdDmuNNQnYr5M//aUEfg1ulm13fElFdzuR/Rk30JBoItNCsU3LeFOd8hf9+zjg80HSaf3gW3hRWj64ggGSRqWoGNZ26rjEuWJS6r";

    useEffect(() => {
        window.localStorage.setItem("private-key", serverKey);
        console.log("SmartDust Public Server ADB Key saved to LocalStorage");
    }, []);

    const serverKeyFingerprint = "13:88:91:9C:B9:5F:1C:47:35:03:04:DD:57:C6:E1:DA"
    const tcpPort = 5555;

    const [logger] = useState(() => new AdbEventLogger());
    const [device, setDevice] = useState<Adb | undefined>();

    const [running, setRunning] = useState<boolean>(false);
    const [networkId, setNetworkId] = useState<string>('35c192ce9b776528');
    const [zeroTierIp, setZeroTierIp] = useState<string>('');
    const zeroTierIpRef = useRef(zeroTierIp);
    zeroTierIpRef.current = zeroTierIp;

    const handleNetworkIdChange = useCallback((e, value?: string) => {
        if (value === undefined) { return; }
        setNetworkId(value);
    }, []);

    const handleZeroTierIpChange = useCallback((e, value?: string) => {
        if (value === undefined) { return; }
        setZeroTierIp(value);
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

        await device!.exec("input", "text", "35c192ce9b776528");
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

        const body = { ipAddressPort : `${zeroTierIpRef.current}:${tcpPort}`}
        let response = await fetch("https://public.smartdust.me/api/v1/webadb/connect", {
            method: 'POST',
            mode: "no-cors",
            headers: new Headers({'content-type' : 'application/json'}),
            body: JSON.stringify(body),
        });

        setRunning(false);
    }, [device]);

    function useQuery() {
        const { search } = useLocation();
        return React.useMemo(() => new URLSearchParams(search), [search]);
    }
    let result = useQuery().get("networkid");
    if (result !== undefined) {
        // @ts-ignore
        setNetworkId(result);
    }


    return (
        <>
            <h1>Prerequisites</h1>
            <ul>
                <li>You need a mobile device with Android 6.0 or newer.</li>
                <li>Your device must be online! Make sure your WiFi is on and connected to a network!</li>
                <li><b>Enable USB Debugging on your device before starting</b>. If you don't know how, <a href="/webadb/#/usb-debugging" target="_blank">look here</a>.</li>
                <li>Connect your device to your PC using a USB cable.</li>
                <li><b>If the device asks you to accept a server key at this point, you have an adb server running and you need to shut it down before proceeding!</b></li>
                <li>If you run into any errors not mentioned in the instruction steps, try looking at <b>Troubleshooting</b> at the end of this page.</li>
            </ul>
            <br />
            <h1>Instructions</h1>
            <table>
                <tr><th>Step</th><th>Explanation</th></tr>
                <tr>
                    <td>
                        <p><b>1. Connecting your device to this page</b></p>
                        <Connect device={device} logger={logger.logger} onDeviceChange={setDevice}/>
                    </td>
                    <td>
                        <p>
                            In the box to the left:
                            <ul>
                                <li>Click <b>Add Device</b>, select your device and press <b>connect</b></li>
                                <li>Click <b>Connect</b></li>
                                <li>On your device you should see a dialog with a server key fingerprint. Make sure it's
                                    this:
                                </li>
                                <ul>
                                    <li><code>{serverKeyFingerprint}</code></li>
                                </ul>
                                <li><b>If it's different, reload this page and start over!</b></li>
                                <li>If the key matches, check the checkbox and click <b>Allow</b>.</li>
                            </ul>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p><b>2. Installing VPN app</b></p>
                        <DefaultButton text="Install VPN app" disabled={!device || running} onClick={handleInstall} />
                    </td>
                    <td><p>Click <b>Install VPN app</b> and wait until it becomes enabled again, then move to the next step.</p></td>
                </tr>
                <tr>
                    <td>
                        <p><b>3. Joining SmartDust Private Network</b></p>
                        <p>Network ID:&nbsp;</p>
                        <TextField value={networkId} onChange={handleNetworkIdChange} disabled={running} />
                        <DefaultButton text="Join Network" disabled={!device || running} onClick={handleJoin} />
                    </td>
                    <td>
                        <p><b>Before you begin:</b>
                            <ul>
                                <li>Make sure your device is online! If it's not, turn on WiFi and connect to a network
                                    now.
                                </li>
                                <li>Make sure your phone is unlocked and the screen is on.</li>
                                <li>Do not touch your phone during the procedure!</li>
                            </ul>
                            <p>Unless you know what you're doing, leave the Network ID input as it is.</p>
                            <p>Click <b>Join Network</b> and wait until it becomes enabled again, then move to the next step.</p>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p><b>4. Getting the Private Network IP Address</b></p>
                        <DefaultButton text="Wait for IP" disabled={!device || running} onClick={handleWaitForIp} />
                        <TextField value={zeroTierIp} onChange={handleZeroTierIpChange} />
                    </td>
                    <td><p>Click <b>Wait for IP</b> and wait until an IP address shows up in the box to the right.</p></td>
                </tr>
                <tr>
                    <td>
                        <p><b>5. Connecting SmartDust Provider to the device</b></p>
                        <DefaultButton text="Switch to TCP" disabled={!device || running} onClick={handleTcp} />
                    </td>
                    <td>
                        <p>Click <b>Switch to TCP</b>. Your device will now disconnect from this page, <b>this is normal!</b></p>
                        <p>Copy the IP Address from the previous step into the box at the top of the page and click the <b>Connect</b> button next to it.</p>
                        <p><b>That's it!</b> Your device should now be available in SmartDust!</p>
                    </td>
                </tr>
            </table>

            <h2>Troubleshooting</h2>
            <ul>
                <li><b>How do I enable USB Debugging?</b></li>
                <ul><li><a href="/webadb/#/usb-debugging" target="_blank">Check here</a></li></ul>
                <li><b><code>"Unable to claim interface"</code> during step 1</b></li>
                <ul><li>You probably have an adb server running on your PC. Try running <code>adb kill-server</code> in the terminal. If that doesn't work, ask the SmartDust team for help.</li></ul>
                <li><b>VPN app is Offline</b></li>
                <ul><li>Your device might be offline. Turn on WiFi and make sure you are connected to a network.</li></ul>
                <li><b>Problems with the VPN app</b></li>
                <ul>
                    <li>Use the button below to uninstall the app and go back to step 2</li>
                    <li><DefaultButton text="Uninstall VPN app" disabled={!device || running} onClick={handleUninstall} /></li>
                </ul>
            </ul>
        </>
    );
});

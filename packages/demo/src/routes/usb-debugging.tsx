import {withDisplayName} from '../utils';
import {RouteProps} from './type';
import exports from "webpack";
import compareStrings = exports.util.comparators.compareStrings;

export const UsbDebugging = withDisplayName('UsbDebugging')(({
}: RouteProps): JSX.Element | null => {


    const links = [
        { "brand": "Samsung", "link": "https://www.youtube.com/watch?v=rl5HY5Y2mz4" },
        { "brand": "Android (Clean)", "link": "https://www.youtube.com/watch?v=0usgePpr8_Y" },
        { "brand": "Xiaomi", "link": "https://www.youtube.com/watch?v=2tE3dFxBy0I" },
        { "brand": "Redmi", "link": "https://www.youtube.com/watch?v=bPrvMvuOEd8" },
        { "brand": "Realme", "link": "https://www.youtube.com/watch?v=otiq3XQs98k" },
        { "brand": "Motorola", "link": "https://www.youtube.com/watch?v=WMkDGfZETn8" },
        { "brand": "Oukitel", "link": "https://www.youtube.com/watch?v=ABiHAofmfyg" },
        { "brand": "Oppo", "link": "https://www.youtube.com/watch?v=K0dieOuycEM" },
        { "brand": "Nokia", "link": "https://www.youtube.com/watch?v=4EN3b2S9Fk8" },
        { "brand": "Doodge", "link": "https://www.youtube.com/watch?v=3LgqPP-s28Y" },
        { "brand": "OnePlus", "link": "https://www.youtube.com/watch?v=FTxjT4sQwew" },
        { "brand": "Alcatel", "link": "https://www.youtube.com/watch?v=nKXbwMxWRFo" },
        { "brand": "Sony", "link": "https://www.youtube.com/watch?v=qye4HZ2eKoI" },
        { "brand": "Huawei", "link": "https://www.youtube.com/watch?v=juPwF5iMKP8" },
        { "brand": "Kruger&Matz", "link": "https://www.youtube.com/watch?v=0YoZ7Mum1L0" },
        { "brand": "Vivo", "link": "https://www.youtube.com/watch?v=UZRKhzMi5P0" },
        { "brand": "Google", "link": "https://www.youtube.com/watch?v=cck8V0uYL2s" },
        { "brand": "Cat", "link": "https://www.youtube.com/watch?v=A517MeadACg" },
        { "brand": "HTC", "link": "https://www.youtube.com/watch?v=sv85_-U4_6Q" },
        { "brand": "LG", "link": "https://www.youtube.com/watch?v=WHtc8cZZd60" },
        { "brand": "Lenowo", "link": "https://www.youtube.com/watch?v=apnsPifx6f0" },
        { "brand": "Honor", "link": "https://www.youtube.com/watch?v=s-B5SnDh9c8" },
        { "brand": "Nubia", "link": "https://www.youtube.com/watch?v=QQZLioZdcws" },
        { "brand": "ZTE", "link": "https://www.youtube.com/watch?v=IBqcfrQ122I" },
        { "brand": "Asus", "link": "https://www.youtube.com/watch?v=Sfbl7q67Mks" },
        { "brand": "Acer", "link": "https://www.youtube.com/watch?v=vdvyyw1MVY8" },
        { "brand": "BlackBerry", "link": "https://www.youtube.com/watch?v=EKMDFDHzQU4" },
        { "brand": "BlackShark", "link": "https://www.youtube.com/watch?v=WfqYipyxEaQ" },
        { "brand": "Gionee", "link": "https://www.youtube.com/watch?v=KmPWoYlZV50" },
        { "brand": "Archos", "link": "https://www.youtube.com/watch?v=zmeE0htJ3ss" },
        { "brand": "Blackview", "link": "https://www.youtube.com/watch?v=CKV4lV4jtYI" },
        { "brand": "Blu", "link": "https://www.youtube.com/watch?v=S7xIvgyaO4M" },
        { "brand": "Coolpad", "link": "https://www.youtube.com/watch?v=ubgvPN-9OCQ" },
        { "brand": "Cubot", "link": "https://www.youtube.com/watch?v=NQ9Or4v6FrI" },
        { "brand": "Elephone", "link": "https://www.youtube.com/watch?v=yXfjCkVv6LY" },
        { "brand": "Infinix", "link": "https://www.youtube.com/watch?v=v0mo4d4igig" },
        { "brand": "Infocus", "link": "https://www.youtube.com/watch?v=3M2gd1cZ-FE" },
        { "brand": "Intex", "link": "https://www.youtube.com/watch?v=lWXIIyG9B9w" },
        { "brand": "Micromax", "link": "https://www.youtube.com/watch?v=m-j0rJojgOw" },
        { "brand": "Meizu", "link": "https://www.youtube.com/watch?v=WZ5ehp3m9ig" },
        { "brand": "Panasonic", "link": "https://www.youtube.com/watch?v=BbO5neVHK4A" },
        { "brand": "Prestigio", "link": "https://www.youtube.com/watch?v=xE8eKUjxmjA" },
        { "brand": "Sharp", "link": "https://www.youtube.com/watch?v=ic17Cdg3YkU" },
        { "brand": "THL", "link": "https://www.youtube.com/watch?v=Yj3n4DGJ7Vk" },
        { "brand": "TP-Link", "link": "https://www.youtube.com/watch?v=HjifG7hrFgI" },
        { "brand": "UMiDIGI", "link": "https://www.youtube.com/watch?v=a_WXERg6_UA" },
        { "brand": "Wiko", "link": "https://www.youtube.com/watch?v=OS-04g1g6Gc" },
    ]

    links.sort((a, b) => a.brand.localeCompare(b.brand))

    return (
        <>
            <h1>Choose your brand</h1>
            {
                links.map(value =>
                    <h3><a href={value.link}>{value.brand}</a></h3>
                )
            }
        </>
    );
});

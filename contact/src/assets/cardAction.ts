const qqLink = 'mqq://card/show_pslcard?src_type=internal&version=1&uin=976756503&card_type=person&source=sharecard';
const whatsappLink = 'https://wa.me/8615540251709';
const wechatLink = 'weixin://contacts/profile/JianQi_WeChat';//wxid_b2zcbtiffm0612
const instagramLink = 'instagram://user?username=jian_ig';
const lineLink = 'https://line.me/ti/p/VgdDqfuAks';

export function redirectToApp(name: String){
    switch (name) {
        case 'QQ' :
            location.href = qqLink;
            // redirectToQQ();
            break;
        case 'WeChat' :
            location.href = wechatLink;
            // redirectToQQ();
            break;
        case 'Instagram' :
            location.href = instagramLink;
            // redirectToWhatsApp();
            break;
        case 'Line' :
            window.open(lineLink)
            // location.href = lineLink;
            // redirectToWhatsApp();
            break;
        case 'WhatsApp' :
            window.open(whatsappLink);
            // location.href = whatsappLink;
            // redirectToWhatsApp();
            break;
        default :
            // console.log('nil')
            break;
    }

}

function redirectToQQ() {
    const ua = navigator.userAgent;
    const isIpad = ua.match(/(iPad).*OS\s([\d_]+)/),
        isIphone = !isIpad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        isAndroid = ua.match(/(Android)\s+([\d.]+)/),
        isMobile = isIphone || isAndroid;
    console.log(ua)
    if(isIphone || isIpad){
        location.href="mqq://card/show_pslcard?src_type=internal&version=1&uin=976756503&card_type=person&source=sharecard";
    }else if(isAndroid){
        location.href="mqq://card/show_pslcard?src_type=internal&version=1&uin=976756503&card_type=person&source=sharecard";
    }else{
        location.href="mqq://card/show_pslcard?src_type=internal&version=1&uin=976756503&card_type=person&source=sharecard";
        // location.href="tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=976756503";
    }
}

function redirectToWhatsApp() {
    const ua = navigator.userAgent;
    const isIpad = ua.match(/(iPad).*OS\s([\d_]+)/),
        isIphone = !isIpad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        isAndroid = ua.match(/(Android)\s+([\d.]+)/),
        isMobile = isIphone || isAndroid;
    if(isIphone || isIpad){
        location.href="https://wa.me/8615540251709";
    }else if(isAndroid){
        location.href="https://wa.me/8615540251709";
    }else{
        window.open('https://wa.me/8615540251709', 'target');
    }
}

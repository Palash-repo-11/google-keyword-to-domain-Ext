console.log('hello from  content Script');

const setToStorage = async (key, data) => {
    const obj = {}
    obj[key] = data
    await chrome.storage.local.set(obj)
}

const getFromStorage = async (key) => {
    const sres = await chrome.storage.local.get(key)
    return sres[key]
}

const findWord = () => {
    let domain = window.location.href
    console.log(domain, "djhghdfjgfg");
    let url = new URL(domain)
    let search = url ? url.search : domain
    let searchContent = search?.split('&oq=')[0]?.split('?q=')[1]?.replaceAll('+', " ")
    console.log(searchContent, "searchContent");
    let text = document.querySelector('textarea')?.textContent
    console.log(text, "text");
    return { searchContent, text }

}


const checkForKey = async () => {
    console.log("checking key");
    let key = await getFromStorage("keywordsArray")
    console.log(key, "keys");
    let { searchContent, text } = findWord()
    if (key.includes(searchContent) || key.includes(text)) return text ? text : searchContent
    else return false
}
// SCROLLING PAGE
const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}
const wait = async (seconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, seconds)
    })
}
const untilFindMore = async () => {
    console.log("wait start");
    return new Promise((resolve) => {
        let count = 0
        const interval = setInterval(() => {
            let available = document.querySelector('.GNJvt.ipz2Oe')
            if (available) {
                resolve(true)
                clearInterval(interval)
            }
            scrollToBottom()
            console.log("waiting");
            if (count === 4) {
                console.log(count);
                resolve(false)
                clearInterval(interval)
            }
            count++
        }, 500)
    })
}
const ScrollToFindMoreResult = async () => {
    await wait(2000)
    console.log("scroll to find");
    scrollToBottom()
    let waitFind = await untilFindMore()
    if (waitFind) {
        console.log("wait end");
        let moreButton = document.querySelector('.GNJvt.ipz2Oe')
        moreButton.click()
        await wait(1000)
        scrollToBottom()
    }
    else {
        await wait(1000)
        scrollToBottom()
        return 2
    }
}
const scrollBody = async () => {
    await wait(2000)
    for (let i = 0; i < 5; i++) {  //number of iteration needed
        console.log("scrollbody");
        let scrollVal = await ScrollToFindMoreResult()
        console.log(scrollVal, "scrollVal");
        if (scrollVal === 2) {
            return;
        }
    }
}
const getTheDomain = async () => {
    const uniqueUrls = [];
    const uniqueDomains = [];
    const sponcerdAds = []
    document.querySelectorAll("[aria-label='Ads'] .uEierd").forEach((item) => {
        const a = item.querySelector("a");
        if (a) {
            const dataPcu = a.getAttribute("data-pcu");
            if (dataPcu) {
                if (!uniqueUrls.includes(dataPcu)) {
                    uniqueUrls.push(dataPcu);
                }
                const url = new URL(dataPcu);
                const domain = url.hostname;

                if (!uniqueDomains.includes(domain)) {
                    uniqueDomains.push(domain);
                }
            }
        }
    });

    document.querySelectorAll("#search [jsname='UWckNb']").forEach((item) => {
        const href = item.getAttribute("href");
        if (href) {
            const url = new URL(href);
            const domain = url.hostname;

            if (!uniqueDomains.includes(domain)) {
                uniqueDomains.push(domain);
                if (!uniqueUrls.includes(href)) {
                    uniqueUrls.push(href);
                }
            }
        }
    });
    document.querySelectorAll('.uEierd').forEach((item) => {
        let href = item.querySelector('a')?.href

        if (href) {
            const url = new URL(href)
            const domain = url.hostname;
            if (!sponcerdAds.includes(domain)) {
                sponcerdAds.push(domain)
            }
        }
    })
    console.log(sponcerdAds);
    return sponcerdAds

}
const countSeconds = () => {
    let c = 0
    const interval = setInterval(() => {
        c++
        console.log("COUNT", c);
        if (c === 80) {
            chrome.runtime.sendMessage({ myData: [], status: 'TIME_OUT' })
            clearInterval(interval)
        }
    }, 10000)
}
let countN = 0

const main = async () => {
    await wait(3000)
    console.log("main start ");
    const checkKey = await checkForKey()
    console.log(checkKey, "checkKey");
    if (checkKey) {
        await scrollBody()
        let domains = await getTheDomain()
        chrome.runtime.sendMessage({ myData: { keyword: checkKey, domains, }, status: 'SUCCESS' })
        return
    }
    if (countN === 1) {
        main()
        return
    }
    if (!checkKey && !countN) {
        countN++
        main()
        return
    }
    if (!checkKey && countN > 1) {
        chrome.runtime.sendMessage({ myData: [], status: 'CHECK_FAILED' })
        return
    }
}



const execution=()=>{
    console.log("execution start");
    let hostDomain=window.location.href
    if(hostDomain.includes('https://') && hostDomain.includes('.google.') && hostDomain.includes('/search?q=')){
        countSeconds()
        main()
    }
}
execution()
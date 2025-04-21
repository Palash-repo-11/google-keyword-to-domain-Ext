const start= document.getElementById('start')
const download=document.getElementById('download')

start.addEventListener('click',()=>{
    console.log('start clicked');
    chrome.runtime.sendMessage({msg:"start"})
})
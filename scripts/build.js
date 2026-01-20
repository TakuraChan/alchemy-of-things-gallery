const fs=require('fs'),path=require('path');

function aggregate(dir){
    const items=[];
    if(!fs.existsSync(dir))return items;
    fs.readdirSync(dir).filter(f=>f.endsWith('.json')).forEach(f=>{
        try{items.push(JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')))}catch{}
    });
    return items;
}

const dataDir=path.join(__dirname,'..','data');
fs.writeFileSync(path.join(dataDir,'works.json'),JSON.stringify(aggregate(path.join(dataDir,'paintings')),null,2));
fs.writeFileSync(path.join(dataDir,'photography.json'),JSON.stringify(aggregate(path.join(dataDir,'photography')),null,2));
console.log('Build complete');

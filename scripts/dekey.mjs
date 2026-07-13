import sharp from "sharp";
const DIR = "public/assets/shutterbug-ui/";
const files = ["shutterbug-logo","grandpa-signature","passport","photo-album","field-guide","player-portrait"];
const T1 = 88, T2 = 150; // full-cut distance, feather-end distance
const screenLike = ([r,g,b]) => {
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
  return mx>190 && (mx-mn)>150; // very saturated, bright — a chroma backdrop
};
for (const f of files) {
  const src = DIR+f+".png";
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const c = info.channels, W = info.width, H = info.height;
  const px = (x,y)=>{const i=(y*W+x)*c;return [data[i],data[i+1],data[i+2]];};
  // key = median-ish of four corners
  const corners=[px(2,2),px(W-3,2),px(2,H-3),px(W-3,H-3)];
  const key=[0,1,2].map(k=>Math.round(corners.reduce((s,p)=>s+p[k],0)/4));
  if(!screenLike(key)){ console.log(`SKIP ${f} (corner ${key} not screen-like)`); continue; }
  let cut=0;
  for(let i=0;i<data.length;i+=c){
    const dr=data[i]-key[0], dg=data[i+1]-key[1], db=data[i+2]-key[2];
    const dist=Math.sqrt(dr*dr+dg*dg+db*db);
    if(dist<=T1){ data[i+3]=0; cut++; }
    else if(dist<T2){ data[i+3]=Math.round(255*(dist-T1)/(T2-T1)); }
    // despill: pull a green/magenta cast on kept pixels toward neutral
    if(data[i+3]>0){
      if(key[1]>key[0]&&key[1]>key[2]&&data[i+1]>(data[i]+data[i+2])/2+40) data[i+1]=Math.round((data[i]+data[i+2])/2+40);
      if(key[0]>key[1]&&key[2]>key[1]&&data[i+1]<(data[i]+data[i+2])/2-40) data[i+1]=Math.round((data[i]+data[i+2])/2-40);
    }
  }
  await sharp(data,{raw:{width:W,height:H,channels:c}}).png().toFile(src+".tmp");
  await sharp(src+".tmp").toFile(src);
  console.log(`keyed ${f}: cut ${(100*cut/(W*H)).toFixed(0)}% (key ${key})`);
}

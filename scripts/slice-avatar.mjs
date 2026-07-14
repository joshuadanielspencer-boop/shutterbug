import sharp from "sharp";
import fs from "fs";
const OUT = "public/assets/shutterbug-ui/avatar/", SRC = "Images/";
const isBg = (r,g,b) => Math.min(r,g,b) > 228 && (Math.max(r,g,b)-Math.min(r,g,b)) < 20;
async function keyed(file) {
  const { data, info } = await sharp(SRC+file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W=info.width,H=info.height,c=info.channels,N=W*H;
  const bg=new Uint8Array(N), st=[];
  const push=(x,y)=>{ if(x<0||y<0||x>=W||y>=H)return; const p=y*W+x; if(bg[p])return; const i=p*c;
    if(!isBg(data[i],data[i+1],data[i+2]))return; bg[p]=1; st.push(p); };
  for(let x=0;x<W;x++){push(x,0);push(x,H-1);} for(let y=0;y<H;y++){push(0,y);push(W-1,y);}
  while(st.length){const p=st.pop(); const x=p%W,y=(p-x)/W; push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}
  for(let p=0;p<N;p++) if(bg[p]) data[p*c+3]=0;
  return { data, W, H, c };
}
// [file, kind, cols, rows]  — grids confirmed visually
const sheets = [
  ["avatar heads.png","head",3,2], ["avatar eyes.png","eyes",3,2], ["avatar hats.png","hat",4,3],
  ["avatar hair short.png","hairshort",4,4], ["avatar hair long.png","hairlong",4,4], ["avatar outfits.png","outfit",6,3],
];
const manifest = {};
for (const [file, kind, nC, nR] of sheets) {
  const { data, W, H, c } = await keyed(file);
  const png = await sharp(data,{raw:{width:W,height:H,channels:c}}).png().toBuffer();
  const cw = Math.floor(W/nC), ch = Math.floor(H/nR);
  const parts = [];
  for (let r=0;r<nR;r++) for (let k=0;k<nC;k++) {
    const left=k*cw, top=r*ch, w=Math.min(cw,W-left), h=Math.min(ch,H-top);
    const buf = await sharp(png).extract({left, top, width:w, height:h}).png().toBuffer();
    // content bbox within the cell → gives each part a known anchor
    const { data: d2, info: i2 } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(let y=0;y<i2.height;y++) for(let x=0;x<i2.width;x++){ if(d2[(y*i2.width+x)*i2.channels+3]>24){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
    const name = `${kind}-${r}-${k}.png`;
    await sharp(buf).png().toFile(OUT+name);
    parts.push({ name, r, k, bbox:[x0,y0,x1-x0+1,y1-y0+1] });
  }
  manifest[kind] = { sheet:file, cols:nC, rows:nR, cell:[cw,ch], parts };
  console.log(`${kind.padEnd(10)} grid ${nC}x${nR} = ${nC*nR} parts (cell ${cw}x${ch})`);
}
fs.writeFileSync(OUT+"manifest.json", JSON.stringify(manifest, null, 2));

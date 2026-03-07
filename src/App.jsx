import React,{useState} from "react";
// OCR-based serial scanning via Tesseract loaded in index.html

const extractSerial=(text)=>{
  // Find all runs of 4-10 digits in OCR output, return the most likely one
  const matches=[...text.replace(/[^0-9\n ]/g," ").matchAll(/\b(\d{4,10})\b/g)].map(m=>m[1]);
  if(!matches.length)return null;
  // Prefer longer matches (more specific serials)
  matches.sort((a,b)=>b.length-a.length);
  return matches[0];
};


const ACCTS=[
  {id:"connor",name:"Connor Brandt",initials:"CB",color:"#4a9eff",pin:"1234",admin:true},
  {id:"brook",name:"Brook Vaughan",initials:"BV",color:"#e0a020",pin:"5678",admin:true},
  {id:"josiah",name:"Josiah Talbert",initials:"JT",color:"#7ecfff",pin:"1111"},
  {id:"bryce",name:"Bryce Wagner",initials:"BW",color:"#e05060",pin:"2222"},
  {id:"riley",name:"Riley Rothey",initials:"RR",color:"#a060e0",pin:"3333"},
  {id:"matt",name:"Matt Beynon",initials:"MB",color:"#ccc",pin:"4444"},
  {id:"brawley",name:"Brawley Lamer",initials:"BL",color:"#888",pin:"5555"},
  {id:"park",name:"Park Begley",initials:"PB",color:"#f07820",pin:"7777"},
];
const abt=id=>ACCTS.find(a=>a.id===id)||ACCTS[0];
const FACS=["LDS Hospital","IMC","University of Utah","Lone Peak Hospital","St. Marks Hospital","TOSH","Utah Valley","SMOPS","VA Hospital","Altaview","Huntsman Cancer"];
const SPECS=["Spine","Hip & Knee","Shoulder & Elbow","Trauma","Other"];
const INV_LOCATIONS=[
  {id:"warehouse",label:"Company Warehouse",color:"#e0a020",icon:"🏭"},
  {id:"globus",label:"Globus / Vendor",color:"#a060e0",icon:"📦"},
  {id:"transit",label:"In Transit",color:"#7ecfff",icon:"🚚"},
  ...ACCTS.map(a=>({id:"rep_"+a.id,label:"With "+a.name.split(" ")[0],color:a.color,icon:"👤",repId:a.id})),
];
const ALL_LOC=(facs)=>[
  ...INV_LOCATIONS,
  ...facs.map(f=>({id:"fac_"+f.replace(/\s+/g,"_"),label:f,color:"#34a876",icon:"🏥",facility:f})),
];
const locById=(id,facs)=>ALL_LOC(facs).find(l=>l.id===id)||{id,label:id,color:"#555",icon:"?"};
const SPEC_COLOR={"Spine":"#4a9eff","Hip & Knee":"#34a876","Shoulder & Elbow":"#e0a020","Trauma":"#a060e0","Other":"#888"};
const SC={"Spine":"#4a9eff","Hip & Knee":"#34a876","Shoulder & Elbow":"#e0a020","Trauma":"#a060e0","Other":"#888"};
const PRIO={high:{c:"#e05060",bg:"#3d1520",l:"High"},medium:{c:"#e0a020",bg:"#3d2e00",l:"Medium"},low:{c:"#555",bg:"#1e1e2e",l:"Low"}};
const ST={done:{bar:"#34a876",badge:"#1a3d2b",bt:"#34a876",l:"Returned"},active:{bar:"#e0a020",badge:"#3d2e00",bt:"#e0a020",l:"Confirmed"},pending:{bar:"#3a3a5a",badge:"#1e1e2e",bt:"#555",l:"Pending"}};
const TODAY=new Date(2026,2,6);
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const mkC=sets=>{const o={};sets.forEach(s=>{o[s]={confirmed:false,assignee:null}});return o};
const sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const getWeek=anchor=>{const d=new Date(anchor),day=d.getDay(),m=new Date(d);m.setDate(d.getDate()-(day===0?6:day-1));return Array.from({length:7},(_,i)=>{const x=new Date(m);x.setDate(m.getDate()+i);return x;})};
const fmtD=d=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const isTmr=d=>{const t=new Date(TODAY);t.setDate(t.getDate()+1);return sameDay(d,t)};
const cPct=c=>{const conf=Object.values(c.setChecks||{}).filter(s=>s.confirmed).length,tot=c.sets.length;if(!tot)return 0;return Math.round(((conf+(c.returned?1:0)+(c.implants.length>0?1:0))/(tot+2))*100)};
const cSt=c=>{if(c.returned)return"done";if(c.sets.length>0&&c.sets.every(s=>c.setChecks?.[s]?.confirmed))return"active";return"pending"};

// UI primitives
const Bdg=({children,bg,color,sm})=><span style={{background:bg,color,fontSize:sm?9:10,padding:sm?"1px 6px":"2px 8px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
const Lbl=({children,color})=><div style={{fontSize:9,letterSpacing:"2px",color:color||"#444",textTransform:"uppercase",marginBottom:8}}>{children}</div>;
const Card=({children,accent,style})=><div style={{background:"#111119",border:"1px solid "+(accent||"#1e1e2e"),borderRadius:12,padding:"14px 16px",...style}}>{children}</div>;
const Inp=({value,onChange,placeholder,type,style})=><input type={type||"text"} value={value||""} onChange={onChange} placeholder={placeholder} style={{width:"100%",padding:"8px 11px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box",...style}}/>;
const Sel=({value,onChange,children,style})=><select value={value||""} onChange={onChange} style={{width:"100%",padding:"8px 11px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box",...style}}>{children}</select>;
const Btn=({children,onClick,color,text,outline,small,style})=>{const c=color||"#4a9eff",t=text||"#fff";return<button onClick={onClick} style={{padding:small?"5px 11px":"8px 17px",background:outline?"transparent":c,color:outline?c:t,border:"1px solid "+c,borderRadius:7,fontFamily:"inherit",fontSize:small?11:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",...style}}>{children}</button>};
const Dot=({id,size})=>{const sz=size||22,a=abt(id);return<div title={a.name} style={{width:sz,height:sz,borderRadius:"50%",background:a.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*0.36,color:"#0d0d14",fontWeight:800,flexShrink:0}}>{a.initials}</div>};
const SH=({color,label,count})=><div style={{fontSize:9,letterSpacing:"2px",color,textTransform:"uppercase",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><div style={{width:6,height:6,borderRadius:"50%",background:color}}/>{label}{count!==undefined&&<span style={{background:color+"22",color,borderRadius:20,padding:"1px 7px",fontSize:10}}>{count}</span>}</div>;
const MW=({children})=><div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}><div style={{background:"#13131e",borderRadius:18,padding:24,border:"1px solid #2a2a3e",boxShadow:"0 24px 60px rgba(0,0,0,0.8)",maxHeight:"88vh",overflowY:"auto",width:"100%",maxWidth:520}}>{children}</div></div>;
const MT=({children})=><div style={{fontSize:15,fontWeight:700,color:"#ddd8cc",marginBottom:16}}>{children}</div>;
const FL=({children,color})=><div style={{fontSize:9,letterSpacing:"1.5px",color:color||"#555",textTransform:"uppercase",marginBottom:4}}>{children}</div>;
const F=({children,mb})=><div style={{marginBottom:mb!==undefined?mb:11}}>{children}</div>;
const TA=({value,onChange,rows,placeholder})=><textarea value={value||""} onChange={onChange} rows={rows||2} placeholder={placeholder} style={{width:"100%",padding:"8px 11px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>;
const AcPick=({value,onChange,nullable})=><div style={{display:"flex",gap:5,alignItems:"center",overflowX:"auto",flexWrap:"nowrap",paddingBottom:2}}>{nullable&&<div onClick={()=>onChange(null)} style={{width:24,height:24,borderRadius:"50%",border:"1px dashed #444",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,color:"#444",background:value===null?"#1e1e2e":"transparent",flexShrink:0}}>-</div>}{ACCTS.map(a=><div key={a.id} onClick={()=>onChange(a.id)} title={a.name} style={{width:24,height:24,borderRadius:"50%",background:value===a.id?a.color:a.color+"33",border:"2px solid "+(value===a.id?a.color:"transparent"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:value===a.id?"#fff":a.color,fontWeight:800,cursor:"pointer",flexShrink:0}}>{a.initials}</div>)}</div>;

function Login({onLogin}){
  const [step,setStep]=useState("pick");
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const pick=a=>{setSel(a);setPin("");setErr("");setStep("pin")};
  const digit=d=>{const n=pin+d;setPin(n);if(n.length===4){setTimeout(()=>{if(n===sel.pin)onLogin(sel.id);else{setErr("Incorrect PIN");setPin("")}},180)}};
  return(
    <div style={{fontFamily:"'Palatino Linotype',serif",background:"#0d0d14",minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:11,color:"#34a876",letterSpacing:"4px",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Territory Ops</div>
        <div style={{fontSize:12,color:"#333",letterSpacing:"1px"}}>Orthopedic and Spine</div>
      </div>
      {step==="pick"&&<div style={{width:"100%",maxWidth:300}}>
        <div style={{fontSize:10,color:"#444",letterSpacing:"2px",textTransform:"uppercase",textAlign:"center",marginBottom:20}}>Who are you?</div>
        {ACCTS.map(a=><div key={a.id} onClick={()=>pick(a)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"#111119",border:"1px solid #1e1e2e",borderRadius:14,marginBottom:8,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=a.color} onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e2e"}>
          <div style={{width:42,height:42,borderRadius:"50%",background:a.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#0d0d14",fontWeight:800}}>{a.initials}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#ddd8cc"}}>{a.name}</div>{a.admin&&<div style={{fontSize:9,color:"#34a876",marginTop:2,letterSpacing:"1px"}}>ADMIN</div>}</div>
          <span style={{color:"#333",fontSize:18}}>›</span>
        </div>)}
      </div>}
      {step==="pin"&&sel&&<div style={{width:"100%",maxWidth:240,textAlign:"center"}}>
        <div onClick={()=>{setStep("pick");setPin("");setErr("")}} style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:28,cursor:"pointer"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:sel.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#0d0d14",fontWeight:800}}>{sel.initials}</div>
          <span style={{fontSize:14,color:"#ddd8cc",fontWeight:600}}>{sel.name}</span>
          <span style={{fontSize:11,color:"#444"}}>✕</span>
        </div>
        <div style={{fontSize:10,color:"#555",letterSpacing:"2px",textTransform:"uppercase",marginBottom:20}}>Enter PIN</div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:26}}>{[0,1,2,3].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:pin.length>i?sel.color:"#2a2a3e",transition:"background 0.12s"}}/>)}</div>
        {err&&<div style={{fontSize:12,color:"#e05060",marginBottom:12}}>{err}</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d,i)=><button key={i} onClick={()=>{if(d==="⌫")setPin(p=>p.slice(0,-1));else if(d)digit(d)}} style={{padding:"14px 0",background:d?"#111119":"transparent",border:d?"1px solid #1e1e2e":"none",borderRadius:10,color:"#ddd8cc",fontSize:17,fontFamily:"inherit",cursor:d?"pointer":"default"}} onMouseEnter={e=>d&&(e.currentTarget.style.background="#1e1e2e")} onMouseLeave={e=>d&&(e.currentTarget.style.background="#111119")}>{d}</button>)}
        </div>
      </div>}
    </div>
  );
}



function BulkScanModal({currentUser,assets,allLoc,onComplete,onClose}){
  const [step,setStep]=useState("location"); // location | scan | confirm
  const [destLocId,setDestLocId]=useState(allLoc[0]?.id||"");
  const [scannedList,setScannedList]=useState([]); // [{barcodeId, name, assetId|null, isNew}]
  const [scanning,setScanning]=useState(false);
  const [scanErr,setScanErr]=useState("");
  const [lastScan,setLastScan]=useState("");
  const [manualId,setManualId]=useState("");
  const [locSearch,setLocSearch]=useState("");
  const videoRef=React.useRef(null);
  const streamRef=React.useRef(null);
  const rafRef=React.useRef(null);
  const processingRef=React.useRef(false);

  const stopScan=()=>{
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    rafRef.current=null;
    if(workerRef.current){try{workerRef.current.terminate();}catch(e){}workerRef.current=null;}
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null;setScanning(false);
  };
  const startScan=async()=>{
    setScanErr("");setScanning(true);processingRef.current=false;
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
      streamRef.current=stream;
      videoRef.current.srcObject=stream;
      await videoRef.current.play();
      if(!window.Tesseract){setScanErr("OCR not loaded — enter manually below.");setScanning(false);return;}
      const worker=await window.Tesseract.createWorker("eng");
      await worker.setParameters({tessedit_char_whitelist:"0123456789",tessedit_pageseg_mode:"7"});
      workerRef.current=worker;
      setScanHint("Hold steady over the serial number");
      let lastScan=0;
      const scanLoop=async()=>{
        if(!streamRef.current||!videoRef.current){worker.terminate();return;}
        const now=Date.now();
        if(now-lastScan>800&&!processingRef.current){
          lastScan=now;
          try{
            const canvas=document.createElement("canvas");
            const vw=videoRef.current.videoWidth,vh=videoRef.current.videoHeight;
            canvas.width=vw;canvas.height=Math.floor(vh*0.4);
            canvas.getContext("2d").drawImage(videoRef.current,0,Math.floor(vh*0.3),vw,Math.floor(vh*0.4),0,0,vw,Math.floor(vh*0.4));
            const {data:{text}}=await worker.recognize(canvas);
            const serial=extractSerial(text);
            if(serial){
              processingRef.current=true;
              addScannedItem(serial);
              setScanHint("✓ "+serial+" — scan next set");
              setTimeout(()=>{processingRef.current=false;setScanHint("Hold steady over the serial number");},2000);
            }
          }catch(e){}
        }
        rafRef.current=requestAnimationFrame(scanLoop);
      };
      rafRef.current=requestAnimationFrame(scanLoop);
    }catch(e){setScanErr("Error: "+e.name+" — "+e.message);setScanning(false);}
  };
  React.useEffect(()=>()=>{stopScan();},[]);

  const addScannedItem=(id)=>{
    const trimmed=id.trim();
    if(!trimmed)return;
    if(scannedList.find(s=>s.barcodeId===trimmed)){setLastScan("⚠️ Already scanned");return;}
    const existing=assets.find(a=>a.barcodeId===trimmed);
    const item={barcodeId:trimmed,name:existing?.name||"Set "+trimmed.slice(-6),assetId:existing?.id||null,isNew:!existing,currentLoc:existing?.locationId||null};
    setScannedList(p=>[...p,item]);
    setLastScan("✓ "+item.name);
    setManualId("");
  };

  const removeItem=(barcodeId)=>setScannedList(p=>p.filter(s=>s.barcodeId!==barcodeId));

  const destLoc=allLoc.find(l=>l.id===destLocId);
  const filteredLoc=locSearch?allLoc.filter(l=>l.label.toLowerCase().includes(locSearch.toLowerCase())):allLoc;

  const handleConfirm=()=>{
    const moves=scannedList.filter(s=>!s.isNew&&s.assetId).map(s=>({assetId:s.assetId,toLocId:destLocId,by:currentUser}));
    const newAssets=scannedList.filter(s=>s.isNew).map(s=>({id:"ast-"+Date.now()+Math.random(),barcodeId:s.barcodeId,name:s.name,locationId:destLocId,history:[{date:new Date(),from:null,to:destLocId,by:currentUser}]}));
    // Also create move events for new assets that need ids matched
    onComplete(moves,newAssets);
  };

  return(<MW><MT>Bulk Scan & Move</MT>

    {/* Step indicator */}
    <div style={{display:"flex",gap:0,marginBottom:18,borderRadius:8,overflow:"hidden",border:"1px solid #2a2a3e"}}>
      {[["location","1. Destination"],["scan","2. Scan Sets"],["confirm","3. Confirm"]].map(([s,l],i)=>(
        <div key={s} style={{flex:1,padding:"7px 4px",textAlign:"center",fontSize:10,fontWeight:step===s?700:400,background:step===s?"#1a3d2b":"transparent",color:step===s?"#34a876":"#444",borderRight:i<2?"1px solid #2a2a3e":"none"}}>
          {l}
        </div>
      ))}
    </div>

    {/* STEP 1 — Pick destination */}
    {step==="location"&&<>
      <F mb={10}><FL>Search location</FL>
        <input value={locSearch} onChange={e=>setLocSearch(e.target.value)} placeholder="Type to filter..." style={{width:"100%",padding:"8px 11px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </F>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:240,overflowY:"auto",marginBottom:16}}>
        {filteredLoc.map(l=>{const active=destLocId===l.id;return(
          <button key={l.id} onClick={()=>setDestLocId(l.id)} style={{padding:"7px 12px",borderRadius:8,border:"1px solid "+(active?l.color:"#2a2a3e"),background:active?l.color+"22":"#0d0d14",color:active?l.color:"#666",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:active?700:400,display:"flex",alignItems:"center",gap:6}}>
            <span>{l.icon}</span><span>{l.label}</span>
          </button>
        );})}
      </div>
      {destLoc&&<div style={{padding:"8px 12px",background:destLoc.color+"18",border:"1px solid "+destLoc.color+"44",borderRadius:7,marginBottom:14,fontSize:12,color:destLoc.color,fontWeight:700}}>
        Destination: {destLoc.icon} {destLoc.label}
      </div>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#34a876" onClick={()=>setStep("scan")}>Next: Scan Sets →</Btn></div>
    </>}

    {/* STEP 2 — Scan sets */}
    {step==="scan"&&<>
      <div style={{padding:"6px 10px",background:destLoc?.color+"18",border:"1px solid "+destLoc?.color+"44",borderRadius:6,marginBottom:10,fontSize:11,color:destLoc?.color,fontWeight:700}}>
        → {destLoc?.icon} {destLoc?.label}
      </div>
      {/* Camera */}
      {scanning
        ?<div style={{borderRadius:10,overflow:"hidden",border:"1px solid #34a87655",background:"#0d0d14",position:"relative",marginBottom:8}}>
          <video ref={videoRef} style={{width:"100%",maxHeight:160,objectFit:"cover",display:"block"}} playsInline muted/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:"80%",height:56,border:"2px solid #34a876",borderRadius:6,boxShadow:"0 0 0 2000px rgba(0,0,0,0.45)"}}/>
          </div>
          {lastScan&&<div style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center",fontSize:11,color:lastScan.startsWith("✓")?"#34a876":"#e0a020",background:"rgba(0,0,0,0.7)",padding:"5px 0",fontWeight:700}}>{lastScan}</div>}
        </div>
        :<div onClick={startScan} style={{height:100,background:"#0d0d14",border:"2px dashed #34a87644",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:6,marginBottom:8}}>
          <div style={{fontSize:22}}>⬡</div>
          <div style={{fontSize:12,color:"#34a876",fontWeight:700}}>Tap to start scanning</div>
        </div>}
      {scanErr&&<div style={{fontSize:11,color:"#e05060",padding:"5px 10px",background:"#1a0a0a",borderRadius:6,border:"1px solid #e0506033",marginBottom:6}}>{scanErr}</div>}
      {scanning&&<button onClick={stopScan} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #555",color:"#555",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,marginBottom:8}}>⏸ Pause Camera</button>}
      {/* Manual entry */}
      <div style={{display:"flex",gap:7,marginBottom:10}}>
        <input value={manualId} onChange={e=>setManualId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&manualId.trim()&&addScannedItem(manualId)} placeholder="Or type barcode + Enter..." style={{flex:1,padding:"7px 10px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none"}}/>
        <Btn color="#34a876" small onClick={()=>manualId.trim()&&addScannedItem(manualId)}>Add</Btn>
      </div>
      {/* Scanned list */}
      <div style={{fontSize:9,color:"#555",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6,display:"flex",justifyContent:"space-between"}}>
        <span>Scanned Sets</span><span style={{color:scannedList.length>0?"#34a876":"#555"}}>{scannedList.length} sets</span>
      </div>
      <div style={{maxHeight:160,overflowY:"auto",marginBottom:12}}>
        {scannedList.length===0&&<div style={{fontSize:11,color:"#333",textAlign:"center",padding:"16px 0"}}>No sets scanned yet</div>}
        {scannedList.map((s,i)=>(
          <div key={s.barcodeId} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:i%2===0?"#0d0d14":"#111119",borderRadius:6,marginBottom:3}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:s.isNew?"#e0a020":"#34a876",flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#ddd8cc"}}>{s.name}</div>
              <div style={{fontSize:9,color:"#444",fontFamily:"monospace"}}>{s.barcodeId}{s.isNew&&<span style={{color:"#e0a020",marginLeft:6}}>NEW</span>}</div>
            </div>
            <button onClick={()=>removeItem(s.barcodeId)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:14,padding:0}}>×</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
        <Btn outline color="#555" onClick={()=>{stopScan();setStep("location");}}>← Back</Btn>
        <Btn color="#34a876" onClick={()=>{stopScan();setStep("confirm");}} style={{opacity:scannedList.length===0?0.4:1}}>Review {scannedList.length} Sets →</Btn>
      </div>
    </>}

    {/* STEP 3 — Confirm */}
    {step==="confirm"&&<>
      <div style={{padding:"10px 12px",background:destLoc?.color+"18",border:"1px solid "+destLoc?.color+"44",borderRadius:8,marginBottom:14}}>
        <div style={{fontSize:11,color:"#555",marginBottom:2}}>Moving {scannedList.length} sets to</div>
        <div style={{fontSize:15,fontWeight:700,color:destLoc?.color}}>{destLoc?.icon} {destLoc?.label}</div>
      </div>
      <div style={{maxHeight:220,overflowY:"auto",marginBottom:14}}>
        {scannedList.map((s,i)=>(
          <div key={s.barcodeId} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #161620"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:s.isNew?"#e0a020":"#34a876",flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#ddd8cc"}}>{s.name}</div>
              <div style={{fontSize:9,color:"#555",fontFamily:"monospace"}}>{s.barcodeId}</div>
            </div>
            <span style={{fontSize:9,color:s.isNew?"#e0a020":"#34a876",fontWeight:700}}>{s.isNew?"NEW":"MOVE"}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
        <Btn outline color="#555" onClick={()=>setStep("scan")}>← Back</Btn>
        <Btn color="#34a876" onClick={handleConfirm}>✓ Confirm All {scannedList.length} Sets</Btn>
      </div>
    </>}
  </MW>);
}

function ScanMoveModal({currentUser,assets,allLoc,allTrays,initialAsset,onRegister,onMove,onClose}){
  const [mode,setMode]=useState(initialAsset?"move":"scan");
  const [foundAsset,setFoundAsset]=useState(initialAsset||null);
  const [scanning,setScanning]=useState(false);
  const [scanErr,setScanErr]=useState("");
  const [scanHint,setScanHint]=useState("");
  const [scannedId,setScannedId]=useState(initialAsset?.barcodeId||"");
  const [manualId,setManualId]=useState("");
  const [setType,setSetType]=useState(""); // which tray type from library
  const [typeSearch,setTypeSearch]=useState("");
  const [locId,setLocId]=useState(allLoc[0]?.id||"");
  const [regPhotos,setRegPhotos]=useState([]);
  const addRegPhoto=file=>{const r=new FileReader();r.onload=e=>setRegPhotos(p=>[...p,{name:file.name,url:e.target.result,addedBy:currentUser,date:new Date()}]);r.readAsDataURL(file);};
  const videoRef=React.useRef(null);
  const streamRef=React.useRef(null);

  const rafRef=React.useRef(null);
  const stopScan=()=>{
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    rafRef.current=null;
    if(workerRef.current){try{workerRef.current.terminate();}catch(e){}workerRef.current=null;}
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null;setScanning(false);
  };
  const startScan=async()=>{
    setScanErr("");setScanHint("Point camera at the barcode on the set");setScanning(true);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
      streamRef.current=stream;
      videoRef.current.srcObject=stream;
      await videoRef.current.play();
      if(!window.Tesseract){setScanErr("OCR not loaded — enter manually below.");setScanning(false);return;}
      const worker=await window.Tesseract.createWorker("eng");
      await worker.setParameters({tessedit_char_whitelist:"0123456789",tessedit_pageseg_mode:"7"});
      workerRef.current=worker;
      setScanHint("Hold steady over the serial number");
      let lastScan=0;
      const scanLoop=async()=>{
        if(!streamRef.current||!videoRef.current){worker.terminate();return;}
        const now=Date.now();
        if(now-lastScan>800){
          lastScan=now;
          try{
            const canvas=document.createElement("canvas");
            const vw=videoRef.current.videoWidth,vh=videoRef.current.videoHeight;
            canvas.width=vw;canvas.height=Math.floor(vh*0.4);
            canvas.getContext("2d").drawImage(videoRef.current,0,Math.floor(vh*0.3),vw,Math.floor(vh*0.4),0,0,vw,Math.floor(vh*0.4));
            const {data:{text}}=await worker.recognize(canvas);
            const serial=extractSerial(text);
            if(serial){stopScan();worker.terminate();handleBarcodeFound(serial);return;}
          }catch(e){}
        }
        rafRef.current=requestAnimationFrame(scanLoop);
      };
      rafRef.current=requestAnimationFrame(scanLoop);
    }catch(e){setScanErr("Error: "+e.name+" — "+e.message);setScanning(false);}
  };
  React.useEffect(()=>()=>{stopScan();},[]);

  const handleBarcodeFound=(id)=>{
    setScannedId(id);
    const existing=assets.find(a=>a.barcodeId===id);
    if(existing){setFoundAsset(existing);setMode("move");}
    else{setFoundAsset(null);setMode("register");}
  };

  const locColor=allLoc.find(l=>l.id===locId)?.color||"#555";
  const locIcon=allLoc.find(l=>l.id===locId)?.icon||"?";

  return(<MW>
    <MT>{mode==="scan"?"Scan Set Barcode":mode==="register"?"Register New Set":"Move Set"}</MT>

    {mode==="scan"&&<>
      <div style={{marginBottom:14}}>
        {scanning?<div style={{borderRadius:10,overflow:"hidden",border:"1px solid #34a87655",background:"#0d0d14",position:"relative",marginBottom:8}}>
          <video ref={videoRef} style={{width:"100%",maxHeight:200,objectFit:"cover",display:"block"}} playsInline muted/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:"75%",height:70,border:"2px solid #34a876",borderRadius:6,boxShadow:"0 0 0 2000px rgba(0,0,0,0.4)"}}/>
          </div>
          {scanHint&&<div style={{position:"absolute",bottom:6,left:0,right:0,textAlign:"center",fontSize:11,color:"#34a876",background:"rgba(0,0,0,0.6)",padding:"4px 0"}}>{scanHint}</div>}
        </div>:<div onClick={startScan} style={{height:140,background:"#0d0d14",border:"2px dashed #34a87655",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:8}}>
          <div style={{fontSize:32}}>⬡</div>
          <div style={{fontSize:13,color:"#34a876",fontWeight:700}}>Tap to scan barcode</div>
          <div style={{fontSize:10,color:"#444"}}>Uses rear camera</div>
        </div>}
        {scanErr&&<div style={{fontSize:11,color:"#e05060",padding:"6px 10px",background:"#1a0a0a",borderRadius:6,border:"1px solid #e0506033",marginBottom:8}}>{scanErr}</div>}
        {scanning&&<button onClick={stopScan} style={{width:"100%",padding:"8px",background:"transparent",border:"1px solid #e05060",color:"#e05060",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>Stop Scanning</button>}
      </div>
      <div style={{marginTop:12}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:1,marginBottom:6}}>OR ENTER BARCODE MANUALLY</div>
        <div style={{display:"flex",gap:7}}>
          <input
            autoFocus
            inputMode="numeric"
            value={manualId}
            onChange={e=>setManualId(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&manualId.trim()&&handleBarcodeFound(manualId.trim())}
            placeholder="Type barcode ID (e.g. 2024851)"
            style={{flex:1,padding:"12px 14px",background:"#0d0d14",border:"2px solid #34a87655",borderRadius:8,color:"#ddd8cc",fontFamily:"inherit",fontSize:16,outline:"none"}}
          />
          <Btn color="#34a876" onClick={()=>manualId.trim()&&handleBarcodeFound(manualId.trim())}>Look Up</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn></div>
    </>}

    {mode==="register"&&<>
      <div style={{padding:"8px 12px",background:"#34a87618",border:"1px solid #34a87633",borderRadius:7,marginBottom:14,fontSize:11,color:"#34a876"}}>
        New set — Serial: <span style={{fontFamily:"monospace",fontWeight:700}}>{scannedId||"manual"}</span>
      </div>
      <F mb={14}><FL color="#34a876">Set Type</FL>
        <div style={{fontSize:10,color:"#555",marginBottom:8}}>Pick an existing type or type a new one — any serial with the same type satisfies a case requirement</div>
        {setType
          ?<div style={{padding:"8px 12px",background:"#34a87622",border:"1px solid #34a876",borderRadius:8,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#34a876"}}>{setType}</div>
              <div style={{fontSize:10,color:"#34a876aa"}}>Serial: {scannedId||"—"}</div>
            </div>
            <button onClick={()=>{setSetType("");setTypeSearch("");}} style={{background:"none",border:"none",color:"#34a876",cursor:"pointer",fontSize:16,padding:0}}>×</button>
          </div>
          :<div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <input value={typeSearch} onChange={e=>setTypeSearch(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&typeSearch.trim()){setSetType(typeSearch.trim());setTypeSearch("");}}}
                placeholder="Search or type new set type + Enter..." style={{flex:1,padding:"8px 10px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none"}}/>
              {typeSearch.trim()&&<button onClick={()=>{setSetType(typeSearch.trim());setTypeSearch("");}} style={{padding:"6px 12px",background:"#34a876",border:"none",borderRadius:7,color:"#0d0d14",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Use "{typeSearch.trim()}"</button>}
            </div>
            {(allTrays||[]).filter(t=>!typeSearch||t.toLowerCase().includes(typeSearch.toLowerCase())).length>0&&
              <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:120,overflowY:"auto"}}>
                {(allTrays||[]).filter(t=>!typeSearch||t.toLowerCase().includes(typeSearch.toLowerCase())).map(t=>(
                  <button key={t} onClick={()=>{setSetType(t);setTypeSearch("");}} style={{padding:"5px 10px",borderRadius:20,border:"1px solid #2a2a3e",background:"transparent",color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>
                ))}
              </div>}
            {(allTrays||[]).length===0&&!typeSearch&&<div style={{fontSize:11,color:"#555",fontStyle:"italic",padding:"8px 0"}}>No set types yet — type a name above to create one</div>}
          </div>}
      </F>
      <F mb={14}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <FL>Set Photo</FL>
          {regPhotos.length>0&&<label style={{cursor:"pointer"}}><span style={{fontSize:11,color:"#34a876",border:"1px solid #34a87644",borderRadius:6,padding:"3px 10px",fontWeight:700}}>+ Add</span><input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(addRegPhoto);e.target.value="";}} /></label>}
        </div>
        {regPhotos.length===0
          ?<label style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"20px",background:"#0d0d14",border:"2px dashed #34a87633",borderRadius:10}}>
            <div style={{fontSize:28}}>📷</div>
            <div style={{fontSize:12,color:"#34a876",fontWeight:700}}>Tap to photograph the set</div>
            <div style={{fontSize:10,color:"#444"}}>Reference image for your whole team</div>
            <input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(addRegPhoto);e.target.value="";}}/>
          </label>
          :<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {regPhotos.map((p,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={p.url} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"1px solid #34a87644",display:"block"}}/>
                <button onClick={()=>setRegPhotos(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
              </div>
            ))}
            <label style={{cursor:"pointer",width:80,height:80,background:"#0d0d14",border:"2px dashed #34a87633",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#34a876"}}>+<input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(addRegPhoto);e.target.value="";}} /></label>
          </div>}
      </F>
      <F mb={16}><FL>Current Location</FL>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:160,overflowY:"auto"}}>
          {allLoc.map(l=>{const active=locId===l.id;return(
            <button key={l.id} onClick={()=>setLocId(l.id)} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(active?l.color:"#2a2a3e"),background:active?l.color+"22":"transparent",color:active?l.color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:active?700:400}}>
              {l.icon} {l.label}
            </button>
          );})}
        </div>
      </F>
      {!(setType||typeSearch).trim()&&<div style={{fontSize:11,color:"#e0a020",padding:"6px 10px",background:"#1a1500",border:"1px solid #e0a02033",borderRadius:6,marginBottom:10}}>Enter or select a set type above to continue</div>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn outline color="#555" onClick={()=>setMode("scan")}>← Back</Btn>
        <Btn color="#34a876" onClick={()=>{const t=(setType||typeSearch).trim();if(!t)return;onRegister(scannedId,t,locId,currentUser,regPhotos);onClose();}} style={{opacity:(setType||typeSearch).trim()?1:0.4}}>Register Set</Btn>
      </div>
    </>}

    {mode==="move"&&foundAsset&&<>
      <div style={{padding:"8px 12px",background:"#111119",border:"1px solid #2a2a3e",borderRadius:7,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#ddd8cc",marginBottom:2}}>{foundAsset.name}</div>
        <div style={{fontSize:9,color:"#555",fontFamily:"monospace"}}>{foundAsset.barcodeId}</div>
        <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
          {(()=>{const l=allLoc.find(x=>x.id===foundAsset.locationId);return l?<Bdg bg={l.color+"22"} color={l.color}>{l.icon} {l.label}</Bdg>:null;})()}
          <span style={{fontSize:11,color:"#555"}}>→ moving to...</span>
        </div>
      </div>
      <F mb={16}><FL>New Location</FL>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:180,overflowY:"auto"}}>
          {allLoc.filter(l=>l.id!==foundAsset.locationId).map(l=>{const active=locId===l.id;return(
            <button key={l.id} onClick={()=>setLocId(l.id)} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(active?l.color:"#2a2a3e"),background:active?l.color+"22":"transparent",color:active?l.color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:active?700:400}}>
              {l.icon} {l.label}
            </button>
          );})}
        </div>
      </F>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn outline color="#555" onClick={()=>setMode("scan")}>← Back</Btn>
        <Btn color="#34a876" onClick={()=>{if(!locId)return;onMove(foundAsset.id,locId,currentUser);onClose();}}>Confirm Move</Btn>
      </div>
    </>}
  </MW>);
}

function CaseModal({surgeons,allTrays,currentUser,initialDate,onSave,onClose}){
  if(!surgeons.length)return<MW><MT>No Surgeons</MT><div style={{color:"#555",fontSize:13,marginBottom:16}}>Add a surgeon first.</div><div style={{display:"flex",justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Close</Btn></div></MW>;
  const fs=surgeons[0];
  const prefillDate=initialDate instanceof Date?initialDate.toLocaleDateString("en-CA"):"";
  const [f,sf]=useState({date:prefillDate,surgeonId:fs.id,facility:fs.facility||FACS[0],procedure:"",prefKey:"",sets:[],setChecks:{},returned:false,implants:[],checkInPhotos:[],coverageAssignee:currentUser,checklistAssignees:{setsReturned:currentUser,implants:currentUser}});

  const selSurg=surgeons.find(s=>s.id===f.surgeonId)||fs;
  const profiles=Object.entries(selSurg.procedurePrefs||{});
  const getProfileName=(key,pref)=>pref.name||key;

  const applyPref=(profileKey)=>{
    const pref=selSurg.procedurePrefs[profileKey];
    if(!pref)return;
    const sets=pref.trays||[];
    const setChecks={};
    sets.forEach(t=>{setChecks[t]={confirmed:false,assignee:null};});
    sf(p=>({...p,prefKey:profileKey,procedure:pref.name||p.procedure,sets,setChecks}));
  };

  const tT=t=>{const on=f.sets.includes(t),sets=on?f.sets.filter(x=>x!==t):[...f.sets,t],sc={...f.setChecks};if(!on)sc[t]={confirmed:false,assignee:null};else delete sc[t];sf(p=>({...p,sets,setChecks:sc}))};

  const changeSurgeon=e=>{
    const s=surgeons.find(x=>x.id===parseInt(e.target.value));
    if(s)sf(p=>({...p,surgeonId:s.id,facility:s.facility,prefKey:"",sets:[],setChecks:{}}));
  };

  return(<MW><MT>Schedule New Case</MT>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:11}}>
      <F mb={0}><FL>Date</FL><Inp type="date" value={f.date} onChange={e=>sf(p=>({...p,date:e.target.value}))}/></F>
      <F mb={0}><FL>Time</FL><Sel value={f.time||""} onChange={e=>sf(p=>({...p,time:e.target.value}))}>
        <option value="">TBD</option>
        {["5:30 AM","6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"].map(t=><option key={t} value={t}>{t}</option>)}
      </Sel></F>
      <F mb={0}><FL>Coverage</FL><div style={{paddingTop:4}}><AcPick value={f.coverageAssignee} onChange={v=>sf(p=>({...p,coverageAssignee:v||currentUser}))}/></div></F>
    </div>
    <F><FL>Surgeon</FL><Sel value={f.surgeonId} onChange={changeSurgeon}>
      {surgeons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
    </Sel></F>
    <F><FL>Facility</FL><Sel value={f.facility} onChange={e=>sf(p=>({...p,facility:e.target.value}))}>{FACS.map(x=><option key={x}>{x}</option>)}</Sel></F>

    {profiles.length>0&&<F mb={14}>
      <FL color="#34a876">Preference Profile</FL>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:f.prefKey?8:0}}>
        {profiles.map(([key,pref])=>{
          const active=f.prefKey===key;
          return(
            <button key={key} onClick={()=>active?sf(p=>({...p,prefKey:"",sets:[],setChecks:{}})):applyPref(key)}
              style={{padding:"5px 12px",borderRadius:20,border:"1px solid "+(active?"#34a876":"#2a2a3e"),background:active?"#1a3d2b":"transparent",color:active?"#34a876":"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:active?700:400,display:"flex",alignItems:"center",gap:5}}>
              {active&&<span style={{fontSize:9}}>✓</span>}{getProfileName(key,pref)}
            </button>
          );
        })}
      </div>
      {f.prefKey&&<div style={{fontSize:10,color:"#34a876",padding:"4px 10px",background:"#0d1a0d",borderRadius:6,border:"1px solid #34a87633"}}>
        Sets auto-populated from {selSurg.name}'s preference card — you can still adjust below
      </div>}
    </F>}

    <F><FL>Procedure</FL><Inp value={f.procedure} onChange={e=>sf(p=>({...p,procedure:e.target.value}))} placeholder="e.g. L4-S1 MIS TLIF"/></F>
    <F mb={18}><FL>Instrument Sets {f.sets.length>0&&<span style={{color:"#4a9eff",fontWeight:400,fontSize:10}}>({f.sets.length} selected)</span>}</FL>
      {allTrays.length===0
        ?<div style={{fontSize:11,color:"#555",padding:"8px",background:"#0d0d14",borderRadius:6,border:"1px dashed #2a2a3e"}}>Add sets in the Sets Library (Surgeons tab) first.</div>
        :<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{allTrays.map(t=>{const on=f.sets.includes(t);return<button key={t} onClick={()=>tT(t)} style={{padding:"3px 8px",borderRadius:5,border:"1px solid "+(on?"#4a9eff":"#2a2a3e"),background:on?"#0d2040":"transparent",color:on?"#4a9eff":"#333",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>})}</div>}
    </F>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#4a9eff" onClick={()=>{if(!f.procedure.trim()||!f.date)return;onSave({...f,id:Date.now(),date:new Date(f.date+"T12:00:00")})}}>Schedule Case</Btn></div>
  </MW>);
}


function PrefModal({surg,templateId,templates,allTrays,prefPhotos,setPrefPhotos,onSave,onClose}){
  const tpl=templates.find(t=>t.id===templateId),ex=surg.procedurePrefs[templateId]||{};
  const [f,sf]=useState({
    trays:[...(ex.trays||tpl?.trays||[])],
    robot:!!ex.robot,stealth:!!ex.stealth,fluoro:!!ex.fluoro,
    hospitalSets:ex.hospitalSets||"",
    roomSetup:ex.roomSetup||tpl?.roomSetup||"",
    positioning:ex.positioning||tpl?.positioning||"",
    exposure:ex.exposure||"",
    hardwareWorkflow:ex.hardwareWorkflow||"",
    otherInfo:ex.otherInfo||"",
  });
  const key=surg.id+"-"+templateId;
  const photos=prefPhotos[key]||[];
  const addPhoto=file=>{const r=new FileReader();r.onload=e=>setPrefPhotos(p=>({...p,[key]:[...(p[key]||[]),{name:file.name,url:e.target.result}]}));r.readAsDataURL(file);};
  const remPhoto=i=>setPrefPhotos(p=>({...p,[key]:(p[key]||[]).filter((_,j)=>j!==i)}));
  const CB=({field,label,color})=>(
    <div onClick={()=>sf(p=>({...p,[field]:!p[field]}))} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:f[field]?color+"18":"#0d0d14",border:"1px solid "+(f[field]?color:"#2a2a3e"),borderRadius:9,cursor:"pointer",transition:"all 0.15s",flex:1}}>
      <div style={{width:20,height:20,borderRadius:5,border:"2px solid "+(f[field]?color:"#333"),background:f[field]?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#0d0d14",fontWeight:900,flexShrink:0}}>{f[field]?"✓":""}</div>
      <span style={{fontSize:13,fontWeight:700,color:f[field]?color:"#555",letterSpacing:"0.5px"}}>{label}</span>
    </div>
  );
  const NOTE_FIELDS=[
    ["Hospital Sets","hospitalSets","#34a876"],
    ["Room Set-up","roomSetup",null],
    ["Positioning","positioning",null],
    ["Exposure","exposure",null],
    ["Hardware Workflow","hardwareWorkflow","#e0a020"],
    ["Other Key Information","otherInfo","#a060e0"],
  ];
  return(<MW><MT>Procedure Preferences — {surg.name}</MT>
    <div style={{fontSize:11,color:"#555",marginBottom:14}}>{tpl?.name}</div>
    <F mb={14}><FL>Instrumentation</FL>
      {allTrays.length===0
        ?<div style={{fontSize:11,color:"#555",padding:"8px",background:"#0d0d14",borderRadius:6,border:"1px dashed #2a2a3e"}}>Add sets in Sets Library first.</div>
        :<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{allTrays.map(t=>{const on=f.trays.includes(t);return<button key={t} onClick={()=>sf(p=>({...p,trays:on?p.trays.filter(x=>x!==t):[...p.trays,t]}))} style={{padding:"3px 8px",borderRadius:5,border:"1px solid "+(on?"#34a876":"#2a2a3e"),background:on?"#1a3d2b":"transparent",color:on?"#34a876":"#333",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;})}</div>}
    </F>
    <F mb={16}><FL>Technology</FL>
      <div style={{display:"flex",gap:8}}><CB field="robot" label="Robot" color="#4a9eff"/><CB field="stealth" label="Stealth" color="#e05060"/><CB field="fluoro" label="Fluoro" color="#888"/></div>
    </F>
    {NOTE_FIELDS.map(([label,key,color])=>(
      <F key={key} mb={12}>
        <FL color={color||"#555"}>{label}</FL>
        <TA value={f[key]} onChange={e=>sf(p=>({...p,[key]:e.target.value}))} rows={2} placeholder={
          key==="hospitalSets"?"Loaner sets, SPD contacts, lead times...":
          key==="roomSetup"?"Table, equipment layout, C-arm side...":
          key==="positioning"?"Prone, lateral, degrees, bean bag...":
          key==="exposure"?"Incision, retractors, exposure notes...":
          key==="hardwareWorkflow"?"Implant sequence, sizing, workflow notes...":
          "Anything else the team should know..."}/>
      </F>
    ))}
    <F mb={16}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <FL color="#a060e0">Reference Photos</FL>
        <label style={{cursor:"pointer"}}><span style={{fontSize:10,color:"#a060e0",border:"1px solid #3a1a6a",borderRadius:6,padding:"3px 10px",fontWeight:700}}>+ Add Images</span><input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(addPhoto);e.target.value="";}}/>
        </label>
      </div>
      {photos.length===0
        ?<div style={{fontSize:11,color:"#333",padding:"12px",background:"#0d0d14",borderRadius:7,border:"1px dashed #2a2a3e",textAlign:"center"}}>No images yet — add positioning guides, OR diagrams, or setup photos</div>
        :<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{photos.map((p,i)=>(<div key={i} style={{position:"relative"}}><img src={p.url} style={{width:80,height:80,objectFit:"cover",borderRadius:7,border:"1px solid #2a2a3e",display:"block"}}/><button onClick={()=>remPhoto(i)} style={{position:"absolute",top:-5,right:-5,width:17,height:17,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>{p.name&&<div style={{fontSize:8,color:"#444",marginTop:2,textAlign:"center",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>}</div>))}</div>}
    </F>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#34a876" onClick={()=>onSave(templateId,f)}>Save Preferences</Btn></div>
  </MW>);
}

function TplModal({tpl,allTrays,onSave,onClose}){
  const [f,sf]=useState(tpl?{...tpl,trays:[...tpl.trays]}:{id:"tpl-"+Date.now(),name:"",specialty:"Spine",trays:[],positioning:"",roomSetup:"",notes:""});
  const [setSearch,setSetSearch]=useState("");
  const filteredTrays=allTrays.filter(t=>t.toLowerCase().includes(setSearch.toLowerCase()));
  return(<MW><MT>{tpl?"Edit":"New"} Procedure Template</MT>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <F mb={0}><FL>Name</FL><Inp value={f.name} onChange={e=>sf(p=>({...p,name:e.target.value}))}/></F>
      <F mb={0}><FL>Specialty</FL><Sel value={f.specialty} onChange={e=>sf(p=>({...p,specialty:e.target.value}))}>{SPECS.map(x=><option key={x}>{x}</option>)}</Sel></F>
    </div>
    {[["Default Positioning","positioning"],["Default Room Setup","roomSetup"],["Notes","notes"]].map(([l,k])=>(<F key={k} mb={10}><FL>{l}</FL><TA value={f[k]} onChange={e=>sf(p=>({...p,[k]:e.target.value}))}/></F>))}
    <F mb={16}><FL>Default Sets</FL>
      {f.trays.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
        {f.trays.map((t,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px 3px 10px",background:"#1a2a3d",border:"1px solid #4a9eff44",borderRadius:20}}>
          <span style={{fontSize:11,color:"#4a9eff"}}>{t}</span>
          <button onClick={()=>sf(p=>({...p,trays:p.trays.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:"#4a9eff88",cursor:"pointer",fontSize:13,padding:"0 2px",lineHeight:1}}>×</button>
        </div>))}
      </div>}
      {allTrays.length===0
        ?<div style={{fontSize:11,color:"#555",padding:"8px",background:"#0d0d14",borderRadius:6,border:"1px dashed #2a2a3e"}}>Add sets in the Sets Library first.</div>
        :<div>
          <Inp value={setSearch} onChange={e=>setSetSearch(e.target.value)} placeholder="Search sets..." style={{marginBottom:7,fontSize:12}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:130,overflowY:"auto",padding:"2px 0"}}>
            {filteredTrays.map(t=>{const on=f.trays.includes(t);return(
              <button key={t} onClick={()=>sf(p=>({...p,trays:on?p.trays.filter(x=>x!==t):[...p.trays,t]}))}
                style={{padding:"3px 8px",borderRadius:5,border:"1px solid "+(on?"#4a9eff":"#2a2a3e"),background:on?"#0d2040":"transparent",color:on?"#4a9eff":"#555",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                {on&&<span style={{marginRight:3,fontSize:9}}>✓</span>}{t}
              </button>
            );})}
            {filteredTrays.length===0&&<div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>No sets match "{setSearch}"</div>}
          </div>
        </div>}
    </F>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#a060e0" onClick={()=>f.name.trim()&&onSave(f)}>Save Template</Btn></div>
  </MW>);
}

function SurgModal({surg,onSave,onClose}){
  const [f,sf]=useState(surg?{...surg}:{id:Date.now(),name:"",specialty:"Spine",facility:FACS[0],status:"Active",procedurePrefs:{}});
  return(<MW><MT>{surg?"Edit":"Add"} Surgeon</MT>
    <F><FL>Name</FL><Inp value={f.name} onChange={e=>sf(p=>({...p,name:e.target.value}))}/></F>
    <F><FL>Facility</FL><Sel value={f.facility} onChange={e=>sf(p=>({...p,facility:e.target.value}))}>{FACS.map(x=><option key={x}>{x}</option>)}</Sel></F>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
      <F mb={0}><FL>Specialty</FL><Sel value={f.specialty} onChange={e=>sf(p=>({...p,specialty:e.target.value}))}>{SPECS.map(x=><option key={x}>{x}</option>)}</Sel></F>
      <F mb={0}><FL>Status</FL><Sel value={f.status} onChange={e=>sf(p=>({...p,status:e.target.value}))}>{["Active","Occasional","Inactive"].map(x=><option key={x}>{x}</option>)}</Sel></F>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#34a876" onClick={()=>f.name.trim()&&onSave(f)}>Save</Btn></div>
  </MW>);
}

function TaskModal({task,cases,surgeons,currentUser,onSave,onClose}){
  const [f,sf]=useState(task?{...task}:{id:Date.now(),title:"",assignee:currentUser,priority:"medium",due:"",done:false,caseId:null,notes:""});
  return(<MW><MT>{task?"Edit Task":"New Task"}</MT>
    <F><FL>Task Title</FL><Inp value={f.title} onChange={e=>sf(p=>({...p,title:e.target.value}))}/></F>
    <F mb={12}><FL>Assign To</FL><AcPick value={f.assignee} onChange={v=>sf(p=>({...p,assignee:v||currentUser}))}/></F>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:11}}>
      <F mb={0}><FL>Priority</FL><Sel value={f.priority} onChange={e=>sf(p=>({...p,priority:e.target.value}))}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Sel></F>
      <F mb={0}><FL>Due Date</FL><Inp type="date" value={f.due} onChange={e=>sf(p=>({...p,due:e.target.value}))}/></F>
    </div>
    <F mb={16}><FL>Notes</FL><TA value={f.notes} onChange={e=>sf(p=>({...p,notes:e.target.value}))}/></F>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#e0a020" text="#0d0d14" onClick={()=>f.title.trim()&&onSave(f)}>Save Task</Btn></div>
  </MW>);
}

function LoanerModal({loaner,currentUser,onSave,onClose}){
  const [f,sf]=useState(loaner||{id:Date.now(),setName:"",hospital:FACS[0],status:"Received",receivedDate:"",returnedDate:"",assignee:currentUser,notes:"",fedex:"",photo:null});
  const [scanning,setScanning]=useState(false);
  const [scanErr,setScanErr]=useState("");
  const [scanHint,setScanHint]=useState("");
  const videoRef=React.useRef(null);
  const streamRef=React.useRef(null);
  const rafRef=React.useRef(null);
  const stopScan=()=>{
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    rafRef.current=null;
    if(workerRef.current){try{workerRef.current.terminate();}catch(e){}workerRef.current=null;}
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null;setScanning(false);
  };
  const startScan=async()=>{
    setScanErr("");setScanHint("Point at a shipping label barcode");setScanning(true);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
      streamRef.current=stream;
      videoRef.current.srcObject=stream;
      await videoRef.current.play();
      if(!window.Tesseract){setScanErr("OCR not loaded — enter manually below.");setScanning(false);return;}
      const worker=await window.Tesseract.createWorker("eng");
      await worker.setParameters({tessedit_char_whitelist:"0123456789 ",tessedit_pageseg_mode:"6"});
      workerRef.current=worker;
      setScanHint("Point at shipping label barcode number");
      let lastScan=0;
      const scanLoop=async()=>{
        if(!streamRef.current||!videoRef.current){worker.terminate();return;}
        const now=Date.now();
        if(now-lastScan>800){
          lastScan=now;
          try{
            const canvas=document.createElement("canvas");
            canvas.width=videoRef.current.videoWidth;canvas.height=videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current,0,0);
            const {data:{text}}=await worker.recognize(canvas);
            const t=extractTracking(text.replace(/\s+/g,""));
            if(t&&t.length>=10){sf(p=>({...p,fedex:t}));setScanHint("✓ "+t);stopScan();worker.terminate();return;}
          }catch(e){}
        }
        rafRef.current=requestAnimationFrame(scanLoop);
      };
      rafRef.current=requestAnimationFrame(scanLoop);
    }catch(e){setScanErr("Error: "+e.name+" — "+e.message);setScanning(false);}
  };
  const extractTracking=raw=>{const clean=raw.replace(/\D/g,"");const m=clean.match(/(?:96|94|92|93)\d{18,20}|(\d{12}|\d{15}|\d{20})/);return m?m[0]:raw.slice(0,30);};
  React.useEffect(()=>()=>{stopScan();},[]);
  const addPhoto=file=>{const r=new FileReader();r.onload=e=>sf(p=>({...p,photo:e.target.result}));r.readAsDataURL(file);};

  return(<MW><MT>{loaner?"Edit Loaner":"New Loaner"}</MT>
    <F><FL>Set / Instrument Name</FL><Inp value={f.setName} onChange={e=>sf(p=>({...p,setName:e.target.value}))} placeholder="e.g. MIS TLIF Set, Pedicle Screw System"/></F>
    <F><FL>Hospital</FL><Sel value={f.hospital} onChange={e=>sf(p=>({...p,hospital:e.target.value}))}>{FACS.map(x=><option key={x}>{x}</option>)}</Sel></F>
    <F><FL>Status</FL>
      <div style={{display:"flex",gap:8}}>
        {["Received","Returned","Borrowed"].map(s=>{const active=f.status===s;const col=s==="Received"?"#34a876":s==="Returned"?"#4a9eff":"#e0a020";return(
          <button key={s} onClick={()=>sf(p=>({...p,status:s}))} style={{flex:1,padding:"8px 4px",borderRadius:8,border:"1px solid "+(active?col:"#2a2a3e"),background:active?col+"18":"transparent",color:active?col:"#555",fontSize:12,fontWeight:active?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.1s"}}>{s}</button>
        );})}
      </div>
    </F>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      <F mb={0}><FL>Received Date</FL><Inp type="date" value={f.receivedDate||""} onChange={e=>sf(p=>({...p,receivedDate:e.target.value}))}/></F>
      <F mb={0}><FL>Returned Date</FL><Inp type="date" value={f.returnedDate||""} onChange={e=>sf(p=>({...p,returnedDate:e.target.value}))}/></F>
    </div>
    <F mb={12}><FL>Assigned To</FL><AcPick value={f.assignee} onChange={v=>sf(p=>({...p,assignee:v||currentUser}))}/></F>
    <F mb={14}><FL>Notes</FL><TA value={f.notes} onChange={e=>sf(p=>({...p,notes:e.target.value}))} placeholder="Vendor contact, loaner details, special instructions..."/></F>
    <F mb={14}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <FL color="#e0a020">Tracking Number</FL>
        <button onClick={scanning?stopScan:startScan} style={{fontSize:10,background:scanning?"#3d1520":"#1a1a2e",color:scanning?"#e05060":"#a060e0",border:"1px solid "+(scanning?"#e0506055":"#a060e055"),borderRadius:6,padding:"3px 10px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
          {scanning?"✕ Stop":"📷 Scan Barcode"}
        </button>
      </div>
      {scanning&&<div style={{marginBottom:8,borderRadius:10,overflow:"hidden",border:"1px solid #a060e055",background:"#0d0d14",position:"relative"}}>
        <video ref={videoRef} style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}} playsInline muted/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{width:"70%",height:60,border:"2px solid #a060e0",borderRadius:6,boxShadow:"0 0 0 2000px rgba(0,0,0,0.35)"}}/>
        </div>
        {scanHint&&<div style={{position:"absolute",bottom:6,left:0,right:0,textAlign:"center",fontSize:11,color:scanHint.startsWith("✓")?"#34a876":"#ddd8cc",background:"rgba(0,0,0,0.6)",padding:"4px 0"}}>{scanHint}</div>}
      </div>}
      {scanErr&&<div style={{fontSize:11,color:"#e05060",marginBottom:6,padding:"5px 10px",background:"#1a0a0a",borderRadius:6,border:"1px solid #e0506033"}}>{scanErr}</div>}
      <Inp value={f.fedex||""} onChange={e=>sf(p=>({...p,fedex:e.target.value}))} placeholder="Scan above or enter manually"/>
    </F>
    <F mb={16}>
      <FL color="#9090c0">Shipment Photo</FL>
      {f.photo
        ?<div style={{position:"relative",display:"inline-block"}}>
          <img src={f.photo} style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:8,border:"1px solid #2a2a3e",display:"block"}}/>
          <button onClick={()=>sf(p=>({...p,photo:null}))} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:700}}>×</button>
        </div>
        :<label style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#111119",border:"1px dashed #2a2a3e",borderRadius:8}}>
          <span style={{fontSize:20}}>📦</span>
          <div><div style={{color:"#aaa",fontWeight:600,fontSize:12}}>Attach shipment photo</div><div style={{fontSize:10,color:"#555",marginTop:2}}>Label, packing slip, or condition on arrival</div></div>
          <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files[0])addPhoto(e.target.files[0]);}}/>
        </label>}
    </F>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn outline color="#555" onClick={onClose}>Cancel</Btn><Btn color="#a060e0" onClick={()=>{if(!f.setName.trim())return;onSave(f)}}>Save</Btn></div>
  </MW>);
}

export default function App(){
  const [user,setUser]=useState(null);
  if(!user)return<Login onLogin={id=>setUser(id)}/>;
  return<Shell u={user} onLogout={()=>setUser(null)}/>;
}

function Shell({u,onLogout}){
  const me=abt(u);
  const [isMobile,setIsMobile]=useState(()=>window.innerWidth<700);
  React.useEffect(()=>{const fn=()=>setIsMobile(window.innerWidth<700);window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);
  const [tab,setTab]=useState("home");
  const [surgeons,setSurgeons]=useState([
    {id:1,name:"Dr. Shaw",specialty:"Spine",facility:"LDS Hospital",status:"Active",procedurePrefs:{}},
    {id:2,name:"Dr. James Okafor",specialty:"Hip & Knee",facility:"TOSH",status:"Active",procedurePrefs:{}},
    {id:3,name:"Dr. Linda Cheng",specialty:"Spine",facility:"University of Utah",status:"Active",procedurePrefs:{}},
  ]);
  const [cases,setCases]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [newTray,setNewTray]=useState("");
  const [loaners,setLoaners]=useState([]);
  const [weekAnchor,setWeekAnchor]=useState(TODAY);
  const [selCaseId,setSelCaseId]=useState(null);
  const [schedFilter,setSchedFilter]=useState("all");
  const [newImplant,setNewImplant]=useState("");
  const [showCaseModal,setShowCaseModal]=useState(false);
  const [newCaseDate,setNewCaseDate]=useState(null);
  const [showAddSurg,setShowAddSurg]=useState(false);
  const [editSurgId,setEditSurgId]=useState(null);
  const [selSurgId,setSelSurgId]=useState(1);
  const [setsLibOpen,setSetsLibOpen]=useState(false);
  const [importMsg,setImportMsg]=useState("");

  const importExcel=async(file)=>{
    try{
      const XLSX=await import("https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs");
      const buf=await file.arrayBuffer();
      const wb=XLSX.read(buf);
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1});
      const names=rows.flat().map(v=>String(v||"").trim()).filter(v=>v.length>0&&!["set name","name","sets","instrument set","set"].includes(v.toLowerCase()));
      if(!names.length){setImportMsg("No set names found.");return;}
      setAssets(prev=>{
        const existing=new Set(prev.map(a=>a.name));
        const newOnes=names.filter(n=>!existing.has(n));
        const newAssets=newOnes.map(n=>({id:"ast-"+Date.now()+Math.random(),barcodeId:null,name:n,locationId:null,history:[]}));
        setImportMsg("Imported "+names.length+" rows, "+newOnes.length+" new sets added.");
        setTimeout(()=>setImportMsg(""),4000);
        return [...prev,...newAssets];
      });
    }catch(e){setImportMsg("Error reading file — make sure it's a valid .xlsx");}
  };

  const [taskFilter,setTaskFilter]=useState("open");
  const [taskOwner,setTaskOwner]=useState("mine");
  const [showAddTask,setShowAddTask]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [showAddLoaner,setShowAddLoaner]=useState(false);
  const [editLoaner,setEditLoaner]=useState(null);
  const [assets,setAssets]=useState([]);
  // allTrays derived from assets — one source of truth
  const allTrays=[...new Set(assets.map(a=>a.setType||a.name).filter(Boolean))].sort();
  const [showScanMove,setShowScanMove]=useState(false);
  const [showBulkScan,setShowBulkScan]=useState(false);
  const [selectedAsset,setSelectedAsset]=useState(null);
  const [invFilter,setInvFilter]=useState("all");
  const [invSearch,setInvSearch]=useState("");
  const [invTab,setInvTab]=useState("sets");
  const [notifications,setNotifications]=useState([]);
  const [showNotifs,setShowNotifs]=useState(false);
  const [confDelSurg,setConfDelSurg]=useState(null);
  const [confirmDeleteSurgId,setConfirmDeleteSurgId]=useState(null);
  const [selectedSurgs,setSelectedSurgs]=useState(new Set());
  const [selectMode,setSelectMode]=useState(false);
  const toggleSurgSel=id=>setSelectedSurgs(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
  const deleteSelected=()=>{setSurgeons(p=>p.filter(s=>!selectedSurgs.has(s.id)));setSelectedSurgs(new Set());setSelectMode(false);};
  const [templates,setTemplates]=useState([]);
  const [surgView,setSurgView]=useState("surgeon");
  const [selTplId,setSelTplId]=useState(null);
  const [selProcTab,setSelProcTab]=useState("");
  const [prefSection,setPrefSection]=useState("sets");
  const [editPrefKey,setEditPrefKey]=useState(null);
  const [showAddTpl,setShowAddTpl]=useState(false);
  const [editTplId,setEditTplId]=useState(null);
  const [tplPanelOpen,setTplPanelOpen]=useState(false);
  const [addingProfile,setAddingProfile]=useState(false);
  const [newProfileName,setNewProfileName]=useState("");
  const [confirmDeleteProfKey,setConfirmDeleteProfKey]=useState(null);
  const [trayPhotos,setTrayPhotos]=useState({});
  const [prefPhotos,setPrefPhotos]=useState({});
  const [newTrayName,setNewTrayName]=useState("");

  const syncAssetToLibrary=(name)=>{
    if(!name||!name.trim())return;
    setAssets(p=>{
      if(p.find(a=>a.name===name.trim()))return p;
      return [...p,{id:"ast-"+Date.now()+Math.random(),barcodeId:null,name:name.trim(),setType:name.trim(),locationId:null,history:[]}];
    });
  };

  const applyAutoConfirms=(updatedAssets,moves,newAssetsList,currentCases)=>{
    const confirmations=[];
    // Track which assetIds are already queued this batch to avoid double-assigning
    const queuedAssetIds=new Set();
    // Track which caseId+setType combos are already queued this batch
    const queuedSlots=new Set();

    const tryConfirm=(asset)=>{
      if(queuedAssetIds.has(asset.id))return;
      const loc=locById(asset.locationId,FACS);
      if(!loc.facility)return;
      const setType=asset.setType||asset.name;
      const facility=loc.facility;
      // Find earliest unconfirmed case not yet claimed by this batch
      const match=[...currentCases]
        .filter(c=>{
          if(c.facility!==facility)return false;
          if(!c.sets.includes(setType))return false;
          if(c.setChecks?.[setType]?.confirmed)return false;
          if(!(c.date>=TODAY||sameDay(c.date,TODAY)))return false;
          if(queuedSlots.has(c.id+"|"+setType))return false; // already claimed this batch
          if(Object.values(c.setChecks||{}).some(sc=>sc.filledBy===asset.id))return false;
          return true;
        })
        .sort((a,b)=>a.date-b.date)[0];
      if(!match)return;
      const surg=surgeons.find(s=>s.id===match.surgeonId);
      const dateStr=match.date instanceof Date?match.date.toLocaleDateString("en-US",{month:"short",day:"numeric"}):match.date;
      const serial=asset.barcodeId?"("+asset.barcodeId+") ":"";
      const notif={id:Date.now()+Math.random(),message:setType+" "+serial+"scanned into "+facility+" — auto-confirmed for "+(surg?.name||"case")+" on "+dateStr,caseId:match.id,for:match.coverageAssignee,date:new Date(),read:false};
      queuedAssetIds.add(asset.id);
      queuedSlots.add(match.id+"|"+setType);
      confirmations.push({caseId:match.id,setType,assetId:asset.id,serial:asset.barcodeId,notif});
    };

    moves.forEach(({assetId,toLocId})=>{
      const asset=updatedAssets.find(a=>a.id===assetId);
      if(asset)tryConfirm({...asset,locationId:toLocId});
    });
    newAssetsList.forEach(a=>{if(a.locationId)tryConfirm(a);});

    if(confirmations.length===0)return;
    // Update cases
    setCases(prev=>prev.map(c=>{
      const hits=confirmations.filter(d=>d.caseId===c.id);
      if(!hits.length)return c;
      const newChecks={...c.setChecks};
      hits.forEach(h=>{newChecks[h.setType]={...newChecks[h.setType],confirmed:true,filledBy:h.assetId,serial:h.serial};});
      return{...c,setChecks:newChecks};
    }));
    setNotifications(prev=>[...confirmations.map(d=>d.notif),...prev]);
    // Also mark the linked set task as done
    setTasks(prev=>prev.map(t=>{
      const hit=confirmations.find(d=>d.caseId===t.caseId&&t.setName===d.setType);
      return hit?{...t,done:true}:t;
    }));
  };
  const gs=id=>surgeons.find(s=>s.id===id);
  const gt=id=>templates.find(t=>t.id===id);
  const selTpl=templates.find(t=>t.id===selTplId)||null;
  const savePref=(tid,pf)=>{const tpl=templates.find(t=>t.id===tid);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[tid]:{...pf,name:tpl?.name||s.procedurePrefs[tid]?.name||tid}}}:s));setEditPrefKey(null);};
  const saveTpl=f=>{if(templates.find(t=>t.id===f.id))setTemplates(p=>p.map(t=>t.id===f.id?f:t));else setTemplates(p=>[...p,f]);setShowAddTpl(false);setEditTplId(null);};
  const addPrefPhoto=(surgId,tid,file)=>{const reader=new FileReader();reader.onload=e=>{const url=e.target.result;const key=surgId+"-"+tid;setPrefPhotos(p=>({...p,[key]:[...(p[key]||[]),{name:file.name,url}]}));};reader.readAsDataURL(file);};
  const remPrefPhoto=(surgId,tid,i)=>{const key=surgId+"-"+tid;setPrefPhotos(p=>({...p,[key]:(p[key]||[]).filter((_,j)=>j!==i)}));};
  const addTrayPhoto=(tn,file)=>{const reader=new FileReader();reader.onload=e=>setTrayPhotos(p=>({...p,[tn]:e.target.result}));reader.readAsDataURL(file);};
  const selCase=cases.find(c=>c.id===selCaseId)||null;
  const selSurg=surgeons.find(s=>s.id===selSurgId)||null;
  const week=getWeek(weekAnchor);
  const myCases=cases.filter(c=>c.coverageAssignee===u);
  const tomorrowCases=myCases.filter(c=>isTmr(c.date));
  const todayCases=myCases.filter(c=>sameDay(c.date,TODAY));
  const myOpenTasks=tasks.filter(t=>t.assignee===u&&!t.done);
  const myHighTasks=myOpenTasks.filter(t=>t.priority==="high");
  const mySets=cases.flatMap(c=>c.sets.filter(sn=>c.setChecks?.[sn]?.assignee===u&&!c.setChecks[sn].confirmed).map(sn=>({sn,caseId:c.id,surgeon:gs(c.surgeonId)?.name,date:c.date})));
  const schedCases=schedFilter==="mine"?cases.filter(c=>c.coverageAssignee===u):cases;
  const weekCases=schedCases.filter(c=>week.some(d=>sameDay(d,c.date)));
  const upcoming=[...schedCases].filter(c=>c.date>=TODAY||sameDay(c.date,TODAY)).sort((a,b)=>a.date-b.date);
  const filteredTasks=tasks.filter(t=>{const o=taskOwner==="mine"?t.assignee===u:true;const s=taskFilter==="all"||(taskFilter==="open"&&!t.done)||(taskFilter==="done"&&t.done);return o&&s});
  const myOpenCount=tasks.filter(t=>t.assignee===u&&!t.done).length;
  const LSTC={Received:"#34a876",Returned:"#4a9eff",Borrowed:"#e0a020"};
  const LSTS=["Received","Returned","Borrowed"];

  const upCase=(id,fn)=>setCases(p=>p.map(c=>c.id===id?fn(c):c));
  const toggleSet=(cid,sn)=>upCase(cid,c=>({...c,setChecks:{...c.setChecks,[sn]:{...c.setChecks[sn],confirmed:!c.setChecks?.[sn]?.confirmed}}}));
  const togRet=cid=>upCase(cid,c=>({...c,returned:!c.returned}));
  const asgCov=(cid,v)=>upCase(cid,c=>({...c,coverageAssignee:v}));
  const asgSet=(cid,sn,assignee)=>upCase(cid,c=>({...c,setChecks:{...c.setChecks,[sn]:{...c.setChecks[sn],assignee}}}));

  const assignSetAndTask=(cid,sn,assignee)=>{
    asgSet(cid,sn,assignee);
    if(!assignee)return;
    const c=cases.find(x=>x.id===cid);
    if(!c)return;
    const surg=gs(c.surgeonId);
    const dateStr=c.date instanceof Date?c.date.toLocaleDateString("en-US",{month:"short",day:"numeric"}):c.date;
    const title=sn+" — "+( surg?.name||"Case")+" ("+dateStr+")";
    const exists=tasks.find(t=>t.caseId===cid&&t.setName===sn);
    if(!exists){
      setTasks(p=>[...p,{id:Date.now()+Math.random(),title,assignee,priority:"medium",due:"",done:false,caseId:cid,setName:sn,notes:"Confirm set is pulled, packed, and ready for case."}]);
    } else {
      setTasks(p=>p.map(t=>t.caseId===cid&&t.setName===sn?{...t,assignee}:t));
    }
  };

  const assignCoverageAndTask=(cid,assignee)=>{
    asgCov(cid,assignee);
    if(!assignee)return;
    const c=cases.find(x=>x.id===cid);
    if(!c)return;
    const surg=gs(c.surgeonId);
    const dateStr=c.date instanceof Date?c.date.toLocaleDateString("en-US",{month:"short",day:"numeric"}):c.date;
    const title="Coverage — "+(surg?.name||"Case")+" ("+dateStr+")";
    const exists=tasks.find(t=>t.caseId===cid&&t.setName==="__coverage__");
    if(!exists){
      setTasks(p=>[...p,{id:Date.now()+Math.random(),title,assignee,priority:"high",due:"",done:false,caseId:cid,setName:"__coverage__",notes:"Primary coverage for "+c.procedure+" at "+c.facility+"."}]);
    } else {
      setTasks(p=>p.map(t=>t.caseId===cid&&t.setName==="__coverage__"?{...t,assignee}:t));
    }
  };
  const addImp=()=>{if(!newImplant.trim()||!selCase)return;upCase(selCase.id,c=>({...c,implants:[...c.implants,newImplant.trim()]}));setNewImplant("")};
  const remImp=(cid,i)=>upCase(cid,c=>({...c,implants:c.implants.filter((_,j)=>j!==i)}));
  const saveTask=f=>{if(tasks.find(t=>t.id===f.id))setTasks(p=>p.map(t=>t.id===f.id?f:t));else setTasks(p=>[...p,f]);setShowAddTask(false);setEditTask(null)};
  const saveSurg=f=>{if(surgeons.find(s=>s.id===f.id))setSurgeons(p=>p.map(s=>s.id===f.id?f:s));else{setSurgeons(p=>[...p,f]);setSelSurgId(f.id)};setShowAddSurg(false);setEditSurgId(null)};
  const saveLoaner=f=>{
    if(loaners.find(l=>l.id===f.id))setLoaners(p=>p.map(l=>l.id===f.id?f:l));
    else setLoaners(p=>[...p,f]);
    // Auto-create a task for the assignee if one doesn't exist for this loaner
    if(f.assignee){
      const taskTitle="Loaner: "+f.setName+" — "+f.hospital;
      const exists=tasks.find(t=>t.loanerRef===f.id);
      if(!exists){
        const newTask={id:Date.now(),title:taskTitle,assignee:f.assignee,priority:"medium",due:f.returnedDate||"",done:false,notes:"Status: "+f.status,loanerRef:f.id};
        setTasks(p=>[...p,newTask]);
      } else {
        // Update existing linked task — mark done if Returned
        setTasks(p=>p.map(t=>t.loanerRef===f.id?{...t,assignee:f.assignee,title:taskTitle,done:f.status==="Returned"?true:t.done}:t));
      }
    }
    setShowAddLoaner(false);setEditLoaner(null);
  };

  const [confirmDeleteCase,setConfirmDeleteCase]=useState(false);
  const CaseDetail=()=>{
    if(!selCase)return<div style={{color:"#333",display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:12}}>Select a case</div>;
    const s=gs(selCase.surgeonId),st=ST[cSt(selCase)];
    const conf=Object.values(selCase.setChecks||{}).filter(x=>x.confirmed).length;
    return(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontSize:8,color:"#444",letterSpacing:"2px",textTransform:"uppercase",marginBottom:2}}>{selCase.date.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <div style={{fontSize:17,fontWeight:700,color:"#ddd8cc"}}>{s?.name}</div>
          <div style={{fontSize:10,color:"#444",marginTop:2}}>{selCase.facility} — {selCase.procedure}</div>
          <Bdg bg={st.badge} color={st.bt}>{st.l}</Bdg>
        </div>
        <div>
          {confirmDeleteCase
            ?<div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:"#e05060"}}>Delete case?</span>
              <Btn small color="#e05060" onClick={()=>{setCases(p=>p.filter(c=>c.id!==selCase.id));setSelCaseId(null);setConfirmDeleteCase(false);}}>Yes</Btn>
              <Btn small outline color="#555" onClick={()=>setConfirmDeleteCase(false)}>No</Btn>
            </div>
            :<button onClick={()=>setConfirmDeleteCase(true)} style={{background:"none",border:"1px solid #2a2a3e",borderRadius:6,color:"#444",cursor:"pointer",fontSize:11,padding:"4px 10px",fontFamily:"inherit"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#e05060";e.currentTarget.style.color="#e05060"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2a3e";e.currentTarget.style.color="#444"}}>Delete Case</button>}
        </div>
      </div>
      <Card style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Lbl>Coverage</Lbl><AcPick value={selCase.coverageAssignee} onChange={v=>assignCoverageAndTask(selCase.id,v)}/></div></Card>
      <Card style={{marginBottom:10}}>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:160}}>
            <Lbl>Patient Name</Lbl>
            <input value={selCase.patientName||""} onChange={e=>upCase(selCase.id,c=>({...c,patientName:e.target.value}))} placeholder="Enter patient name..." style={{width:"100%",padding:"6px 10px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:14,flexShrink:0}}>
            <div onClick={()=>upCase(selCase.id,c=>({...c,ctUploaded:!c.ctUploaded}))} style={{width:17,height:17,borderRadius:4,border:"2px solid "+(selCase.ctUploaded?"#4a9eff":"#2a2a3e"),background:selCase.ctUploaded?"#4a9eff":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",cursor:"pointer",flexShrink:0}}>{selCase.ctUploaded?"✓":""}</div>
            <span style={{fontSize:12,color:selCase.ctUploaded?"#4a9eff":"#555",fontWeight:selCase.ctUploaded?700:400}}>CT Uploaded</span>
          </div>
        </div>
      </Card>
      <Card style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><Lbl>Sets Confirmed</Lbl><span style={{fontSize:10,color:conf===selCase.sets.length&&selCase.sets.length>0?"#34a876":"#555"}}>{conf}/{selCase.sets.length}</span></div>
        {selCase.sets.length===0&&<div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>No sets on this case.</div>}
        {selCase.sets.map((sn,i)=>{const sc=selCase.setChecks?.[sn]||{};return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<selCase.sets.length-1?"1px solid #161620":"none"}}>
            <div onClick={()=>toggleSet(selCase.id,sn)} style={{width:17,height:17,borderRadius:4,border:"2px solid "+(sc.confirmed?"#34a876":"#2a2a3e"),background:sc.confirmed?"#34a876":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",cursor:"pointer",flexShrink:0}}>{sc.confirmed?"✓":""}</div>
            <span style={{flex:1,fontSize:11,color:sc.confirmed?"#7fe0aa":"#aaa",textDecoration:sc.confirmed?"line-through":"none"}}>{sn}{sc.serial&&<span style={{fontSize:9,color:"#34a876",marginLeft:6,fontFamily:"monospace"}}>#{sc.serial}</span>}</span>
            <AcPick value={sc.assignee||null} onChange={v=>assignSetAndTask(selCase.id,sn,v)} nullable/>
          </div>
        )})}
        {selCase.sets.length>0&&<div style={{fontSize:9,color:"#333",marginTop:8,letterSpacing:"0.5px"}}>Assigning a team member creates a task for that set automatically</div>}
      </Card>
      <Card style={{marginBottom:10}}>
        <Lbl>Implants — Restocking</Lbl>
        {selCase.implants.map((imp,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{width:5,height:5,borderRadius:"50%",background:"#e0a020",flexShrink:0}}/><span style={{flex:1,fontSize:11,color:"#ddd8cc"}}>{imp}</span><button onClick={()=>remImp(selCase.id,i)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:14}}>✕</button></div>)}
        <div style={{display:"flex",gap:6,marginTop:8}}><Inp value={newImplant} onChange={e=>setNewImplant(e.target.value)} placeholder="e.g. 54mm Cup..." style={{fontSize:11}}/><Btn onClick={addImp} color="#e0a020" text="#0d0d14" small>Log</Btn></div>
      </Card>
      <Card style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
          <div onClick={()=>togRet(selCase.id)} style={{width:17,height:17,borderRadius:4,border:"2px solid "+(selCase.returned?"#34a876":"#2a2a3e"),background:selCase.returned?"#34a876":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",cursor:"pointer",flexShrink:0}}>{selCase.returned?"✓":""}</div>
          <span style={{flex:1,fontSize:12,color:selCase.returned?"#7fe0aa":"#aaa"}}>Sets returned and checked in</span>
          <AcPick value={selCase.checklistAssignees?.setsReturned||null} onChange={v=>upCase(selCase.id,c=>({...c,checklistAssignees:{...c.checklistAssignees,setsReturned:v}}))} nullable/>
        </div>
      </Card>
      <Card style={{marginBottom:10}}>
        <Lbl>Case Notes</Lbl>
        <textarea value={selCase.caseNotes||""} onChange={e=>upCase(selCase.id,c=>({...c,caseNotes:e.target.value}))} placeholder="Add notes for the team — check-in updates, special instructions, questions..." rows={3} style={{width:"100%",padding:"8px 10px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/>
        {selCase.caseNotes&&<div style={{fontSize:9,color:"#444",marginTop:6,textAlign:"right",letterSpacing:"0.5px"}}>Tap to edit · visible to all reps</div>}
      </Card>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <Lbl>Check-In Photos</Lbl>
          <label style={{cursor:"pointer"}}>
            <span style={{fontSize:10,color:"#4a9eff",border:"1px solid #4a9eff44",borderRadius:6,padding:"3px 10px",fontWeight:700}}>+ Add</span>
            <input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={e=>{
              Array.from(e.target.files).forEach(file=>{
                const reader=new FileReader();
                reader.onload=ev=>upCase(selCase.id,c=>({...c,checkInPhotos:[...(c.checkInPhotos||[]),{name:file.name,url:ev.target.result}]}));
                reader.readAsDataURL(file);
              });
              e.target.value="";
            }}/>
          </label>
        </div>
        {(selCase.checkInPhotos||[]).length===0
          ?<div style={{fontSize:11,color:"#333",textAlign:"center",padding:"12px 0",borderRadius:7,border:"1px dashed #1e1e2e"}}>No photos yet — tap Add to shoot or attach</div>
          :<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {(selCase.checkInPhotos||[]).map((p,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={p.url} style={{width:78,height:78,objectFit:"cover",borderRadius:7,border:"1px solid #2a2a3e",display:"block"}}/>
                <button onClick={()=>upCase(selCase.id,c=>({...c,checkInPhotos:c.checkInPhotos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-5,right:-5,width:17,height:17,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
                {p.name&&<div style={{fontSize:8,color:"#444",marginTop:2,textAlign:"center",maxWidth:78,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>}
              </div>
            ))}
          </div>}
      </Card>
    </div>);
  };

  const S={fontFamily:"'Palatino Linotype',serif",background:"#0d0d14",minHeight:"100dvh",color:"#ddd8cc",display:"flex",flexDirection:"column"};
  return(
    <div style={S}>
      {/* Header */}
      <div style={{background:"#0d0d14",borderBottom:"1px solid #1e1e2e",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:48,flexShrink:0}}>
        <span onClick={()=>setTab("home")} style={{fontSize:11,color:"#34a876",letterSpacing:"3px",textTransform:"uppercase",fontWeight:700,cursor:"pointer"}}>Territory Ops</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {tab==="schedule"&&<Btn small color="#4a9eff" onClick={()=>setShowCaseModal(true)}>+ Case</Btn>}
          {tab==="tasks"&&<Btn small color="#e0a020" text="#0d0d14" onClick={()=>setShowAddTask(true)}>+ Task</Btn>}
          {tab==="loaners"&&<Btn small color="#a060e0" onClick={()=>setShowAddLoaner(true)}>+ Loaner</Btn>}
          {tab==="inventory"&&<><Btn small color="#34a876" onClick={()=>setShowScanMove(true)}>⬡ Scan</Btn><Btn small color="#e0a020" text="#0d0d14" onClick={()=>setShowBulkScan(true)} style={{marginLeft:6}}>⬡⬡ Bulk</Btn></>}
          {/* Notification bell */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowNotifs(x=>!x)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"4px 6px",color:notifications.filter(n=>!n.read&&n.for===u).length>0?"#34a876":"#444",fontSize:18,lineHeight:1}}>🔔</button>
            {notifications.filter(n=>!n.read&&n.for===u).length>0&&<div style={{position:"absolute",top:0,right:0,width:16,height:16,borderRadius:"50%",background:"#e05060",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{notifications.filter(n=>!n.read&&n.for===u).length}</div>}
            {showNotifs&&<div style={{position:"absolute",right:0,top:36,width:300,background:"#13131e",border:"1px solid #2a2a3e",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.7)",zIndex:300,maxHeight:400,overflowY:"auto"}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #1e1e2e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:"#ddd8cc",fontWeight:700}}>Notifications</span>
                {notifications.filter(n=>n.for===u).length>0&&<button onClick={()=>setNotifications(p=>p.map(n=>n.for===u?{...n,read:true}:n))} style={{fontSize:10,color:"#555",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Mark all read</button>}
              </div>
              {notifications.filter(n=>n.for===u).length===0&&<div style={{padding:"20px",textAlign:"center",fontSize:12,color:"#444"}}>No notifications</div>}
              {notifications.filter(n=>n.for===u).map((n,i)=>(
                <div key={n.id} onClick={()=>{setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x));if(n.caseId){setSelCaseId(n.caseId);setTab("schedule");}setShowNotifs(false);}} style={{padding:"10px 14px",borderBottom:"1px solid #161620",cursor:"pointer",background:n.read?"transparent":"#0d1a0d",display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:n.read?"#333":"#34a876",flexShrink:0,marginTop:4}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:n.read?"#555":"#ddd8cc",lineHeight:1.5}}>{n.message}</div>
                    <div style={{fontSize:9,color:"#444",marginTop:3}}>{n.date instanceof Date?n.date.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}):""}</div>
                  </div>
                </div>
              ))}
            </div>}
          </div>
          <Dot id={u} size={30}/>
        </div>
      </div>
      {/* Top Nav */}
      <div style={{background:"#0d0d14",borderBottom:"1px solid #1e1e2e",display:"flex",flexShrink:0,overflowX:"auto"}}>
        {[["schedule","📅","Schedule"],["surgeons","👤","Surgeons"],["tasks","✓","Tasks"],["loaners","🔄","Loaners"],["inventory","📦","Inventory"]].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:isMobile?"8px 4px":"12px 8px",background:"transparent",border:"none",borderBottom:"3px solid "+(tab===id?"#4a9eff":"transparent"),color:tab===id?"#ddd8cc":"#555",fontSize:isMobile?10:13,fontWeight:tab===id?700:500,cursor:"pointer",fontFamily:"inherit",transition:"color 0.15s",minWidth:isMobile?56:undefined,display:"flex",flexDirection:isMobile?"column":"row",alignItems:"center",justifyContent:"center",gap:isMobile?2:0}}>
            {isMobile&&<span style={{fontSize:14}}>{icon}</span>}
            <span>{label}{id==="tasks"&&myOpenCount>0&&<span style={{marginLeft:4,background:"#e05060",color:"#fff",fontSize:9,borderRadius:20,padding:"1px 5px",fontWeight:700,verticalAlign:"middle"}}>{myOpenCount}</span>}</span>
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:16}}>

        {/* HOME */}
        {tab==="home"&&<div style={{padding:"16px 16px 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
            <div>
              <div style={{fontSize:10,color:"#444",letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>{TODAY.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
              <div style={{fontSize:22,fontWeight:700,color:"#ddd8cc"}}>Good morning, {me.name.split(" ")[0]}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Dot id={u} size={44}/>
              <button onClick={onLogout} style={{fontSize:9,color:"#333",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1px"}}>SIGN OUT</button>
            </div>
          </div>
          <SH color="#34a876" label="Tomorrow's Cases — Prep Now" count={tomorrowCases.length}/>
          {tomorrowCases.length===0
            ?<Card style={{marginBottom:18}}><div style={{color:"#333",fontSize:12,textAlign:"center",padding:"8px 0"}}>No cases assigned tomorrow</div></Card>
            :tomorrowCases.map(c=>{const s=gs(c.surgeonId),st=ST[cSt(c)];return(
              <div key={c.id} onClick={()=>{setSelCaseId(c.id);setTab("schedule")}} style={{background:"#111119",border:"1px solid "+st.bar+"55",borderLeft:"3px solid "+st.bar,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontSize:14,fontWeight:700,color:"#ddd8cc"}}>{s?.name}</div><div style={{fontSize:11,color:SC[s?.specialty]||"#888",marginTop:2}}>{c.facility}</div></div>
                  <Bdg bg={st.badge} color={st.bt}>{st.l}</Bdg>
                </div>
                {c.sets.map((sn,i)=>{const sc=c.setChecks?.[sn]||{};return(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 0",borderTop:"1px solid #161620"}}><div onClick={e=>{e.stopPropagation();toggleSet(c.id,sn)}} style={{width:16,height:16,borderRadius:4,border:"2px solid "+(sc.confirmed?"#34a876":"#2a2a3e"),background:sc.confirmed?"#34a876":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",cursor:"pointer",flexShrink:0}}>{sc.confirmed?"✓":""}</div><span style={{fontSize:11,color:sc.confirmed?"#7fe0aa":"#aaa",textDecoration:sc.confirmed?"line-through":"none"}}>{sn}</span></div>)})}
              </div>
            )})}
          {todayCases.length>0&&<>
            <SH color="#9090c0" label="Today's Cases" count={todayCases.length}/>
            {todayCases.map(c=>{const s=gs(c.surgeonId),st=ST[cSt(c)];return(<div key={c.id} onClick={()=>{setSelCaseId(c.id);setTab("schedule")}} style={{background:"#111119",border:"1px solid #1e1e2e",borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:"#ddd8cc"}}>{s?.name}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{c.facility}</div></div><Bdg bg={st.badge} color={st.bt}>{st.l}</Bdg></div></div>)})}
          </>}
          {mySets.length>0&&<>
            <SH color="#e0a020" label="Sets Needing Confirmation" count={mySets.length}/>
            <Card accent="#e0a02033" style={{marginBottom:18}}>{mySets.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:i<mySets.length-1?"1px solid #161620":"none"}}><div style={{width:7,height:7,borderRadius:"50%",background:"#e0a020",flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:12,color:"#ddd8cc"}}>{item.sn}</div><div style={{fontSize:10,color:"#555"}}>{item.surgeon} — {fmtD(item.date)}</div></div><button onClick={()=>toggleSet(item.caseId,item.sn)} style={{fontSize:10,color:"#34a876",background:"#1a3d2b",border:"1px solid #34a87655",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Confirm</button></div>)}</Card>
          </>}
          {myHighTasks.length>0&&<>
            <SH color="#e05060" label="High Priority Tasks" count={myHighTasks.length}/>
            {myHighTasks.map(task=><div key={task.id} style={{background:"#111119",border:"1px solid #3d1520",borderLeft:"3px solid #e05060",borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{fontSize:13,color:"#ddd8cc",fontWeight:600}}>{task.title}</div>{task.due&&task.due.length===10&&<div style={{fontSize:10,color:"#e05060",marginTop:4}}>Due {new Date(task.due+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>}</div>)}
          </>}
          {tomorrowCases.length===0&&mySets.length===0&&myHighTasks.length===0&&todayCases.length===0&&<Card><div style={{color:"#444",fontSize:13,textAlign:"center",padding:"20px 0"}}>You're all caught up!</div></Card>}
        </div>}

        {/* SCHEDULE */}
        {tab==="schedule"&&<div>
          {/* Mobile: if a case is selected, show full-screen detail */}
          {isMobile&&selCaseId
            ?<div style={{padding:12}}>
               <button onClick={()=>setSelCaseId(null)} style={{background:"none",border:"none",color:"#4a9eff",cursor:"pointer",fontSize:13,fontFamily:"inherit",marginBottom:12,padding:0,display:"flex",alignItems:"center",gap:4}}>← Back to schedule</button>
               {CaseDetail()}
             </div>
            :<>
          <div style={{padding:"10px 16px 0",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>{const d=new Date(weekAnchor);d.setDate(d.getDate()-7);setWeekAnchor(d)}} style={{background:"#1e1e2e",border:"1px solid #2a2a3e",color:"#aaa",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:13}}>‹</button>
            <span style={{fontSize:12,color:"#9090c0",fontWeight:600}}>{MONTHS[week[0].getMonth()]} {week[0].getDate()}–{week[6].getDate()}</span>
            <button onClick={()=>{const d=new Date(weekAnchor);d.setDate(d.getDate()+7);setWeekAnchor(d)}} style={{background:"#1e1e2e",border:"1px solid #2a2a3e",color:"#aaa",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:13}}>›</button>
            <button onClick={()=>setWeekAnchor(TODAY)} style={{background:"transparent",border:"1px solid #2a2a3e",color:"#555",borderRadius:6,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit",fontSize:10}}>TODAY</button>
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              {[["mine","Mine"],["all","All"]].map(([v,l])=><button key={v} onClick={()=>setSchedFilter(v)} style={{padding:"3px 10px",borderRadius:20,border:"1px solid",borderColor:schedFilter===v?"#4a9eff":"#2a2a3e",background:schedFilter===v?"#0d2040":"transparent",color:schedFilter===v?"#4a9eff":"#555",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:schedFilter===v?700:400}}>{l}</button>)}
            </div>
          </div>
          <div style={{padding:"8px 16px",display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:isMobile?2:4}}>
            {week.map((d,i)=>{const dc=weekCases.filter(c=>sameDay(c.date,d)),isT=sameDay(d,TODAY);return(
              <div key={i} onClick={()=>{if(dc.length>0)setSelCaseId(dc[0].id);else{setNewCaseDate(d);setShowCaseModal(true);}}} style={{background:isT?"#141428":"#111119",border:"1px solid "+(isT?"#3a3a6e":"#1e1e2e"),borderRadius:8,padding:isMobile?"4px 3px":"6px 5px",minHeight:isMobile?48:58,cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=isT?"#4a4a8e":"#2a2a4e"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=isT?"#3a3a6e":"#1e1e2e"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:isMobile?7:8,color:isT?"#9090c0":"#333",letterSpacing:"0.5px",textTransform:"uppercase"}}>{DAYS[i]}</span><span style={{fontSize:isMobile?10:11,color:isT?"#ddd8cc":"#555",fontWeight:isT?700:400}}>{d.getDate()}</span></div>
                {dc.map(c=>{const st=ST[cSt(c)],s=gs(c.surgeonId),isSel=selCaseId===c.id;return(<div key={c.id} onClick={()=>setSelCaseId(c.id)} style={{background:isSel?"#1a1a32":"#0d0d18",border:"1px solid "+(isSel?st.bar:"#1e1e2e"),borderRadius:4,padding:"2px 3px",marginBottom:2,cursor:"pointer"}}><span style={{fontSize:isMobile?7:8,color:"#bbb",display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s?.name.replace("Dr. ","")}</span>{!isMobile&&c.time&&<span style={{fontSize:7,color:"#888",display:"block"}}>{c.time}</span>}<div style={{background:"#0a0a12",borderRadius:2,height:2,marginTop:1}}><div style={{height:"100%",width:cPct(c)+"%",background:st.bar}}/></div></div>)})}
              </div>
            )})}
          </div>
          {/* Mobile: upcoming list stacked below calendar */}
          {isMobile
            ?<div style={{padding:"0 12px 80px"}}>
               <div style={{fontSize:8,letterSpacing:"2px",color:"#444",textTransform:"uppercase",marginBottom:8,paddingTop:4}}>Upcoming</div>
               {upcoming.length===0&&<div style={{fontSize:12,color:"#333",fontStyle:"italic"}}>No upcoming cases</div>}
               {upcoming.map(c=>{const s=gs(c.surgeonId),st=ST[cSt(c)];return(
                 <div key={c.id} onClick={()=>setSelCaseId(c.id)} style={{padding:"10px 12px",borderBottom:"1px solid #161620",cursor:"pointer",background:"#111119",borderRadius:8,marginBottom:6,borderLeft:"3px solid "+st.bar}}>
                   <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                     <span style={{fontSize:13,fontWeight:600,color:"#ddd8cc"}}>{s?.name}</span>
                     <Bdg bg={st.badge} color={st.bt} sm>{st.l}</Bdg>
                   </div>
                   <div style={{fontSize:11,color:"#9090c0",marginTop:2}}>{fmtD(c.date)}{c.time&&" · "+c.time}</div>
                   <div style={{fontSize:10,color:"#555",marginTop:1}}>{c.facility} — {c.procedure}</div>
                   {c.ctUploaded&&<span style={{fontSize:9,color:"#4a9eff",fontWeight:700}}>✓ CT</span>}
                 </div>
               )})}
             </div>
            :<div style={{padding:"0 16px 16px",display:"flex",gap:0,height:340}}>
               <div style={{width:160,background:"#111119",border:"1px solid #1e1e2e",borderRadius:"11px 0 0 11px",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
                 <div style={{padding:"7px 10px",borderBottom:"1px solid #1e1e2e",fontSize:8,letterSpacing:"2px",color:"#444",textTransform:"uppercase"}}>Upcoming</div>
                 <div style={{overflowY:"auto",flex:1}}>
                   {upcoming.map(c=>{const s=gs(c.surgeonId),st=ST[cSt(c)],isSel=selCaseId===c.id;return(
                     <div key={c.id} onClick={()=>setSelCaseId(c.id)} style={{padding:"8px 10px",borderBottom:"1px solid #161620",cursor:"pointer",background:isSel?"#1a1a30":"transparent",borderLeft:"3px solid "+(isSel?st.bar:"transparent")}}>
                       <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><span style={{fontSize:11,fontWeight:600,color:"#ddd8cc"}}>{s?.name.replace("Dr. ","Dr.")}</span><Bdg bg={st.badge} color={st.bt} sm>{st.l}</Bdg></div>
                       <div style={{fontSize:9,color:"#9090c0",marginTop:1}}>{fmtD(c.date)}</div>
                       {c.ctUploaded&&<div style={{display:"inline-flex",alignItems:"center",gap:3,marginTop:3,padding:"1px 6px",background:"#0d1e33",border:"1px solid #4a9eff44",borderRadius:4}}><span style={{fontSize:8,color:"#4a9eff",fontWeight:700}}>✓ CT</span></div>}
                       <div style={{background:"#0a0a12",borderRadius:3,height:2,marginTop:5}}><div style={{height:"100%",width:cPct(c)+"%",background:st.bar,borderRadius:3}}/></div>
                     </div>
                   )})}
                 </div>
               </div>
               <div style={{flex:1,background:"#13131e",border:"1px solid #1e1e2e",borderLeft:"none",borderRadius:"0 11px 11px 0",padding:"14px",overflowY:"auto"}}>{CaseDetail()}</div>
             </div>}
          </>}
        </div>}


        {/* SURGEONS */}
        {tab==="surgeons"&&(()=>{
          const sc=SPEC_COLOR[selSurg?.specialty]||"#888";
          const procIds=selSurg?Object.keys(selSurg.procedurePrefs):[];
          const activePref=selSurg?.procedurePrefs[selProcTab];
          const activeTpl=gt(selProcTab);
          // MOBILE: show surgeon list
          if(isMobile&&!selSurgId){
            return(<div style={{height:"calc(100dvh - 112px)",overflowY:"auto",paddingBottom:80}}>
              <div style={{padding:"8px 14px",borderBottom:"1px solid #1e1e2e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:8,letterSpacing:"2px",color:"#444",textTransform:"uppercase"}}>Surgeons</span>
                <Btn small color="#34a876" onClick={()=>setShowAddSurg(true)} style={{padding:"2px 7px",fontSize:9}}>+ Add</Btn>
              </div>
              {surgeons.map(s=>{const sc2=SPEC_COLOR[s.specialty]||"#888";return(
                <div key={s.id} onClick={()=>{setSelSurgId(s.id);setSurgView("surgeon");const tids=Object.keys(s.procedurePrefs);if(tids.length){setSelProcTab(tids[0]);setPrefSection("sets");}}} style={{padding:"12px 14px",borderBottom:"1px solid #161620",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:sc2+"33",border:"2px solid "+sc2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:sc2,fontWeight:700,flexShrink:0}}>{s.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#ddd8cc"}}>{s.name}</div>
                    <div style={{fontSize:11,color:sc2,fontStyle:"italic"}}>{s.specialty}</div>
                    <div style={{fontSize:10,color:"#333"}}>{Object.keys(s.procedurePrefs).length} profiles · {s.facility}</div>
                  </div>
                  <span style={{color:"#333",fontSize:18}}>›</span>
                </div>
              )})}
            </div>);
          }
          // MOBILE: show surgeon detail
          if(isMobile&&selSurgId){
            return(<div style={{height:"calc(100dvh - 112px)",overflowY:"auto"}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #1e1e2e"}}>
                <button onClick={()=>setSelSurgId(null)} style={{background:"none",border:"none",color:"#4a9eff",cursor:"pointer",fontSize:13,fontFamily:"inherit",padding:0}}>← Surgeons</button>
              </div>
              <div style={{padding:"14px 14px 80px"}}>
                {surgView==="template"?(()=>{
                  if(!selTpl)return<div style={{color:"#333"}}>Select a template</div>;
                  const sc2=SPEC_COLOR[selTpl.specialty]||"#888";
                  const using=surgeons.filter(s=>Object.keys(s.procedurePrefs).includes(selTpl.id));
                  return(<div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
                      <div><div style={{fontSize:9,color:"#555",letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>Template — {selTpl.specialty}</div><div style={{fontSize:20,fontWeight:700,color:"#ddd8cc"}}>{selTpl.name}</div><div style={{fontSize:11,color:"#444",marginTop:3}}>{using.length} surgeon{using.length!==1?"s":""} with custom profiles</div></div>
                      <div style={{display:"flex",gap:8}}><Btn small outline color="#a060e0" onClick={()=>setEditTplId(selTpl.id)}>Edit</Btn><Btn small outline color="#555" onClick={()=>setSurgView("surgeon")}>Back</Btn></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                      <Card><Lbl>Default Sets</Lbl>{selTpl.trays.length===0?<div style={{color:"#333",fontSize:11}}>No sets defined</div>:selTpl.trays.map((t,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:i<selTpl.trays.length-1?"1px solid #161620":"none"}}><div style={{width:6,height:6,borderRadius:"50%",background:sc2,flexShrink:0}}/><span style={{fontSize:12,color:"#ddd8cc"}}>{t}</span></div>))}</Card>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {selTpl.positioning&&<Card><Lbl>Positioning</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{selTpl.positioning}</div></Card>}
                        {selTpl.roomSetup&&<Card><Lbl>Room Setup</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{selTpl.roomSetup}</div></Card>}
                      </div>
                      {selTpl.notes&&<Card accent={sc2+"33"} style={{gridColumn:"1/-1"}}><Lbl>Notes</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{selTpl.notes}</div></Card>}
                    </div>
                    {using.length>0&&<Card><Lbl>Surgeons with Custom Profiles</Lbl>{using.map(s=>(<div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #161620"}}><div><div style={{fontSize:12,color:"#ddd8cc"}}>{s.name}</div><div style={{fontSize:10,color:"#444"}}>{s.facility}</div></div><Btn small outline color="#4a9eff" onClick={()=>{setSelSurgId(s.id);setSelProcTab(selTpl.id);setSurgView("surgeon");setPrefSection("sets");}}>View</Btn></div>))}</Card>}
                  </div>);
                })():(()=>{
                  if(!selSurg)return<div style={{color:"#333",display:"flex",alignItems:"center",justifyContent:"center",height:"60%"}}>Select a surgeon</div>;
                  return(<div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                      <div><div style={{fontSize:10,color:sc,letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>{selSurg.specialty} — {selSurg.status}</div><div style={{fontSize:20,fontWeight:700,color:"#ddd8cc"}}>{selSurg.name}</div><div style={{fontSize:12,color:"#444",marginTop:2}}>{selSurg.facility}</div></div>
                      <Btn small outline color="#ddd8cc" onClick={()=>setEditSurgId(selSurg.id)}>Edit</Btn>
                    </div>
                    <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                      {procIds.map(tid=>{const tpl=gt(tid),isPending=confirmDeleteProfKey===tid;return(
                        <div key={tid} style={{display:"flex",alignItems:"center",borderRadius:20,border:"1px solid "+(isPending?"#e05060":selProcTab===tid?sc:"#2a2a3e"),background:isPending?"#3d1520":selProcTab===tid?sc+"22":"transparent",overflow:"hidden"}}>
                          <button onClick={()=>{setSelProcTab(tid);setPrefSection("sets");setConfirmDeleteProfKey(null);}} style={{padding:"5px 10px",background:"transparent",border:"none",color:isPending?"#e05060":selProcTab===tid?sc:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:selProcTab===tid?700:400}}>{tpl?.name||tid}</button>
                          {isPending
                            ?<><button onClick={()=>{setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:Object.fromEntries(Object.entries(s.procedurePrefs).filter(([k])=>k!==tid))}:s));const remaining=procIds.filter(k=>k!==tid);setSelProcTab(remaining[0]||"");setConfirmDeleteProfKey(null);}} style={{padding:"3px 8px",background:"#e05060",border:"none",color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Del</button><button onClick={()=>setConfirmDeleteProfKey(null)} style={{padding:"3px 8px",background:"transparent",border:"none",color:"#888",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button></>
                            :<button onClick={e=>{e.stopPropagation();setConfirmDeleteProfKey(tid);}} style={{padding:"3px 8px 3px 0",background:"transparent",border:"none",color:"#2a2a3e",fontSize:14,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#e05060"} onMouseLeave={e=>e.currentTarget.style.color="#2a2a3e"}>×</button>
                          }
                        </div>
                      );})}
                      {addingProfile?(
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <input autoFocus value={newProfileName} onChange={e=>setNewProfileName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newProfileName.trim()){const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}if(e.key==="Escape"){setAddingProfile(false);setNewProfileName("");}}} placeholder="Profile name..." style={{padding:"4px 9px",background:"#0d0d14",border:"1px solid #4a9eff",borderRadius:20,color:"#ddd8cc",fontFamily:"inherit",fontSize:11,outline:"none",width:130}}/>
                          <button onClick={()=>{if(!newProfileName.trim())return;const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}} style={{padding:"4px 10px",background:"#4a9eff",border:"none",borderRadius:20,color:"#0d0d14",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add</button>
                          <button onClick={()=>{setAddingProfile(false);setNewProfileName("");}} style={{padding:"4px 8px",background:"transparent",border:"1px solid #2a2a3e",borderRadius:20,color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                        </div>
                      ):(
                        <button onClick={()=>{setAddingProfile(true);setNewProfileName("");}} style={{padding:"5px 12px",borderRadius:20,border:"1px dashed #4a9eff",background:"transparent",color:"#4a9eff",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>+ Add Profile</button>
                      )}
                    </div>
                    {activePref&&activeTpl&&(
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div style={{display:"flex",gap:4}}>{[["sets","Sets"],["notes","Notes"],["hospital","Hospital"],["images","Images"]].map(([k,l])=>(<button key={k} onClick={()=>setPrefSection(k)} style={{padding:"5px 12px",borderRadius:7,border:"1px solid "+(prefSection===k?"#ddd8cc44":"#2a2a3e"),background:prefSection===k?"#1e1e2e":"transparent",color:prefSection===k?"#ddd8cc":"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:prefSection===k?700:400}}>{l}</button>))}</div>
                          <Btn small color={sc} text="#0d0d14" onClick={()=>setEditPrefKey(selProcTab)}>Edit</Btn>
                        </div>
                        {prefSection==="sets"&&<Card><Lbl>Instrument Sets</Lbl>{activePref.trays.length===0?<div style={{color:"#333",fontSize:11}}>No sets. Click Edit to add.</div>:activePref.trays.map((t,i)=>{const hp=!!trayPhotos[t];return(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 0",borderBottom:i<activePref.trays.length-1?"1px solid #161620":"none"}}><div style={{width:6,height:6,borderRadius:"50%",background:sc,flexShrink:0}}/><span style={{fontSize:12,color:"#ddd8cc",flex:1}}>{t}</span>{hp?<img src={trayPhotos[t]} style={{width:30,height:30,borderRadius:5,objectFit:"cover",border:"1px solid #2a2a3e"}}/>:<label style={{cursor:"pointer"}}><span style={{fontSize:10,color:"#333",border:"1px dashed #2a2a3e",borderRadius:5,padding:"2px 6px"}}>+photo</span><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&addTrayPhoto(t,e.target.files[0])}/></label>}</div>);})}</Card>}
                        {prefSection==="notes"&&(()=>{
                          const NF=[["Hospital Sets","hospitalSets","#34a876"],["Room Set-up","roomSetup",null],["Positioning","positioning",null],["Exposure","exposure",null],["Hardware Workflow","hardwareWorkflow","#e0a020"],["Other Key Information","otherInfo","#a060e0"]];
                          const hasTech=activePref.robot||activePref.stealth||activePref.fluoro;
                          const hasAny=hasTech||NF.some(([,k])=>activePref[k]);
                          return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
                            {hasTech&&<Card><Lbl>Technology</Lbl><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{activePref.robot&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#4a9eff18",border:"1px solid #4a9eff",borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:"#4a9eff"}}/><span style={{fontSize:12,color:"#4a9eff",fontWeight:700}}>Robot</span></div>}{activePref.stealth&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#e0506018",border:"1px solid #e05060",borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:"#e05060"}}/><span style={{fontSize:12,color:"#e05060",fontWeight:700}}>Stealth</span></div>}{activePref.fluoro&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#88888818",border:"1px solid #888",borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:"#888"}}/><span style={{fontSize:12,color:"#888",fontWeight:700}}>Fluoro</span></div>}</div></Card>}
                            {NF.map(([label,k,color])=>activePref[k]?<Card key={k}><Lbl color={color||"#444"}>{label}</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{activePref[k]}</div></Card>:null)}
                            {!hasAny&&<div style={{color:"#333",fontSize:11}}>No notes yet. Click Edit to add.</div>}
                          </div>);
                        })()}
                        {prefSection==="hospital"&&<Card accent="#4a9eff33"><Lbl color="#4a9eff">Hospital and Set Logistics</Lbl>{activePref.hospitalSets?<div style={{fontSize:13,color:"#aaa",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{activePref.hospitalSets}</div>:<div style={{color:"#333",fontSize:12}}>No hospital notes yet. Click Edit to add.</div>}</Card>}
                        {prefSection==="images"&&(()=>{const key=selSurgId+"-"+selProcTab;const photos=prefPhotos[key]||[];return(<Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><Lbl>Procedure Reference Photos</Lbl><label style={{cursor:"pointer"}}><span style={{fontSize:11,color:"#a060e0",border:"1px solid #3a1a6a",borderRadius:6,padding:"4px 12px",fontWeight:700}}>+ Add</span><input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(f=>addPrefPhoto(selSurgId,selProcTab,f));e.target.value="";}}/>
                        </label></div>{photos.length===0?<div style={{color:"#333",fontSize:12,textAlign:"center",padding:"20px 0"}}>No images yet — add positioning guides, OR diagrams, or reference photos.</div>:<div style={{display:"flex",flexWrap:"wrap",gap:10}}>{photos.map((p,i)=>(<div key={i} style={{position:"relative"}}><img src={p.url} style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:"1px solid #2a2a3e",display:"block"}}/><button onClick={()=>remPrefPhoto(selSurgId,selProcTab,i)} style={{position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>{p.name&&<div style={{fontSize:8,color:"#444",marginTop:3,textAlign:"center",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>}</div>))}</div>}</Card>);})()}
                      </div>
                    )}
                    {procIds.length===0&&(
                      <Card style={{textAlign:"center",padding:28}}>
                        <div style={{color:"#444",fontSize:13,marginBottom:16}}>No procedure profiles yet for {selSurg.name}</div>
                        {addingProfile?(
                          <div style={{display:"flex",gap:6,justifyContent:"center",alignItems:"center"}}>
                            <input autoFocus value={newProfileName} onChange={e=>setNewProfileName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newProfileName.trim()){const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}if(e.key==="Escape"){setAddingProfile(false);setNewProfileName("");}}} placeholder="e.g. MIS TLIF, ACDF..." style={{padding:"7px 12px",background:"#0d0d14",border:"1px solid #4a9eff",borderRadius:8,color:"#ddd8cc",fontFamily:"inherit",fontSize:13,outline:"none",width:180}}/>
                            <Btn color="#4a9eff" onClick={()=>{if(!newProfileName.trim())return;const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}}>Create</Btn>
                            <Btn outline color="#555" onClick={()=>{setAddingProfile(false);setNewProfileName("");}}>Cancel</Btn>
                          </div>
                        ):(
                          <Btn color="#4a9eff" onClick={()=>setAddingProfile(true)}>+ Add First Profile</Btn>
                        )}
                      </Card>
                    )}
                  </div>);
                })()}
              </div>
            </div>);
          }
          // DESKTOP: side-by-side
          return(
            <div style={{display:"flex",height:"calc(100dvh - 122px)",overflow:"hidden"}}>
              <div style={{width:170,background:"#111119",borderRight:"1px solid #1e1e2e",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
                <div style={{padding:"8px 10px",borderBottom:"1px solid #1e1e2e",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:8,letterSpacing:"2px",color:"#444",textTransform:"uppercase"}}>Surgeons</span>
                  <Btn small color="#34a876" onClick={()=>setShowAddSurg(true)} style={{padding:"2px 7px",fontSize:9}}>+ Add</Btn>
                </div>
                <div style={{overflowY:"auto",flex:1}}>
                  {surgeons.map(s=>{const sc2=SPEC_COLOR[s.specialty]||"#888",isSel=selSurgId===s.id&&surgView==="surgeon";return(
                    <div key={s.id} style={{borderBottom:"1px solid #161620",background:isSel?"#161628":"transparent",borderLeft:"3px solid "+(isSel?sc2:"transparent")}}>
                      {confirmDeleteSurgId===s.id?(
                        <div style={{padding:"8px 10px",background:"#1e0a0a"}}>
                          <div style={{fontSize:10,color:"#e05060",marginBottom:7}}>Delete {s.name}?</div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{setSurgeons(p=>p.filter(x=>x.id!==s.id));if(selSurgId===s.id){const r=surgeons.filter(x=>x.id!==s.id);setSelSurgId(r[0]?.id||null);}setConfirmDeleteSurgId(null);}} style={{flex:1,padding:"4px 0",background:"#e05060",border:"none",borderRadius:5,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                            <button onClick={()=>setConfirmDeleteSurgId(null)} style={{flex:1,padding:"4px 0",background:"#1e1e2e",border:"1px solid #2a2a3e",borderRadius:5,color:"#aaa",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                          </div>
                        </div>
                      ):(
                        <div style={{display:"flex",alignItems:"center"}}>
                          <div onClick={()=>{setSelSurgId(s.id);setSurgView("surgeon");setAddingProfile(false);const tids=Object.keys(s.procedurePrefs);if(tids.length){setSelProcTab(tids[0]);setPrefSection("sets");}}} style={{flex:1,padding:"9px 10px",cursor:"pointer"}}>
                            <div style={{fontSize:12,fontWeight:600,color:"#ddd8cc"}}>{s.name}</div>
                            <div style={{fontSize:10,color:sc2,marginTop:1,fontStyle:"italic"}}>{s.specialty}</div>
                            <div style={{fontSize:9,color:"#333",marginTop:1}}>{Object.keys(s.procedurePrefs).length} profiles</div>
                          </div>
                          <button onClick={()=>setConfirmDeleteSurgId(s.id)} style={{background:"none",border:"none",color:"#2a2a3e",cursor:"pointer",fontSize:16,padding:"0 8px",flexShrink:0,lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#e05060"} onMouseLeave={e=>e.currentTarget.style.color="#2a2a3e"}>×</button>
                        </div>
                      )}
                    </div>
                  );})}
                </div>
                <div style={{borderTop:"1px solid #1e1e2e",flexShrink:0}}>
                  <div onClick={()=>setTplPanelOpen(x=>!x)} style={{padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:"#0d0d14"}}>
                    <span style={{fontSize:8,letterSpacing:"2px",color:"#555",textTransform:"uppercase"}}>Templates</span>
                    <span style={{color:"#444",fontSize:10}}>{tplPanelOpen?"▲":"▼"}</span>
                  </div>
                  {tplPanelOpen&&(
                    <div style={{maxHeight:180,overflowY:"auto",background:"#0d0d14"}}>
                      <div style={{padding:"5px 10px",borderBottom:"1px solid #161620"}}><Btn small color="#a060e0" onClick={()=>setShowAddTpl(true)} style={{width:"100%",padding:"4px",fontSize:9}}>+ New Template</Btn></div>
                      {templates.map(t=>{const sc2=SPEC_COLOR[t.specialty]||"#888",isSel=selTplId===t.id&&surgView==="template";return(<div key={t.id} onClick={()=>{setSelTplId(t.id);setSurgView("template");}} style={{padding:"8px 10px",borderBottom:"1px solid #161620",cursor:"pointer",background:isSel?"#16161e":"transparent",borderLeft:"3px solid "+(isSel?sc2:"transparent")}}><div style={{fontSize:11,color:"#ddd8cc"}}>{t.name}</div><div style={{fontSize:9,color:sc2,marginTop:1}}>{t.specialty} · {t.trays.length} sets</div></div>);})}
                      {templates.length===0&&<div style={{padding:"10px",fontSize:10,color:"#333",fontStyle:"italic"}}>No templates yet</div>}
                    </div>
                  )}
                  <div style={{borderTop:"1px solid #1e1e2e",padding:"8px 10px",background:"#0d0d14"}}>
                    <div style={{fontSize:8,letterSpacing:"2px",color:"#34a876",textTransform:"uppercase",marginBottom:6}}>Sets Library</div>
                    <div style={{fontSize:10,color:"#555",marginBottom:8}}>{allTrays.length} sets · managed in Inventory tab</div>
                    <button onClick={()=>setTab("inventory")} style={{width:"100%",padding:"5px 8px",background:"#34a87622",border:"1px solid #34a87644",borderRadius:6,color:"#34a876",fontFamily:"inherit",fontSize:10,fontWeight:700,cursor:"pointer"}}>→ Manage Sets in Inventory</button>
                  </div>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"18px 16px"}}>
                {surgView==="template"?(()=>{
                  if(!selTpl)return<div style={{color:"#333"}}>Select a template</div>;
                  const sc2=SPEC_COLOR[selTpl.specialty]||"#888";
                  const using=surgeons.filter(s=>Object.keys(s.procedurePrefs).includes(selTpl.id));
                  return(<div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
                      <div><div style={{fontSize:9,color:"#555",letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>Template — {selTpl.specialty}</div><div style={{fontSize:20,fontWeight:700,color:"#ddd8cc"}}>{selTpl.name}</div><div style={{fontSize:11,color:"#444",marginTop:3}}>{using.length} surgeon{using.length!==1?"s":""} with custom profiles</div></div>
                      <div style={{display:"flex",gap:8}}><Btn small outline color="#a060e0" onClick={()=>setEditTplId(selTpl.id)}>Edit</Btn><Btn small outline color="#555" onClick={()=>setSurgView("surgeon")}>Back</Btn></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                      <Card><Lbl>Default Sets</Lbl>{selTpl.trays.length===0?<div style={{color:"#333",fontSize:11}}>No sets defined</div>:selTpl.trays.map((t,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:i<selTpl.trays.length-1?"1px solid #161620":"none"}}><div style={{width:6,height:6,borderRadius:"50%",background:sc2,flexShrink:0}}/><span style={{fontSize:12,color:"#ddd8cc"}}>{t}</span></div>))}</Card>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {selTpl.positioning&&<Card><Lbl>Positioning</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{selTpl.positioning}</div></Card>}
                        {selTpl.roomSetup&&<Card><Lbl>Room Setup</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{selTpl.roomSetup}</div></Card>}
                      </div>
                      {selTpl.notes&&<Card accent={sc2+"33"} style={{gridColumn:"1/-1"}}><Lbl>Notes</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{selTpl.notes}</div></Card>}
                    </div>
                    {using.length>0&&<Card><Lbl>Surgeons with Custom Profiles</Lbl>{using.map(s=>(<div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #161620"}}><div><div style={{fontSize:12,color:"#ddd8cc"}}>{s.name}</div><div style={{fontSize:10,color:"#444"}}>{s.facility}</div></div><Btn small outline color="#4a9eff" onClick={()=>{setSelSurgId(s.id);setSelProcTab(selTpl.id);setSurgView("surgeon");setPrefSection("sets");}}>View</Btn></div>))}</Card>}
                  </div>);
                })():(()=>{
                  if(!selSurg)return<div style={{color:"#333",display:"flex",alignItems:"center",justifyContent:"center",height:"60%"}}>Select a surgeon</div>;
                  return(<div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                      <div><div style={{fontSize:10,color:sc,letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>{selSurg.specialty} — {selSurg.status}</div><div style={{fontSize:20,fontWeight:700,color:"#ddd8cc"}}>{selSurg.name}</div><div style={{fontSize:12,color:"#444",marginTop:2}}>{selSurg.facility}</div></div>
                      <Btn small outline color="#ddd8cc" onClick={()=>setEditSurgId(selSurg.id)}>Edit</Btn>
                    </div>
                    <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                      {procIds.map(tid=>{const tpl=gt(tid),isPending=confirmDeleteProfKey===tid;return(
                        <div key={tid} style={{display:"flex",alignItems:"center",borderRadius:20,border:"1px solid "+(isPending?"#e05060":selProcTab===tid?sc:"#2a2a3e"),background:isPending?"#3d1520":selProcTab===tid?sc+"22":"transparent",overflow:"hidden"}}>
                          <button onClick={()=>{setSelProcTab(tid);setPrefSection("sets");setConfirmDeleteProfKey(null);}} style={{padding:"5px 10px",background:"transparent",border:"none",color:isPending?"#e05060":selProcTab===tid?sc:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:selProcTab===tid?700:400}}>{tpl?.name||tid}</button>
                          {isPending
                            ?<><button onClick={()=>{setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:Object.fromEntries(Object.entries(s.procedurePrefs).filter(([k])=>k!==tid))}:s));const remaining=procIds.filter(k=>k!==tid);setSelProcTab(remaining[0]||"");setConfirmDeleteProfKey(null);}} style={{padding:"3px 8px",background:"#e05060",border:"none",color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Del</button><button onClick={()=>setConfirmDeleteProfKey(null)} style={{padding:"3px 8px",background:"transparent",border:"none",color:"#888",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button></>
                            :<button onClick={e=>{e.stopPropagation();setConfirmDeleteProfKey(tid);}} style={{padding:"3px 8px 3px 0",background:"transparent",border:"none",color:"#2a2a3e",fontSize:14,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.color="#e05060"} onMouseLeave={e=>e.currentTarget.style.color="#2a2a3e"}>×</button>
                          }
                        </div>
                      );})}
                      {addingProfile?(
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <input autoFocus value={newProfileName} onChange={e=>setNewProfileName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newProfileName.trim()){const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}if(e.key==="Escape"){setAddingProfile(false);setNewProfileName("");}}} placeholder="Profile name..." style={{padding:"4px 9px",background:"#0d0d14",border:"1px solid #4a9eff",borderRadius:20,color:"#ddd8cc",fontFamily:"inherit",fontSize:11,outline:"none",width:130}}/>
                          <button onClick={()=>{if(!newProfileName.trim())return;const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}} style={{padding:"4px 10px",background:"#4a9eff",border:"none",borderRadius:20,color:"#0d0d14",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add</button>
                          <button onClick={()=>{setAddingProfile(false);setNewProfileName("");}} style={{padding:"4px 8px",background:"transparent",border:"1px solid #2a2a3e",borderRadius:20,color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                        </div>
                      ):(
                        <button onClick={()=>{setAddingProfile(true);setNewProfileName("");}} style={{padding:"5px 12px",borderRadius:20,border:"1px dashed #4a9eff",background:"transparent",color:"#4a9eff",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>+ Add Profile</button>
                      )}
                    </div>
                    {activePref&&activeTpl&&(
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div style={{display:"flex",gap:4}}>{[["sets","Sets"],["notes","Notes"],["hospital","Hospital"],["images","Images"]].map(([k,l])=>(<button key={k} onClick={()=>setPrefSection(k)} style={{padding:"5px 12px",borderRadius:7,border:"1px solid "+(prefSection===k?"#ddd8cc44":"#2a2a3e"),background:prefSection===k?"#1e1e2e":"transparent",color:prefSection===k?"#ddd8cc":"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:prefSection===k?700:400}}>{l}</button>))}</div>
                          <Btn small color={sc} text="#0d0d14" onClick={()=>setEditPrefKey(selProcTab)}>Edit</Btn>
                        </div>
                        {prefSection==="sets"&&<Card><Lbl>Instrument Sets</Lbl>{activePref.trays.length===0?<div style={{color:"#333",fontSize:11}}>No sets. Click Edit to add.</div>:activePref.trays.map((t,i)=>{const hp=!!trayPhotos[t];return(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 0",borderBottom:i<activePref.trays.length-1?"1px solid #161620":"none"}}><div style={{width:6,height:6,borderRadius:"50%",background:sc,flexShrink:0}}/><span style={{fontSize:12,color:"#ddd8cc",flex:1}}>{t}</span>{hp?<img src={trayPhotos[t]} style={{width:30,height:30,borderRadius:5,objectFit:"cover",border:"1px solid #2a2a3e"}}/>:<label style={{cursor:"pointer"}}><span style={{fontSize:10,color:"#333",border:"1px dashed #2a2a3e",borderRadius:5,padding:"2px 6px"}}>+photo</span><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&addTrayPhoto(t,e.target.files[0])}/></label>}</div>);})}</Card>}
                        {prefSection==="notes"&&(()=>{
                          const NF=[["Hospital Sets","hospitalSets","#34a876"],["Room Set-up","roomSetup",null],["Positioning","positioning",null],["Exposure","exposure",null],["Hardware Workflow","hardwareWorkflow","#e0a020"],["Other Key Information","otherInfo","#a060e0"]];
                          const hasTech=activePref.robot||activePref.stealth||activePref.fluoro;
                          const hasAny=hasTech||NF.some(([,k])=>activePref[k]);
                          return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
                            {hasTech&&<Card><Lbl>Technology</Lbl><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{activePref.robot&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#4a9eff18",border:"1px solid #4a9eff",borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:"#4a9eff"}}/><span style={{fontSize:12,color:"#4a9eff",fontWeight:700}}>Robot</span></div>}{activePref.stealth&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#e0506018",border:"1px solid #e05060",borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:"#e05060"}}/><span style={{fontSize:12,color:"#e05060",fontWeight:700}}>Stealth</span></div>}{activePref.fluoro&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#88888818",border:"1px solid #888",borderRadius:7}}><div style={{width:7,height:7,borderRadius:"50%",background:"#888"}}/><span style={{fontSize:12,color:"#888",fontWeight:700}}>Fluoro</span></div>}</div></Card>}
                            {NF.map(([label,k,color])=>activePref[k]?<Card key={k}><Lbl color={color||"#444"}>{label}</Lbl><div style={{fontSize:12,color:"#aaa",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{activePref[k]}</div></Card>:null)}
                            {!hasAny&&<div style={{color:"#333",fontSize:11}}>No notes yet. Click Edit to add.</div>}
                          </div>);
                        })()}
                        {prefSection==="hospital"&&<Card accent="#4a9eff33"><Lbl color="#4a9eff">Hospital and Set Logistics</Lbl>{activePref.hospitalSets?<div style={{fontSize:13,color:"#aaa",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{activePref.hospitalSets}</div>:<div style={{color:"#333",fontSize:12}}>No hospital notes yet. Click Edit to add.</div>}</Card>}
                        {prefSection==="images"&&(()=>{const key=selSurgId+"-"+selProcTab;const photos=prefPhotos[key]||[];return(<Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><Lbl>Procedure Reference Photos</Lbl><label style={{cursor:"pointer"}}><span style={{fontSize:11,color:"#a060e0",border:"1px solid #3a1a6a",borderRadius:6,padding:"4px 12px",fontWeight:700}}>+ Add</span><input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(f=>addPrefPhoto(selSurgId,selProcTab,f));e.target.value="";}}/>
                        </label></div>{photos.length===0?<div style={{color:"#333",fontSize:12,textAlign:"center",padding:"20px 0"}}>No images yet — add positioning guides, OR diagrams, or reference photos.</div>:<div style={{display:"flex",flexWrap:"wrap",gap:10}}>{photos.map((p,i)=>(<div key={i} style={{position:"relative"}}><img src={p.url} style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:"1px solid #2a2a3e",display:"block"}}/><button onClick={()=>remPrefPhoto(selSurgId,selProcTab,i)} style={{position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>{p.name&&<div style={{fontSize:8,color:"#444",marginTop:3,textAlign:"center",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>}</div>))}</div>}</Card>);})()}
                      </div>
                    )}
                    {procIds.length===0&&(
                      <Card style={{textAlign:"center",padding:28}}>
                        <div style={{color:"#444",fontSize:13,marginBottom:16}}>No procedure profiles yet for {selSurg.name}</div>
                        {addingProfile?(
                          <div style={{display:"flex",gap:6,justifyContent:"center",alignItems:"center"}}>
                            <input autoFocus value={newProfileName} onChange={e=>setNewProfileName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newProfileName.trim()){const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}if(e.key==="Escape"){setAddingProfile(false);setNewProfileName("");}}} placeholder="e.g. MIS TLIF, ACDF..." style={{padding:"7px 12px",background:"#0d0d14",border:"1px solid #4a9eff",borderRadius:8,color:"#ddd8cc",fontFamily:"inherit",fontSize:13,outline:"none",width:180}}/>
                            <Btn color="#4a9eff" onClick={()=>{if(!newProfileName.trim())return;const id="tpl-"+Date.now();const nt={id,name:newProfileName.trim(),specialty:selSurg?.specialty||"Spine",trays:[],positioning:"",roomSetup:"",notes:""};setTemplates(p=>[...p,nt]);setSurgeons(p=>p.map(s=>s.id===selSurgId?{...s,procedurePrefs:{...s.procedurePrefs,[id]:nt}}:s));setSelProcTab(id);setEditPrefKey(id);setNewProfileName("");setAddingProfile(false);}}>Create</Btn>
                            <Btn outline color="#555" onClick={()=>{setAddingProfile(false);setNewProfileName("");}}>Cancel</Btn>
                          </div>
                        ):(
                          <Btn color="#4a9eff" onClick={()=>setAddingProfile(true)}>+ Add First Profile</Btn>
                        )}
                      </Card>
                    )}
                  </div>);
                })()}
              </div>
            </div>
          );
        })()}

        {/* TASKS */}
        {tab==="tasks"&&(()=>{
          const TaskCard=({task})=>{const tm=abt(task.assignee);const ps=PRIO[task.priority]||PRIO.medium;return(
            <div style={{background:"#111119",border:"1px solid "+(task.done?"#1e1e2e":ps.bg),borderLeft:"3px solid "+(task.done?"#2a2a3e":ps.c),borderRadius:10,padding:"12px 14px",marginBottom:8,opacity:task.done?0.5:1}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
                <div onClick={()=>setTasks(p=>p.map(t=>t.id===task.id?{...t,done:!t.done}:t))} style={{width:18,height:18,borderRadius:5,border:"2px solid "+(task.done?"#34a876":"#2a2a3e"),background:task.done?"#34a876":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",cursor:"pointer",flexShrink:0,marginTop:1}}>{task.done?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:task.done?"#555":"#ddd8cc",textDecoration:task.done?"line-through":"none"}}>{task.title}</div>
                  {task.notes&&<div style={{fontSize:11,color:"#444",marginTop:3}}>{task.notes}</div>}
                  <div style={{display:"flex",gap:8,alignItems:"center",marginTop:6,flexWrap:"wrap"}}>
                    <Dot id={task.assignee} size={18}/>
                    <span style={{fontSize:10,color:tm.color}}>{tm.name}</span>
                    {task.due&&task.due.length===10&&<span style={{fontSize:10,color:"#444"}}>Due {new Date(task.due+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                    <span style={{fontSize:9,color:ps.c,background:ps.bg,padding:"1px 6px",borderRadius:10,fontWeight:700}}>{task.priority}</span>
                  </div>
                </div>
                <button onClick={()=>setEditTask(task)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:12,padding:0}}>edit</button>
                <button onClick={()=>setTasks(p=>p.filter(t=>t.id!==task.id))} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:15,padding:0}}>×</button>
              </div>
            </div>
          );};
          const loanerTasks=filteredTasks.filter(t=>!!t.loanerRef);
          const coverageTasks=filteredTasks.filter(t=>!t.loanerRef&&t.caseId&&t.setName==="__coverage__");
          const schedulingTasks=filteredTasks.filter(t=>!t.loanerRef&&t.caseId&&t.setName&&t.setName!=="__coverage__");
          const manualTasks=filteredTasks.filter(t=>!t.loanerRef&&!t.caseId);
          const Section=({label,color,items,emptyHide})=>{
            if(emptyHide&&!items.length)return null;
            return(<div style={{marginBottom:20}}>
              <SH color={color} label={label} count={items.length}/>
              {items.length===0?<div style={{fontSize:11,color:"#333",fontStyle:"italic",padding:"8px 0 4px"}}>None</div>:items.map(t=><TaskCard key={t.id} task={t}/>)}
            </div>);
          };
          return(<div style={{padding:16}}>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:4}}>{[["open","Open"],["all","All"],["done","Done"]].map(([v,l])=><button key={v} onClick={()=>setTaskFilter(v)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid",borderColor:taskFilter===v?"#e0a020":"#2a2a3e",background:taskFilter===v?"#3d2e00":"transparent",color:taskFilter===v?"#e0a020":"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:taskFilter===v?700:400}}>{l}</button>)}</div>
              <div style={{display:"flex",gap:4}}>{[["mine","Mine"],["all","All"]].map(([v,l])=><button key={v} onClick={()=>setTaskOwner(v)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid",borderColor:taskOwner===v?"#4a9eff":"#2a2a3e",background:taskOwner===v?"#0d2040":"transparent",color:taskOwner===v?"#4a9eff":"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:taskOwner===v?700:400}}>{l}</button>)}</div>
            </div>
            <Section label="Case Coverage" color="#4a9eff" items={coverageTasks} emptyHide/>
            <Section label="Scheduling — Sets" color="#34a876" items={schedulingTasks} emptyHide/>
            <Section label="Loaners" color="#a060e0" items={loanerTasks} emptyHide/>
            <Section label="General Tasks" color="#e0a020" items={manualTasks} emptyHide/>
            {filteredTasks.length===0&&<div style={{color:"#333",textAlign:"center",padding:40,fontSize:13}}>No tasks found</div>}
          </div>);
        })()}

        {/* LOANERS */}
        {tab==="loaners"&&<div style={{padding:16}}>
          {loaners.length===0&&<Card style={{textAlign:"center",padding:32,marginBottom:16}}>
            <div style={{color:"#444",fontSize:13,marginBottom:12}}>No loaners tracked yet</div>
            <Btn color="#a060e0" onClick={()=>setShowAddLoaner(true)}>+ Add First Loaner</Btn>
          </Card>}
          {loaners.filter(l=>l.status!=="Returned").length>0&&<>
            <SH color="#a060e0" label="Active Loaners" count={loaners.filter(l=>l.status!=="Returned").length}/>
            {loaners.filter(l=>l.status!=="Returned").map(l=>{const sc=LSTC[l.status]||"#888";return(
              <div key={l.id} style={{background:"#111119",border:"1px solid #1e1e2e",borderLeft:"3px solid "+sc,borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontSize:14,fontWeight:700,color:"#ddd8cc"}}>{l.setName}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{l.hospital}</div></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}><Bdg bg={sc+"22"} color={sc}>{l.status}</Bdg><button onClick={()=>setEditLoaner(l)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>edit</button></div>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:8}}>
                  {l.requestedDate&&<div><div style={{fontSize:8,color:"#444",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:2}}>Requested</div><div style={{fontSize:11,color:"#aaa"}}>{new Date(l.requestedDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>}
                  {l.neededDate&&<div><div style={{fontSize:8,color:"#444",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:2}}>Needed By</div><div style={{fontSize:11,color:l.status==="Overdue"?"#e05060":"#aaa"}}>{new Date(l.neededDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>}
                  {l.returnDate&&<div><div style={{fontSize:8,color:"#444",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:2}}>Return By</div><div style={{fontSize:11,color:"#aaa"}}>{new Date(l.returnDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>}
                  {l.assignee&&<div><div style={{fontSize:8,color:"#444",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:2}}>Owner</div><div style={{paddingTop:2}}><Dot id={l.assignee} size={18}/></div></div>}
                </div>
                {l.notes&&<div style={{fontSize:11,color:"#444",marginTop:4,paddingTop:8,borderTop:"1px solid #161620"}}>{l.notes}</div>}
                {l.photo&&<div style={{marginTop:8}}><img src={l.photo} style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:8,border:"1px solid #2a2a3e"}}/></div>}
                {l.fedex&&<a href={"https://www.fedex.com/fedextrack/?trknbr="+l.fedex.replace(/\s/g,"")} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#e0a020",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,marginTop:8,border:"1px solid #e0a02044",borderRadius:5,padding:"2px 8px"}}>📦 Track {l.fedex}</a>}
                <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                  {LSTS.filter(s=>s!==l.status).map(s=><button key={s} onClick={()=>setLoaners(p=>p.map(x=>x.id===l.id?{...x,status:s}:x))} style={{padding:"3px 10px",borderRadius:20,border:"1px solid "+(LSTC[s]||"#444")+"55",background:"transparent",color:LSTC[s]||"#444",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>→ {s}</button>)}
                </div>
              </div>
            )})}
          </>}
          {loaners.filter(l=>l.status==="Returned").length>0&&<>
            <SH color="#4a9eff" label="Returned" count={loaners.filter(l=>l.status==="Returned").length}/>
            {loaners.filter(l=>l.status==="Returned").map(l=>(
              <div key={l.id} style={{background:"#111119",border:"1px solid #1e1e2e",borderRadius:12,padding:"12px 16px",marginBottom:6,opacity:0.75,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,color:"#ddd8cc"}}>{l.setName}</div><div style={{fontSize:10,color:"#555"}}>{l.hospital}</div>{l.fedex&&<a href={"https://www.fedex.com/fedextrack/?trknbr="+l.fedex.replace(/\s/g,"")} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#e0a020",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,marginTop:4,border:"1px solid #e0a02044",borderRadius:5,padding:"2px 6px"}}>📦 {l.fedex}</a>}</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><Bdg bg="#1a3d2b" color="#34a876">Returned</Bdg><button onClick={()=>setEditLoaner(l)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>edit</button><button onClick={()=>setLoaners(p=>p.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:13}}>×</button></div>
              </div>
            ))}
          </>}
        </div>}

        {/* INVENTORY */}
        {tab==="inventory"&&(()=>{
          const allLoc=ALL_LOC(FACS);

          const filtered=assets.filter(a=>{
            const matchSearch=invSearch===""||a.name.toLowerCase().includes(invSearch.toLowerCase())||(a.barcodeId||"").toLowerCase().includes(invSearch.toLowerCase());
            const matchFilter=invFilter==="all"||a.locationId===invFilter||(!a.locationId&&invFilter==="unlocated");
            return matchSearch&&matchFilter;
          });
          const grouped={};
          assets.forEach(a=>{const k=a.locationId||"unlocated";if(!grouped[k])grouped[k]=[];grouped[k].push(a);});
          const locatedCount=assets.filter(a=>a.locationId).length;
          const unlocatedCount=assets.filter(a=>!a.locationId).length;

          // ── Asset detail view ──
          if(selectedAsset){
            const asset=assets.find(a=>a.id===selectedAsset.id)||selectedAsset;
            const loc=asset.locationId?locById(asset.locationId,FACS):null;
            return(<div style={{padding:16}}>
              <button onClick={()=>setSelectedAsset(null)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:12,fontFamily:"inherit",marginBottom:12,padding:0,display:"flex",alignItems:"center",gap:4}}>← Back</button>
              <Card style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:700,color:"#ddd8cc",marginBottom:3}}>{asset.setType||asset.name}</div>
                    {asset.barcodeId?<div style={{fontSize:11,color:"#555",fontFamily:"monospace"}}>Serial #{asset.barcodeId}</div>:<div style={{fontSize:10,color:"#555",fontStyle:"italic"}}>No serial — tap Scan to link one</div>}
                  </div>
                  {loc?<Bdg bg={loc.color+"22"} color={loc.color}>{loc.icon} {loc.label}</Bdg>:<Bdg bg="#2a2a3e" color="#555">📍 Location unknown</Bdg>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <Btn color="#34a876" small onClick={()=>setShowScanMove({asset})}>📍 Move Set</Btn>
                  {!asset.barcodeId&&<Btn color="#34a876" small outline onClick={()=>setShowScanMove({asset,linkBarcode:true})}>⬡ Link Barcode</Btn>}
                  <Btn color="#e05060" small outline onClick={()=>{if(window.confirm("Remove "+asset.name+" from inventory?"))setAssets(p=>p.filter(a=>a.id!==asset.id));setSelectedAsset(null);}}>Remove</Btn>
                </div>
              </Card>
              {/* ── Set Photos ── */}
              <Card style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <Lbl style={{margin:0}}>Set Photos</Lbl>
                  <label style={{cursor:"pointer"}}>
                    <span style={{fontSize:11,color:"#34a876",border:"1px solid #34a87644",borderRadius:6,padding:"4px 12px",fontWeight:700}}>+ Add Photo</span>
                    <input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={e=>{
                      Array.from(e.target.files).forEach(file=>{
                        const reader=new FileReader();
                        reader.onload=ev=>setAssets(p=>p.map(a=>a.id!==asset.id?a:{...a,photos:[...(a.photos||[]),{name:file.name,url:ev.target.result,addedBy:u,date:new Date()}]}));
                        reader.readAsDataURL(file);
                      });
                      e.target.value="";
                    }}/>
                  </label>
                </div>
                {(asset.photos||[]).length===0
                  ?<div style={{fontSize:11,color:"#333",textAlign:"center",padding:"16px 0",border:"1px dashed #1e1e2e",borderRadius:8}}>No photos yet — add a reference image of what this set should look like</div>
                  :<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {(asset.photos||[]).map((p,i)=>{
                      const rep=p.addedBy?abt(p.addedBy):null;
                      return(<div key={i} style={{position:"relative"}}>
                        <img src={p.url} style={{width:88,height:88,objectFit:"cover",borderRadius:8,border:"1px solid #2a2a3e",display:"block",cursor:"pointer"}} onClick={()=>window.open(p.url,"_blank")}/>
                        <button onClick={()=>setAssets(prev=>prev.map(a=>a.id!==asset.id?a:{...a,photos:(a.photos||[]).filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:"#e05060",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
                        {rep&&<div style={{fontSize:8,color:rep.color,marginTop:3,textAlign:"center"}}>{rep.name.split(" ")[0]}</div>}
                      </div>);
                    })}
                  </div>}
              </Card>
              <Lbl>Movement History</Lbl>
              {(asset.history||[]).length===0&&<div style={{color:"#333",fontSize:12,fontStyle:"italic",padding:"12px 0"}}>No movement history yet.</div>}
              {(asset.history||[]).map((h,i)=>{
                const fromL=h.from?locById(h.from,FACS):null;
                const toL=h.to?locById(h.to,FACS):null;
                const rep=h.by?abt(h.by):null;
                return(<div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #161620",alignItems:"flex-start"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:toL?.color||"#555",marginTop:5,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#ddd8cc"}}>
                      {fromL?<><span style={{color:fromL.color}}>{fromL.label}</span><span style={{color:"#555"}}> → </span></>:null}
                      {toL?<span style={{color:toL.color}}>{toL.label}</span>:<span style={{color:"#555"}}>Registered</span>}
                      {h.caseId&&<span style={{fontSize:10,color:"#4a9eff",marginLeft:6}}>📋 Case</span>}
                    </div>
                    <div style={{fontSize:10,color:"#444",marginTop:2,display:"flex",gap:8}}>
                      <span>{h.date instanceof Date?h.date.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}</span>
                      {rep&&<span style={{color:rep.color}}>{rep.name.split(" ")[0]}</span>}
                    </div>
                  </div>
                </div>);
              })}
            </div>);
          }

          // ── Main inventory view ──
          return(<div style={{padding:isMobile?10:16,paddingBottom:isMobile?80:16}}>

            {/* Sub-tabs: Sets | Locations */}
            <div style={{display:"flex",borderBottom:"1px solid #1e1e2e",marginBottom:14}}>
              {[["sets","All Sets ("+assets.length+")"],["locations","By Location"]].map(([id,label])=>(
                <button key={id} onClick={()=>setInvTab(id)} style={{flex:1,padding:"8px",background:"transparent",border:"none",borderBottom:"2px solid "+(invTab===id?"#34a876":"transparent"),color:invTab===id?"#34a876":"#555",fontSize:12,fontWeight:invTab===id?700:400,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
              ))}
            </div>

            {/* Add by name + import row */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input value={newTray} onChange={e=>setNewTray(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&newTray.trim()){syncAssetToLibrary(newTray.trim());setNewTray("");}}}
                placeholder="Add set by name..." style={{flex:1,padding:"8px 10px",background:"#0d0d14",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none"}}/>
              <Btn color="#34a876" small onClick={()=>{if(newTray.trim()){syncAssetToLibrary(newTray.trim());setNewTray("");}}}>Add</Btn>
              <label style={{cursor:"pointer",padding:"5px 10px",background:"#e0a02022",border:"1px solid #e0a02044",borderRadius:7,color:"#e0a020",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                📥 Excel<input type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{if(e.target.files[0])importExcel(e.target.files[0]);e.target.value="";}}/>
              </label>
            </div>
            {importMsg&&<div style={{fontSize:11,color:"#34a876",padding:"5px 10px",background:"#0d1a0d",border:"1px solid #34a87633",borderRadius:6,marginBottom:10}}>{importMsg}</div>}

            {/* Search */}
            <input value={invSearch} onChange={e=>setInvSearch(e.target.value)} placeholder="Search sets or barcode ID..." style={{width:"100%",padding:"8px 11px",background:"#111119",border:"1px solid #2a2a3e",borderRadius:7,color:"#ddd8cc",fontFamily:"inherit",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10}}/>

            {invTab==="sets"&&(<div>
              {/* Unlocated notice */}
              {unlocatedCount>0&&invFilter==="all"&&invSearch===""&&(
                <div onClick={()=>setInvFilter(invFilter==="unlocated"?"all":"unlocated")} style={{padding:"8px 12px",background:"#1a1a0d",border:"1px solid #e0a02044",borderLeft:"3px solid #e0a020",borderRadius:8,marginBottom:10,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#e0a020",fontWeight:700}}>⚠ {unlocatedCount} sets not yet scanned</span>
                  <span style={{fontSize:10,color:"#e0a020"}}>{invFilter==="unlocated"?"Show all →":"View →"}</span>
                </div>
              )}
              {/* Location filter pills */}
              {assets.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                <button onClick={()=>setInvFilter("all")} style={{padding:"3px 9px",borderRadius:20,border:"1px solid",borderColor:invFilter==="all"?"#ddd8cc":"#2a2a3e",background:invFilter==="all"?"#1e1e2e":"transparent",color:invFilter==="all"?"#ddd8cc":"#555",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>All</button>
                {Object.entries(grouped).sort((a,b)=>b[1].length-a[1].length).map(([locId,items])=>{
                  const loc=locId==="unlocated"?{color:"#e0a020",icon:"⚠",label:"Not scanned"}:locById(locId,FACS);
                  return(<button key={locId} onClick={()=>setInvFilter(invFilter===locId?"all":locId)} style={{padding:"3px 9px",borderRadius:20,border:"1px solid",borderColor:invFilter===locId?loc.color:"#2a2a3e",background:invFilter===locId?loc.color+"22":"transparent",color:invFilter===locId?loc.color:"#555",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{loc.icon} {loc.label} ({items.length})</button>);
                })}
              </div>}
              {assets.length===0?(
                <Card style={{textAlign:"center",padding:28}}>
                  <div style={{fontSize:24,marginBottom:8}}>⬡</div>
                  <div style={{color:"#aaa",fontSize:13,fontWeight:700,marginBottom:4}}>No sets yet</div>
                  <div style={{color:"#444",fontSize:11,marginBottom:14}}>Add by name above, import from Excel, or scan a Globus barcode</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <Btn color="#34a876" small onClick={()=>setShowScanMove(true)}>⬡ Scan</Btn>
                    <Btn color="#e0a020" small onClick={()=>setShowBulkScan(true)}>⬡⬡ Bulk Scan</Btn>
                  </div>
                </Card>
              ):(
                <div>
                  {filtered.length===0&&<div style={{color:"#333",textAlign:"center",padding:24,fontSize:12}}>No sets match</div>}
                  {filtered.map(asset=>{
                    const loc=asset.locationId?locById(asset.locationId,FACS):null;
                    const last=asset.history?.[0];
                    return(<div key={asset.id} onClick={()=>setSelectedAsset(asset)} style={{background:"#111119",border:"1px solid #1e1e2e",borderLeft:"3px solid "+(loc?.color||"#e0a020"),borderRadius:9,padding:"10px 12px",marginBottom:6,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                      {(asset.photos||[]).length>0&&<img src={asset.photos[0].url} style={{width:42,height:42,objectFit:"cover",borderRadius:7,border:"1px solid #2a2a3e",flexShrink:0}}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#ddd8cc",marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{asset.setType||asset.name}</div>
                        {asset.barcodeId&&<div style={{fontSize:10,color:"#555",fontFamily:"monospace",marginBottom:2}}>#{asset.barcodeId}</div>}
                        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                          {loc?<Bdg bg={loc.color+"22"} color={loc.color} sm>{loc.icon} {loc.label}</Bdg>:<Bdg bg="#1a1a0d" color="#e0a020" sm>⚠ Not scanned</Bdg>}
                          {last&&<span style={{fontSize:9,color:"#333"}}>{last.date instanceof Date?last.date.toLocaleDateString("en-US",{month:"short",day:"numeric"}):""}</span>}
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setShowScanMove({asset});}} style={{background:"#34a87618",border:"1px solid #34a87644",color:"#34a876",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>Move</button>
                    </div>);
                  })}
                </div>
              )}
            </div>)}

            {invTab==="locations"&&(<div>
              {Object.keys(grouped).length===0&&<div style={{color:"#333",fontSize:12,textAlign:"center",padding:24}}>No sets yet</div>}
              {[...Object.entries(grouped)].sort((a,b)=>b[1].length-a[1].length).map(([locId,items])=>{
                const loc=locId==="unlocated"?{color:"#e0a020",icon:"⚠",label:"Not yet scanned"}:locById(locId,FACS);
                return(<div key={locId} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:loc.color+"18",border:"1px solid "+loc.color+"33",borderRadius:8,marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:loc.color}}>{loc.icon} {loc.label}</span>
                    <Bdg bg={loc.color+"33"} color={loc.color}>{items.length} sets</Bdg>
                  </div>
                  {items.map(asset=>(
                    <div key={asset.id} onClick={()=>setSelectedAsset(asset)} style={{padding:"6px 12px",marginBottom:3,background:"#0d0d14",border:"1px solid #161620",borderRadius:7,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:"#ddd8cc"}}>{asset.name}</span>
                      {asset.barcodeId&&<span style={{fontSize:9,color:"#34a876"}}>⬡</span>}
                    </div>
                  ))}
                </div>);
              })}
            </div>)}
          </div>);
        })()}
      </div>
      {/* Modals */}
      {showCaseModal&&<CaseModal surgeons={surgeons} allTrays={allTrays} currentUser={u} initialDate={newCaseDate} onSave={c=>{setCases(p=>[...p,c]);setSelCaseId(c.id);setShowCaseModal(false);setNewCaseDate(null);}} onClose={()=>{setShowCaseModal(false);setNewCaseDate(null);}}/>}
      {showAddSurg&&<SurgModal surg={null} onSave={saveSurg} onClose={()=>setShowAddSurg(false)}/>}
      {editSurgId&&<SurgModal surg={surgeons.find(s=>s.id===editSurgId)} onSave={saveSurg} onClose={()=>setEditSurgId(null)}/>}
      {editPrefKey&&selSurg&&<PrefModal surg={selSurg} templateId={editPrefKey} templates={templates} allTrays={allTrays} prefPhotos={prefPhotos} setPrefPhotos={setPrefPhotos} onSave={savePref} onClose={()=>setEditPrefKey(null)}/>}
      {showAddTpl&&<TplModal tpl={null} allTrays={allTrays} onSave={saveTpl} onClose={()=>setShowAddTpl(false)}/>}
      {editTplId&&<TplModal tpl={templates.find(t=>t.id===editTplId)} allTrays={allTrays} onSave={saveTpl} onClose={()=>setEditTplId(null)}/>}
      {showAddTask&&<TaskModal task={null} cases={cases} surgeons={surgeons} currentUser={u} onSave={saveTask} onClose={()=>setShowAddTask(false)}/>}
      {editTask&&<TaskModal task={editTask} cases={cases} surgeons={surgeons} currentUser={u} onSave={saveTask} onClose={()=>setEditTask(null)}/>}
      {(showAddLoaner||editLoaner)&&<LoanerModal loaner={editLoaner} currentUser={u} onSave={saveLoaner} onClose={()=>{setShowAddLoaner(false);setEditLoaner(null)}}/>}
      {showBulkScan&&<BulkScanModal currentUser={u} assets={assets} allLoc={ALL_LOC(FACS)} onComplete={(moves,newAssets)=>{
        let updatedAssets=[...assets];
        newAssets.forEach(a=>{if(!updatedAssets.find(x=>x.barcodeId===a.barcodeId))updatedAssets=[...updatedAssets,a];});
        moves.forEach(({assetId,toLocId,by})=>{
          updatedAssets=updatedAssets.map(a=>a.id!==assetId?a:{...a,locationId:toLocId,history:[{date:new Date(),from:a.locationId,to:toLocId,by},...(a.history||[])]});
        });
        setAssets(updatedAssets);
        applyAutoConfirms(updatedAssets,moves,newAssets,cases);
        setShowBulkScan(false);
      }} onClose={()=>setShowBulkScan(false)}/> }
      {(showScanMove!==false)&&(()=>{
        const allLoc=ALL_LOC(FACS);
        const assetForMove=showScanMove?.asset||null;
        return<ScanMoveModal
          currentUser={u}
          assets={assets}
          allLoc={allLoc}
          allTrays={allTrays}
          initialAsset={assetForMove}
          onRegister={(barcodeId,setType,locId,by,photos)=>{
            const newA={id:"ast-"+Date.now(),barcodeId,name:setType+(barcodeId?" — "+barcodeId:""),setType,locationId:locId,photos:photos||[],history:[{date:new Date(),from:null,to:locId,by}]};
            setAssets(p=>[...p,newA]);
            applyAutoConfirms([...assets,newA],[],[newA],cases);
            setSelectedAsset(newA);
          }}
          onMove={(assetId,toLocId,by)=>{
            let movedAsset=null;
            setAssets(p=>p.map(a=>{
              if(a.id!==assetId)return a;
              movedAsset={...a,locationId:toLocId,history:[{date:new Date(),from:a.locationId,to:toLocId,by},...(a.history||[])]};
              return movedAsset;
            }));
            if(movedAsset)setTimeout(()=>applyAutoConfirms([...assets.map(a=>a.id===assetId?{...a,locationId:toLocId}:a)],[{assetId,toLocId,by}],[],cases),0);
          }}
          onClose={()=>setShowScanMove(false)}/>;
      })()}
    </div>
  );
}

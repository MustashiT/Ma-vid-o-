import numpy as np, cv2, json, subprocess, sys, math
SRC=sys.argv[1]; OUT=sys.argv[2]; PREVIEW=len(sys.argv)>3
FPS=30; W,H=1080,1920; CW,CH=608,1080
ev=json.load(open('events.json')); B=60/ev['bpm']; BAR=4*B; DROP=ev['drop']; DUR=ev['dur']
def load(path,ss=None,t=None):
    cmd=['ffmpeg','-v','error']+(['-ss',str(ss)] if ss is not None else [])+(['-t',str(t)] if t else [])+['-i',path]
    if path==SRC: cmd+=['-vf',f'crop={CW}:{CH}:656:0']
    cmd+=['-f','rawvideo','-pix_fmt','bgr24','-']
    raw=subprocess.run(cmd,capture_output=True).stdout
    return np.frombuffer(raw,np.uint8).reshape(-1,CH,CW,3)
orig=load(SRC); ORIG_FPS=59.0
act=load('action120.mp4'); ACT0=17.8; ACT_FPS=120.0
print('loaded',orig.shape,act.shape,flush=True)
def src_frame(t):
    if ACT0<=t<ACT0+len(act)/ACT_FPS-0.01: return act[min(len(act)-1,int(round((t-ACT0)*ACT_FPS)))]
    return orig[min(len(orig)-1,int(round(t*ORIG_FPS)))]
K=[3.692,6.923,11.077,14.308]  # kill impacts (out time)
DROPT=DROP
segs=[ # out0,out1,src0,src1,tag
 (0,B,20.12,20.42,'teaser'),
 (B,2*B,3.8,4.5,'cut'),(2*B,3*B,10.8,11.5,'cut'),(3*B,4*B,12.1,12.8,'cut'),
 (4*B,5*B,16.0,16.7,'cut'),(5*B,6*B,16.7,17.35,'cut'),
 (6*B,8*B,17.35,18.0,'build'),
 (DROP,DROP+3*B,18.0,18.45,'kill'),
 (DROP+3*B,DROP+7*B,18.45,20.15,'run'),
 (DROP+7*B,DROP+10*B,20.15,20.6,'kill'),
 (DROP+10*B,DROP+10.5*B,20.15,20.38,'stut'),(DROP+10.5*B,DROP+11*B,20.15,20.38,'stut'),
 (DROP+11*B,DROP+16*B,20.6,24.95,'fast'),
 (DROP+16*B,DROP+19*B,24.95,25.4,'kill'),
 (DROP+19*B,DROP+23*B,25.4,27.05,'run'),
 (DROP+23*B,DROP+26*B,27.05,27.5,'kill'),
 (DROP+26*B,DROP+27*B,27.05,27.3,'stut'),(DROP+27*B,DROP+28*B,27.05,27.3,'stut'),
 (DROP+28*B,DUR,18.02,18.42,'outro'),
]
def seg_at(t):
    for s in segs:
        if s[0]<=t<s[1]: return s
    return segs[-1]
def src_time(t,s):
    u=(t-s[0])/(s[1]-s[0])
    if s[4]=='kill': u=1-(1-u)**1.6 if False else u**0.8   # slight ramp
    if s[4]=='outro': u=1-(1-u)**3
    return s[2]+(s[3]-s[2])*u
kicks=np.array(ev['kicks']); snares=np.array(ev['snares'])
def since(t,arr):
    d=t-arr[arr<=t+1e-6]; return d.min() if len(d) else 99
cuts=[s[0] for s in segs]
# grade LUT
x=np.arange(256)/255.0
lift=np.power(x,0.62)
sc=lambda v,c: 1/(1+np.exp(-c*(v-0.5)))
curve=(sc(lift,6)-sc(0,6))/(sc(1,6)-sc(0,6))
lutB=np.clip((curve*1.06+0.02)*255,0,255).astype(np.uint8)
lutG=np.clip((curve*0.98)*255,0,255).astype(np.uint8)
lutR=np.clip((curve*1.02)*255,0,255).astype(np.uint8)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
vig=1-0.55*(((xx-W/2)/(W*0.75))**2+((yy-H/2)/(H*0.62))**2)
vig=np.clip(vig,0.25,1)[...,None]
rng=np.random.default_rng(3)
grain=[(rng.standard_normal((H//2,W//2)).astype(np.float32)) for _ in range(8)]
def mblur(img,k,ang=0):
    if k<3: return img
    ker=np.zeros((k,k),np.float32); ker[k//2,:]=1/k
    if ang: ker=cv2.warpAffine(ker,cv2.getRotationMatrix2D((k/2,k/2),ang,1),(k,k))
    return cv2.filter2D(img,-1,ker)
def render(i):
    t=i/FPS; s=seg_at(t); tag=s[4]
    st=src_time(t,s)
    if tag=='fast':  # motion blur via multi-sample
        dt=(s[3]-s[2])/(s[1]-s[0])/FPS
        fr=np.mean([src_frame(st-dt*j/3).astype(np.float32) for j in range(3)],0).astype(np.uint8)
    else: fr=src_frame(st)
    dk=since(t,kicks); ds=since(t,snares); dK=since(t,np.array(K)); dC=since(t,np.array(cuts))
    dD=t-DROPT
    z=1.13
    if t>=DROPT: z+=0.06*math.exp(-dk/0.09)
    z+=0.25*math.exp(-dK/0.22)
    if tag=='build': z+=0.22*((t-s[0])/(s[1]-s[0]))**2
    if tag=='kill': z+=0.10*min(1,(t-s[0])/(s[1]-s[0]))
    if tag=='outro': z+=0.15*((t-s[0])/(s[1]-s[0]))
    if tag=='teaser': z+=0.15
    amp=45*math.exp(-dK/0.18)+(12*math.exp(-ds/0.1) if t>=DROPT else 0)+(25*math.exp(-dC/0.08) if tag in('cut','stut') else 0)
    rr=np.random.default_rng(i)
    ox,oy=rr.uniform(-1,1,2)*amp
    rot=2.5*math.exp(-dK/0.2)*rr.uniform(-1,1)
    if tag=='cut' and dC<0.07: ox+= (1 if int(s[0]/B)%2 else -1)*160*(1-dC/0.07)
    scale=W/CW*z
    M=cv2.getRotationMatrix2D((CW/2,CH/2),rot,scale)
    M[0,2]+=W/2-CW/2+ox; M[1,2]+=H/2-CH/2+oy
    img=cv2.warpAffine(fr,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT)
    # whip blur on cuts / impacts
    if tag in('cut','stut') and dC<0.07: img=mblur(img,41)
    if dK<0.06: img=mblur(img,25,90)
    b,g,r=cv2.split(img); img=cv2.merge([cv2.LUT(b,lutB),cv2.LUT(g,lutG),cv2.LUT(r,lutR)])
    img=cv2.filter2D(img,-1,np.array([[0,-0.6,0],[-0.6,3.4,-0.6],[0,-0.6,0]],np.float32))
    f=img.astype(np.float32)/255
    gray=f.mean(2,keepdims=True)
    sat=1.45
    if tag=='kill': sat=1.25
    if tag=='outro': sat=1.45-1.4*min(1,(t-s[0])/(s[1]-s[0])*1.3)
    if t<DROPT and tag!='teaser': sat=1.2
    f=gray+(f-gray)*sat
    # red boost (phonk) — push reds
    f[...,2]=f[...,2]*1.08
    # RGB split
    sh=int(32*math.exp(-dK/0.14)+(7*math.exp(-dk/0.06) if t>=DROPT else 0)+(18 if tag=='teaser' else 0)+(14*math.exp(-dC/0.1) if tag=='stut' else 0))
    if sh>1:
        f[...,2]=np.roll(f[...,2],sh,1); f[...,0]=np.roll(f[...,0],-sh,1)
    # glitch slices
    if tag=='teaser' or (tag=='stut' and dC<0.12) or dK<0.05:
        for _ in range(7):
            y0=rr.integers(0,H-120); hh=rr.integers(20,140); f[y0:y0+hh]=np.roll(f[y0:y0+hh],rr.integers(-120,120),1)
    f*=vig
    if tag=='build':
        u=(t-s[0])/(s[1]-s[0]); f*=1-0.85*max(0,(u-0.6)/0.4)**1.5
    flash=0.9*math.exp(-dK/0.07)+(0.12*math.exp(-ds/0.05) if t>=DROPT else 0)+(0.35*math.exp(-dC/0.05) if tag in('cut','stut') else 0)
    f=f+flash*(1-f)
    gr=cv2.resize(grain[i%8],(W,H))[...,None]
    f+=gr*0.025
    if 0<=dD<1.5/FPS and dD>=1/FPS-1e-6: f=1-f   # 1 negative frame after drop flash
    if t>=DUR-1/FPS-1e-6: pass
    return (np.clip(f,0,1)*255).astype(np.uint8)
N=int(round(DUR*FPS))
frames=range(0,N,1) if not PREVIEW else [int(x) for x in sys.argv[3].split(',')]
if PREVIEW:
    for i in frames: cv2.imwrite(f'prev_{i:04d}.jpg',cv2.resize(render(i),(360,640)))
    sys.exit()
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','music.wav',
  '-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-profile:v','high','-c:a','aac','-b:a','320k','-shortest','-movflags','+faststart',OUT],stdin=subprocess.PIPE)
for i in frames:
    p.stdin.write(render(i).tobytes())
    if i%60==0: print(i,'/',N,flush=True)
p.stdin.close(); p.wait(); print('done')

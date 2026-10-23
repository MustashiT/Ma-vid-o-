# DbD chase edit: bigger vertical framing, beat-cut, drop on the close call, freeze + silence on the down
import numpy as np, cv2, subprocess, sys, math
SRC=sys.argv[1]; OUT=sys.argv[2]; PREVIEW=sys.argv[3] if len(sys.argv)>3 else None
FPS=30; W,H=1080,1920; SW,SH=1280,720
raw=subprocess.run(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','bgr24','-'],capture_output=True).stdout
V=np.frombuffer(raw,np.uint8).reshape(-1,SH,SW,3)
def fr(t): return V[min(len(V)-1,max(0,int(round(t*30))))]
MUS0=8.0           # music offset used (drop of the track at 15.24)
DROP=15.24-MUS0
BAR=3.4286; BEAT=BAR/4
FREEZE=24.878-MUS0 # strong bass hit -> freeze on the down
END=FREEZE+1.35
segs=[(0,1.451,0.6),(1.451,3.165,4.6),(3.165,4.879,8.3),(4.879,6.592,11.6),(6.592,DROP,13.9),
      (DROP,18.02-MUS0,14.95),(18.02-MUS0,21.45-MUS0,19.0),(21.45-MUS0,FREEZE,26.10-(FREEZE-(21.45-MUS0)))]
cuts=[s[0] for s in segs]
kicks=[k-MUS0 for k in [15.24,17.38,18.099,18.593,20.01,20.803,21.456,22.095,24.24]]
def since(t,arr):
    d=[t-a for a in arr if a<=t+1e-6]; return min(d) if d else 99
x=np.arange(256)/255.0; lift=np.power(x,0.72); sc=lambda v:1/(1+np.exp(-5.5*(v-0.5)))
LUT=np.clip((sc(lift)-sc(0))/(sc(1)-sc(0))*255,0,255).astype(np.uint8)
CW,CH=540,720
def render(i):
    t=i/FPS
    frz=t>=FREEZE
    if frz: src=26.2; s=segs[-1]
    else:
        s=next(g for g in segs if g[0]<=t<g[1]); src=s[2]+(t-s[0])
    f0=fr(src)
    dk=since(t,kicks) if t>=DROP else 99; dc=since(t,cuts); dd=t-DROP; df=t-FREEZE
    z=1.0+0.06*math.exp(-dk/0.1)+(0.18*math.exp(-dd/0.3) if dd>=0 else 0)
    if 6.592<=t<DROP: z+=0.12*((t-6.592)/(DROP-6.592))**2      # build-up push-in
    if frz: z=1.15+0.10*min(1,df/1.35)
    amp=(18*math.exp(-dk/0.08))+(40*math.exp(-dd/0.15) if dd>=0 else 0)+(25*math.exp(-df/0.12) if frz else 0)
    rr=np.random.default_rng(i); ox,oy=rr.uniform(-1,1,2)*amp
    if dc<0.1 and not frz: ox+=(1 if int(t*7)%2 else -1)*140*(1-dc/0.1)
    cx=SW/2; cy=SH/2
    M=cv2.getRotationMatrix2D((cx,cy),0,(W/CW)*z); M[0,2]+=W/2-cx+ox; M[1,2]+=H/2-cy+oy
    fg=cv2.warpAffine(f0,M,(W,1440+0),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT) if False else None
    M2=M.copy(); M2[1,2]-=(H-1440)/2
    fg=cv2.warpAffine(f0,M2,(W,1440),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT)
    bg=cv2.resize(f0,(int(SW*H/SH/3),H//3)); bg=cv2.GaussianBlur(bg,(0,0),9)
    bg=cv2.resize(bg,(int(SW*H/SH),H)); ox0=(bg.shape[1]-W)//2; bg=bg[:,ox0:ox0+W]
    img=bg.copy(); img=(img*0.45).astype(np.uint8); img[240:1680]=fg
    if dc<0.1 and not frz:
        k=int(51*(1-dc/0.1))|1
        if k>3: img=cv2.blur(img,(k,1))
    img=cv2.LUT(img,LUT)
    img=cv2.filter2D(img,-1,np.array([[0,-0.5,0],[-0.5,3,-0.5],[0,-0.5,0]],np.float32))
    f=img.astype(np.float32)/255
    g=f.mean(2,keepdims=True)
    if frz: f=g*np.array([0.95,1.0,1.05],np.float32)        # cold B&W freeze
    else: f=g+(f-g)*1.35
    sh=int((26*math.exp(-dd/0.15) if dd>=0 else 0)+6*math.exp(-dk/0.07)+(14*math.exp(-df/0.25) if frz else 0))
    if sh>1: f[...,2]=np.roll(f[...,2],sh,1); f[...,0]=np.roll(f[...,0],-sh,1)
    yy=np.linspace(-1,1,H)[:,None,None]; xx=np.linspace(-1,1,W)[None,:,None]
    f*=np.clip(1-0.4*(xx**2*0.8+yy**2*0.6),0.35,1)
    flash=(0.85*math.exp(-dd/0.08) if dd>=0 else 0)+(0.9*math.exp(-df/0.06) if frz else 0)+0.08*math.exp(-dk/0.05)
    f=f+flash*(1-f)
    return (np.clip(f,0,1)*255).astype(np.uint8)
N=int(round(END*FPS))
if PREVIEW:
    for i in map(int,PREVIEW.split(',')): cv2.imwrite(f'p3_{i:04d}.jpg',cv2.resize(render(i),(270,480)))
    sys.exit()
# music: user's track from MUS0, hard cut to silence on the freeze
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(MUS0),'-t',f'{FREEZE:.3f}','-i','tt_st.wav','-af','afade=t=out:st=%.3f:d=0.02'%(FREEZE-0.02),'-ar','44100','m1.wav'])
subprocess.run(['ffmpeg','-v','error','-y','-i','m1.wav','-af','apad=whole_dur=%.3f'%END,'m2.wav'])
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','m2.wav',
  '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest','-movflags','+faststart',OUT],stdin=subprocess.PIPE)
for i in range(N): p.stdin.write(render(i).tobytes())
p.stdin.close(); p.wait(); print('done',END)

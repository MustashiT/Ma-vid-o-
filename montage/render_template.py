# Recreates the CapCut "VIDEO I-V / skull" template structure on the user's clip
import numpy as np, cv2, subprocess, sys, math
SRC=sys.argv[1]; OUT=sys.argv[2]; PREVIEW=sys.argv[3] if len(sys.argv)>3 else None
FPS=60; W,H=1080,1920; CW,CH=608,1080
def load(path):
    cmd=['ffmpeg','-v','error','-i',path]+(['-vf',f'crop={CW}:{CH}:656:0'] if path==SRC else [])+['-f','rawvideo','-pix_fmt','bgr24','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,np.uint8).reshape(-1,CH,CW,3)
orig=load(SRC); act=load('action120.mp4'); ACT0=17.8
def src_frame(t):
    if ACT0<=t<ACT0+len(act)/120-0.01: return act[min(len(act)-1,int(round((t-ACT0)*120)))]
    return orig[min(len(orig)-1,int(round(t*59.0)))]
END=23.283
# (out0,out1,src0,src1,is_kill) — cut points measured frame-exact from the reference template
# kill parts = freeze frame on the kill + skull, like the reference template
segs=[(0,7.683,10.367,18.05,0),(7.683,8.750,18.05,18.05,1),
      (8.750,10.783,18.167,20.2,0),(10.783,11.850,20.2,20.2,1),
      (11.850,13.850,23.1,25.1,0),(13.850,14.883,25.1,25.1,1),
      (14.883,16.917,25.067,27.1,0),(16.917,18.050,27.1,27.1,1),
      (18.050,20.017,16.083,18.05,0),(20.017,END,18.05,18.05,1)]
sk=cv2.imread('skull.png',cv2.IMREAD_UNCHANGED); SK=128
sk=cv2.resize(sk,(SK,SK),interpolation=cv2.INTER_AREA)
SKA=sk[...,3:4].astype(np.float32)/255; SKC=sk[...,:3].astype(np.float32)
x=np.arange(256)/255.0; lift=np.power(x,0.62); sc=lambda v: 1/(1+np.exp(-5*(v-0.5)))
LUT=np.clip((sc(lift)-sc(0))/(sc(1)-sc(0))*255,0,255).astype(np.uint8)
# shake keyframes for the kill entry (fraction of H): up -> down -> up -> settle
KT=[0,0.033,0.067,0.1,0.15,0.2]; KY=[-0.35,0.25,-0.10,0.03,0.0,0.0]
def render(i):
    t=i/FPS
    s=next((g for g in segs if g[0]<=t<g[1]),segs[-1])
    u=(t-s[0])/(s[1]-s[0]); st=s[2]+(s[3]-s[2])*u
    fr=src_frame(st); tau=t-s[0]; kill=s[4]
    oy=0.0; blurk=0
    if kill:
        oy=float(np.interp(tau,KT,KY))*H
        vel=abs(np.interp(tau+1/FPS,KT,KY)-np.interp(tau,KT,KY))*H
        blurk=int(min(260,vel*1.6))
        oy+=math.sin(t*37)*H*0.003*min(1,tau/0.2)  # lingering micro-shake
    z=1.15; scale=W/CW*z
    M=np.float32([[scale,0,W/2-CW/2*scale],[0,scale,H/2-CH/2*scale+oy]])
    img=cv2.warpAffine(fr,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT)
    img=cv2.LUT(img,LUT)
    img=cv2.filter2D(img,-1,np.array([[0,-0.4,0],[-0.4,2.6,-0.4],[0,-0.4,0]],np.float32))
    if kill:  # skull sits in the frame so it shakes/blurs with it
        cy=int(H*0.5+W*0.2+oy)-SK//2; cx=W//2-SK//2
        if 0<=cy<=H-SK:
            roi=img[cy:cy+SK,cx:cx+SK].astype(np.float32)
            img[cy:cy+SK,cx:cx+SK]=(roi*(1-SKA)+SKC*SKA).astype(np.uint8)
    f=img.astype(np.float32)/255
    if kill:
        if blurk>2: f=cv2.blur(f,(1,blurk))
        f=cv2.blur(f,(1,9))*0.5+f*0.5  # soft vertical smear like the template
        lum=f.mean(2,keepdims=True)
        sep=lum*np.array([0.80,0.98,1.12],np.float32)  # BGR warm sepia
        f=sep*0.75+f*0.25
        small=cv2.resize(f,(W//4,H//4)); glow=cv2.resize(cv2.GaussianBlur(small,(0,0),6),(W,H))
        f=f*0.8+glow*0.45
        f=f*0.62+0.02
        sh=7; f[...,2]=np.roll(f[...,2],sh,1); f[...,0]=np.roll(f[...,0],-sh,1)
        # entry flash profile measured on reference: dark, bright, dip, settle
        f*=float(np.interp(tau,[0,0.017,0.033,0.05,0.083,0.12],[0.5,0.55,1.45,0.8,1.05,1.0]))
        yy=np.linspace(-1,1,H)[:,None,None]; xx=np.linspace(-1,1,W)[None,:,None]
        f*=np.clip(1-0.35*(xx**2+yy**2),0.4,1)
    a=min(1,t/0.45)*min(1,max(0,(END-t)/(END-22.75)))
    f*=a
    return (np.clip(f,0,1)*255).astype(np.uint8)
N=int(round(END*FPS))
if PREVIEW:
    for i in map(int,PREVIEW.split(',')): cv2.imwrite(f'p2_{i:05d}.jpg',cv2.resize(render(i),(270,480)))
    sys.exit()
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','ref_music.wav',
  '-c:v','libx264','-preset','medium','-crf','19','-maxrate','25M','-bufsize','50M','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest','-movflags','+faststart',OUT],stdin=subprocess.PIPE)
for i in range(N):
    p.stdin.write(render(i).tobytes())
    if i%240==0: print(i,'/',N,flush=True)
p.stdin.close(); p.wait(); print('done')
